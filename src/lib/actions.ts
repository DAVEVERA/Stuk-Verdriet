"use server";

import { createHash, createSign, randomUUID } from "crypto";
import { readFileSync } from "fs";
import { appendFile, mkdir } from "fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { encodeAuthNext } from "@/lib/auth-redirect";
import { clearLocalAdminSession } from "@/lib/local-admin";
import { normalizeSectionDesign } from "@/lib/section-design";
import { assertSameOriginRequest, consumeRateLimit, getRequestOrigin, requestIpAddress } from "@/lib/request-guard";
import { isEmailAdmin, createSupabaseAdminClient, createSupabasePublicClient, createSupabaseServerClient } from "@/lib/supabase";
import { canUsePulseMoment } from "@/lib/pulse-moments";
import {
  COMMUNITY_MEDIA_BUCKET,
  isCommunityMediaKind,
  isOwnedCommunityMediaPath
} from "@/lib/community-media";
import {
  derivePulseTitle,
  isPulseComposerSchemaError,
  sanitizePulseBackgroundStyle,
  sanitizePulseLayers,
  sanitizePulseMediaManifest,
  type PulseAnimation,
  type PulseMediaItem
} from "@/lib/pulse-media";
import { sendPushToUser } from "@/lib/push";
import type { PodcastEpisode, PodcastLinkCard, PodcastTranscriptSegment } from "@/types/content";

const linkCardTypes: PodcastLinkCard["type"][] = ["link", "spotify", "podimo", "apple", "book", "donation"];
const communityImageMaxSize = 4 * 1024 * 1024;
const communityImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const communityImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const siteLogoMaxSize = 5 * 1024 * 1024;
const siteLogoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const siteLogoExtensions = new Set(["jpg", "jpeg", "png", "webp", "svg"]);
const communityAvatarMaxSize = 3 * 1024 * 1024;
const communityCoverMaxSize = 5 * 1024 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const signupRateLimitWindowMs = 10 * 60 * 1000;
const signupRateLimitMax = 5;
const communityReportTypes = new Set(["post", "reply", "image", "language"]);
const communityReportCategories = new Set(["ongepast", "taalgebruik", "afbeelding", "spam", "veiligheid", "anders"]);

type EpisodeSignupPayload = {
  name: string;
  email: string;
  source: string;
  status: "subscribed";
  updated_at: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safePathPart(value: string) {
  return slugify(value) || "bestand";
}

function parseLinkCards(value: FormDataEntryValue | null): PodcastLinkCard[] {
  if (!value) return [];
  try {
    const cards = JSON.parse(String(value));
    if (!Array.isArray(cards)) return [];
    return cards
      .map((card) => ({
        label: String(card?.label ?? "").trim(),
        url: String(card?.url ?? "").trim(),
        description: String(card?.description ?? "").trim() || null,
        type: linkCardTypes.includes(card?.type) ? (card.type as PodcastLinkCard["type"]) : "link"
      }))
      .filter((card) => card.label && card.url)
      .slice(0, 8);
  } catch {
    return [];
  }
}

function getUploadFile(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

function fileExtension(file: File, fallback: string) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,8}$/.test(fromName)) return fromName;
  const fromType = file.type.split("/").pop()?.toLowerCase();
  return fromType && /^[a-z0-9]{2,8}$/.test(fromType) ? fromType : fallback;
}

function safeReturnPath(value: FormDataEntryValue | null, fallback: "/community" | "/community/profiel" | "/bijsluiter") {
  const path = String(value ?? "").trim();
  return path === "/bijsluiter" || path === "/community" || path.startsWith("/community/") ? path : fallback;
}

function signupRedirectTarget(formData: FormData, status: string) {
  const returnTo = String(formData.get("return_to") ?? "").trim();
  const anchor = String(formData.get("return_anchor") ?? "aanmelden").trim();
  const safePath = returnTo === "/podcast" ? "/podcast" : "/";
  const safeAnchor = /^[a-z0-9_-]+$/i.test(anchor) ? anchor : "aanmelden";
  return `${safePath}?signup=${encodeURIComponent(status)}#${safeAnchor}`;
}

async function queueLocalEpisodeSignup(payload: EpisodeSignupPayload, reason: string) {
  await mkdir("output", { recursive: true });
  await appendFile(
    "output/episode-signups.local.jsonl",
    `${JSON.stringify({
      ...payload,
      queued_at: new Date().toISOString(),
      reason
    })}\n`,
    "utf8"
  );
}

async function saveEpisodeSignup(payload: EpisodeSignupPayload) {
  const publicClient = createSupabasePublicClient();
  if (!publicClient) return { ok: false, reason: "missing-supabase" };

  const { error } = await publicClient.from("episode_signups").insert(payload);
  if (!error || error.code === "23505") return { ok: true, reason: "public" };

  console.error("[signup] public insert failed", { code: error.code, message: error.message });

  const admin = createSupabaseAdminClient();
  if (admin) {
    const { error: adminError } = await admin.from("episode_signups").upsert(payload, { onConflict: "email" });
    if (!adminError) return { ok: true, reason: "admin-fallback" };
    console.error("[signup] admin fallback failed", { code: adminError.code, message: adminError.message });
  }

  if (process.env.NODE_ENV !== "production") {
    await queueLocalEpisodeSignup(payload, error.code ?? "public-insert-failed");
    return { ok: true, reason: "local-dev-queue" };
  }

  return { ok: false, reason: error.code ?? "public-insert-failed" };
}

function normalizePostType(value: FormDataEntryValue | null) {
  const postType = String(value ?? "story").trim();
  return ["story", "question", "tip", "link"].includes(postType) ? postType : "story";
}

function optionalUrl(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function withReturnStatus(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

function adminReturnTarget(formData: FormData, status: "saved" | "error", code: string, fallbackTab = "today") {
  const rawTab = String(formData.get("return_tab") ?? fallbackTab).trim();
  const tab = /^[a-z0-9-]+$/i.test(rawTab) ? rawTab : fallbackTab;
  return `/admin?tab=${encodeURIComponent(tab)}&${status}=${encodeURIComponent(code)}`;
}

function moderationHash(value: string | null | undefined) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;
  const pepper = process.env.MODERATION_HASH_PEPPER ?? process.env.NEXTAUTH_SECRET ?? "stuk-verdriet-community";
  return createHash("sha256").update(`${pepper}:${raw}`).digest("hex");
}

async function fileSha256(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return createHash("sha256").update(buffer).digest("hex");
}

function isAllowedCommunityImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.size <= communityImageMaxSize && communityImageTypes.has(file.type) && communityImageExtensions.has(extension);
}

function isAllowedCommunityAvatar(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.size <= communityAvatarMaxSize && communityImageTypes.has(file.type) && communityImageExtensions.has(extension);
}

function isAllowedCommunityCover(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.size <= communityCoverMaxSize && communityImageTypes.has(file.type) && communityImageExtensions.has(extension);
}

function isAllowedSiteLogo(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.size <= siteLogoMaxSize && siteLogoTypes.has(file.type) && siteLogoExtensions.has(extension);
}

function profileText(formData: FormData, name: string, maxLength = 160) {
  return String(formData.get(name) ?? "").trim().slice(0, maxLength);
}

function normalizedPulseAnimation(value: FormDataEntryValue | null): PulseAnimation {
  const animation = String(value ?? "fade").trim();
  return ["fade", "float", "pulse", "rise", "still"].includes(animation) ? animation as PulseAnimation : "fade";
}

function normalizedPulseVisibility(value: FormDataEntryValue | null) {
  const visibility = String(value ?? "connections").trim();
  return ["private", "connections", "community"].includes(visibility) ? visibility : "connections";
}

function normalizedPulseStatus(value: FormDataEntryValue | null) {
  const status = String(value ?? "published").trim();
  return ["draft", "published", "archived"].includes(status) ? status : "published";
}

function normalizedCommunityVisibility(value: FormDataEntryValue | null) {
  const visibility = String(value ?? "connections").trim();
  return ["private", "connections", "community"].includes(visibility) ? visibility : "connections";
}

function normalizedActiveStatus(value: FormDataEntryValue | null) {
  const status = String(value ?? "active").trim();
  return ["active", "hidden", "archived"].includes(status) ? status : "active";
}

function optionalIsoDate(value: string) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function normalizedHexColor(value: FormDataEntryValue | null, fallback = "#2f4b3a") {
  const color = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

async function uploadPublicFile(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  bucket: string,
  folder: string,
  file: File,
  fallbackExtension: string,
  errorPath = "/admin"
) {
  const path = `${folder}/${Date.now()}-${safePathPart(file.name)}.${fileExtension(file, fallbackExtension)}`;
  let error: unknown = null;
  try {
    const result = await admin.storage.from(bucket).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: true
    });
    error = result.error;
  } catch (failure) {
    const record = failure && typeof failure === "object" ? failure as Record<string, unknown> : null;
    console.error("[storage] public upload failed", {
      bucket,
      name: failure instanceof Error ? failure.name : "OperationError",
      ...(typeof record?.status === "number" ? { status: record.status } : {})
    });
    redirect(withReturnStatus(errorPath, "error", bucket));
  }
  if (error) redirect(withReturnStatus(errorPath, "error", bucket));
  const {
    data: { publicUrl }
  } = admin.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

type ProfileMediaFailureStage = "avatar-upload" | "cover-upload" | "profile-read" | "profile-write";

function profileMediaFailureDetails(stage: ProfileMediaFailureStage, failure: unknown) {
  const record = failure && typeof failure === "object" ? failure as Record<string, unknown> : null;
  const rawCode = record?.code;
  const rawStatus = record?.status ?? record?.statusCode;
  return {
    stage,
    name: failure instanceof Error ? failure.name : "OperationError",
    ...(typeof rawCode === "string" && /^[a-z0-9_-]{1,40}$/i.test(rawCode) ? { code: rawCode } : {}),
    ...(typeof rawStatus === "number" && Number.isFinite(rawStatus) ? { status: rawStatus } : {})
  };
}

function logProfileMediaFailure(stage: ProfileMediaFailureStage, failure: unknown) {
  console.error("[profile-media] operation failed", profileMediaFailureDetails(stage, failure));
}

async function uploadCommunityProfileMediaFile(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  folder: string,
  file: File,
  stage: "avatar-upload" | "cover-upload"
) {
  const path = `${folder}/${Date.now()}-${safePathPart(file.name)}.${fileExtension(file, "jpg")}`;
  try {
    const { error } = await admin.storage.from("community-profile-media").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
      upsert: true
    });
    if (error) {
      logProfileMediaFailure(stage, error);
      return null;
    }
    const {
      data: { publicUrl }
    } = admin.storage.from("community-profile-media").getPublicUrl(path);
    if (!publicUrl) {
      logProfileMediaFailure(stage, { code: "missing_public_url" });
      return null;
    }
    return publicUrl;
  } catch (failure) {
    logProfileMediaFailure(stage, failure);
    return null;
  }
}

async function ownedCommunityMediaPublicUrl(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string,
  kind: "profile-avatar" | "profile-cover" | "feed-image",
  path: string
) {
  if (!isOwnedCommunityMediaPath(userId, kind, path)) return null;
  const separator = path.lastIndexOf("/");
  const folder = path.slice(0, separator);
  const fileName = path.slice(separator + 1);
  try {
    const { data, error } = await admin.storage.from(COMMUNITY_MEDIA_BUCKET).list(folder, { search: fileName, limit: 2 });
    if (error || !data?.some((entry) => entry.name === fileName)) return null;
    return admin.storage.from(COMMUNITY_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl || null;
  } catch {
    return null;
  }
}

async function requireAdminClient() {
  const server = await createSupabaseServerClient();
  const {
    data: { user }
  } = server ? await server.auth.getUser() : { data: { user: null } };
  const email = user?.email?.toLowerCase();
  const supabaseAdminAllowed = email ? await isEmailAdmin(email) : false;
  if (!supabaseAdminAllowed) redirect("/admin?error=unauthorized");

  const admin = createSupabaseAdminClient();
  if (!admin) redirect("/admin?missing=service-role");
  return admin;
}

type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
};

type SpeechOperation = {
  name?: string;
  done?: boolean;
  error?: { message?: string };
  response?: {
    results?: Record<string, {
      transcript?: {
        results?: Array<{
          resultEndOffset?: string;
          alternatives?: Array<{
            transcript?: string;
            words?: Array<{
              word?: string;
              startOffset?: string;
              endOffset?: string;
            }>;
          }>;
        }>;
      };
    }>;
  };
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function getGoogleServiceAccount(): GoogleServiceAccount | null {
  const inline = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON;
  if (inline) {
    try {
      const account = JSON.parse(inline) as GoogleServiceAccount;
      return account.client_email && account.private_key ? account : null;
    } catch {
      return null;
    }
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) return null;
  try {
    const account = JSON.parse(readFileSync(credentialsPath, "utf8")) as GoogleServiceAccount;
    return account.client_email && account.private_key ? account : null;
  } catch {
    return null;
  }
}

async function getGoogleAccessToken() {
  const account = getGoogleServiceAccount();
  if (!account) throw new Error("missing-google-service-account");

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    })
  );
  const privateKey = account.private_key.replace(/\\n/g, "\n");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  signer.end();
  const assertion = `${header}.${claim}.${base64Url(signer.sign(privateKey))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  if (!response.ok) throw new Error("google-token");
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("google-token");
  return data.access_token;
}

function getGoogleSpeechConfig() {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? "global";
  const bucket = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
  if (!project || !bucket) throw new Error("missing-google-config");
  return {
    project,
    location,
    bucket,
    model: process.env.GOOGLE_SPEECH_MODEL ?? "chirp_2",
    language: "nl-NL"
  };
}

function absoluteAudioUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(url, siteUrl).toString();
}

function gcsPublicUrl(bucket: string, objectName: string) {
  return `https://storage.googleapis.com/${bucket}/${objectName.split("/").map(encodeURIComponent).join("/")}`;
}

function extensionFromAudio(url: string, contentType: string | null) {
  const pathExtension = new URL(url).pathname.split(".").pop()?.toLowerCase();
  if (pathExtension && /^[a-z0-9]{2,8}$/.test(pathExtension)) return pathExtension;
  if (contentType?.includes("mpeg")) return "mp3";
  if (contentType?.includes("wav")) return "wav";
  if (contentType?.includes("ogg")) return "ogg";
  return "audio";
}

async function uploadGoogleStorageObject(bucket: string, objectName: string, body: BlobPart, contentType: string, token: string) {
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent(objectName)}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": contentType
    },
    body: new Blob([body], { type: contentType })
  });
  if (!response.ok) throw new Error("gcs-upload");
  return `gs://${bucket}/${objectName}`;
}

function offsetToSeconds(value?: string) {
  if (!value) return 0;
  const match = value.match(/^(\d+)(?:\.(\d+))?s$/);
  if (!match) return 0;
  return Number(match[1]) + Number(`0.${match[2] ?? "0"}`);
}

function parseSpeechSegments(operation: SpeechOperation): PodcastTranscriptSegment[] {
  const files = Object.values(operation.response?.results ?? {});
  return files.flatMap((file) =>
    (file.transcript?.results ?? [])
      .map((result) => {
        const alternative = result.alternatives?.[0];
        const text = alternative?.transcript?.trim() ?? "";
        if (!text) return null;
        const firstWord = alternative?.words?.[0];
        const lastWord = alternative?.words?.[alternative.words.length - 1];
        const start = offsetToSeconds(firstWord?.startOffset);
        const end = offsetToSeconds(lastWord?.endOffset) || offsetToSeconds(result.resultEndOffset) || start + 4;
        return { start, end: Math.max(end, start + 0.5), text };
      })
      .filter((segment): segment is PodcastTranscriptSegment => Boolean(segment))
  );
}

function formatVttTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  const ms = Math.round((seconds - whole) * 1000);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function segmentsToVtt(segments: PodcastTranscriptSegment[]) {
  return `WEBVTT\n\n${segments
    .map((segment, index) => `${index + 1}\n${formatVttTime(segment.start)} --> ${formatVttTime(segment.end)}\n${segment.text}`)
    .join("\n\n")}\n`;
}

async function getEpisodeForTranscript(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, episodeId: string) {
  const { data, error } = await admin.from("podcast_episodes").select("*").eq("id", episodeId).single();
  if (error || !data) throw new Error("episode-not-found");
  return data as PodcastEpisode;
}

export async function signInWithProvider(provider: "google", formData?: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?missing=supabase");
  const siteUrl = await getRequestOrigin();
  const next = safeReturnPath(formData?.get("next") ?? null, "/community");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(encodeAuthNext(next))}` }
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOut(formData?: FormData) {
  const supabase = await createSupabaseServerClient();
  const next = safeReturnPath(formData?.get("next") ?? null, "/community");
  if (supabase) await supabase.auth.signOut();
  redirect(next);
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  await clearLocalAdminSession();
  redirect("/admin");
}

async function requireCommunityUser(returnPath = "/community") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  return { supabase, user };
}

async function ensureCommunityProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null }) {
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  const fallbackName = typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
    ? user.user_metadata.full_name.trim()
    : user.email?.split("@")[0] ?? "SNAAR gebruiker";
  await admin
    .from("community_profiles")
    .upsert(
      {
        user_id: user.id,
        display_name: fallbackName,
        is_discoverable: false
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
}

export async function updateCommunityProfile(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));

  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!displayName || displayName.length > 80) redirect(withReturnStatus(returnPath, "error", "profile-name"));

  const avatar = getUploadFile(formData, "avatar_file");
  let avatarUrl: string | null | undefined;
  if (avatar) {
    if (!isAllowedCommunityAvatar(avatar)) redirect(withReturnStatus(returnPath, "error", "avatar"));
    avatarUrl = await uploadPublicFile(admin, "community-avatars", `profiles/${user.id}`, avatar, "jpg", returnPath);
  }

  const { error } = await admin.from("community_profiles").upsert({
    user_id: user.id,
    display_name: displayName,
    ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
    is_discoverable: formData.get("is_discoverable") === "on",
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
  if (error) redirect(withReturnStatus(returnPath, "error", "profile-storage"));

  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "saved"));
}

export async function updateCommunityProfileMedia(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));

  const avatar = getUploadFile(formData, "avatar_file");
  const cover = getUploadFile(formData, "cover_file");
  if (!avatar && !cover) redirect(withReturnStatus(returnPath, "error", "profile-media-empty"));
  if (avatar && !isAllowedCommunityAvatar(avatar)) redirect(withReturnStatus(returnPath, "error", "avatar"));
  if (cover && !isAllowedCommunityCover(cover)) redirect(withReturnStatus(returnPath, "error", "cover"));

  const [avatarUrl, coverUrl] = await Promise.all([
    avatar ? uploadCommunityProfileMediaFile(admin, `${user.id}/avatar`, avatar, "avatar-upload") : Promise.resolve(undefined),
    cover ? uploadCommunityProfileMediaFile(admin, `${user.id}/cover`, cover, "cover-upload") : Promise.resolve(undefined)
  ]);
  if ((avatar && !avatarUrl) || (cover && !coverUrl)) {
    redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  }

  let existingProfile: { display_name: string | null } | null = null;
  let profileReadFailure: unknown = null;
  try {
    const result = await admin
      .from("community_profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    existingProfile = result.data;
    profileReadFailure = result.error;
  } catch (failure) {
    profileReadFailure = failure;
  }
  if (profileReadFailure) {
    logProfileMediaFailure("profile-read", profileReadFailure);
    redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  }
  const fallbackName = typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
    ? user.user_metadata.full_name.trim()
    : user.email?.split("@")[0] ?? "SNAAR gebruiker";
  let profileWriteFailure: unknown = null;
  try {
    const { error } = await admin.from("community_profiles").upsert({
      user_id: user.id,
      display_name: existingProfile?.display_name ?? fallbackName,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      ...(coverUrl ? { cover_url: coverUrl } : {}),
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id", ignoreDuplicates: false });
    profileWriteFailure = error;
  } catch (failure) {
    profileWriteFailure = failure;
  }
  if (profileWriteFailure) {
    logProfileMediaFailure("profile-write", profileWriteFailure);
    redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  }

  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "media-saved"));
}

export async function finalizeCommunityProfileMedia(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community/profiel");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const kind = String(formData.get("media_kind") ?? "");
  const path = String(formData.get("media_path") ?? "").trim();
  if (!isCommunityMediaKind(kind) || (kind !== "profile-avatar" && kind !== "profile-cover")) {
    redirect(withReturnStatus(returnPath, "error", "invalid"));
  }
  if (!isOwnedCommunityMediaPath(user.id, kind, path)) {
    redirect(withReturnStatus(returnPath, "error", "invalid"));
  }

  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const publicUrl = await ownedCommunityMediaPublicUrl(admin, user.id, kind, path);
  if (!publicUrl) {
    logProfileMediaFailure(kind === "profile-avatar" ? "avatar-upload" : "cover-upload", { code: "missing_object" });
    redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  }
  let existingProfile: { display_name: string | null } | null = null;
  let profileReadFailure: unknown = null;
  try {
    const result = await admin.from("community_profiles").select("display_name").eq("user_id", user.id).maybeSingle();
    existingProfile = result.data;
    profileReadFailure = result.error;
  } catch (failure) {
    profileReadFailure = failure;
  }
  if (profileReadFailure) {
    logProfileMediaFailure("profile-read", profileReadFailure);
    redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  }

  const fallbackName = typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
    ? user.user_metadata.full_name.trim()
    : user.email?.split("@")[0] ?? "SNAAR gebruiker";
  let profileWriteFailure: unknown = null;
  try {
    const { error } = await admin.from("community_profiles").upsert({
      user_id: user.id,
      display_name: existingProfile?.display_name ?? fallbackName,
      ...(kind === "profile-avatar" ? { avatar_url: publicUrl } : { cover_url: publicUrl }),
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id", ignoreDuplicates: false });
    profileWriteFailure = error;
  } catch (failure) {
    profileWriteFailure = failure;
  }
  if (profileWriteFailure) {
    logProfileMediaFailure("profile-write", profileWriteFailure);
    redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  }

  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "media-saved"));
}

export async function updateCommunityProfileInfo(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));

  const displayName = profileText(formData, "display_name", 80);
  if (!displayName) redirect(withReturnStatus(returnPath, "error", "profile-name"));
  const website = optionalUrl(formData.get("website"));
  const contactEmail = profileText(formData, "contact_email", 254).toLowerCase();
  if (contactEmail && !emailPattern.test(contactEmail)) redirect(withReturnStatus(returnPath, "error", "profile-email"));

  const profileDetails = {
    category: profileText(formData, "category", 80),
    pronouns: profileText(formData, "pronouns", 40),
    hometown: profileText(formData, "hometown", 100),
    current_city: profileText(formData, "current_city", 100),
    relationship_status: profileText(formData, "relationship_status", 60),
    job_title: profileText(formData, "job_title", 100),
    employer: profileText(formData, "employer", 100),
    education: profileText(formData, "education", 160),
    hobbies: profileText(formData, "hobbies", 500),
    interests: profileText(formData, "interests", 500),
    places: profileText(formData, "places", 500),
    website: website ?? "",
    contact_email: contactEmail,
    phone: profileText(formData, "phone", 40),
    instagram: profileText(formData, "instagram", 100),
    facebook: profileText(formData, "facebook", 160),
    tiktok: profileText(formData, "tiktok", 100)
  };

  const { error } = await admin.from("community_profiles").upsert({
    user_id: user.id,
    display_name: displayName,
    bio: profileText(formData, "bio", 500) || null,
    profile_details: profileDetails,
    is_discoverable: formData.get("is_discoverable") === "on",
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
  if (error) redirect(withReturnStatus(returnPath, "error", "profile-storage"));

  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "info-saved"));
}

export async function addCommunityProfilePhoto(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  await ensureCommunityProfile(user);
  const photo = getUploadFile(formData, "photo_file");
  if (!photo || !isAllowedCommunityImage(photo)) redirect(withReturnStatus(returnPath, "error", "photo"));
  const imageUrl = await uploadPublicFile(admin, "community-profile-media", `${user.id}/photos`, photo, "jpg", returnPath);
  const albumId = profileText(formData, "album_id", 64) || null;
  if (albumId) {
    const { data: album } = await admin
      .from("community_profile_albums")
      .select("id")
      .eq("id", albumId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!album) redirect(withReturnStatus(returnPath, "error", "album"));
  }
  const { error } = await admin.from("community_profile_photos").insert({
    user_id: user.id,
    album_id: albumId,
    image_url: imageUrl,
    caption: profileText(formData, "caption", 180) || null,
    alt_text: profileText(formData, "alt_text", 180) || null,
    visibility: normalizedCommunityVisibility(formData.get("visibility")),
    status: "active"
  });
  if (error) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "photo-saved"));
}

export async function createCommunityProfileAlbum(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  await ensureCommunityProfile(user);
  const title = profileText(formData, "title", 80);
  if (!title) redirect(withReturnStatus(returnPath, "error", "album"));
  const { error } = await admin.from("community_profile_albums").insert({
    user_id: user.id,
    title,
    description: profileText(formData, "description", 300) || null,
    visibility: normalizedCommunityVisibility(formData.get("visibility"))
  });
  if (error) redirect(withReturnStatus(returnPath, "error", "album"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "album-saved"));
}

export async function updateCommunityProfileAlbum(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community/profiel");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));

  const albumId = profileText(formData, "album_id", 64);
  const title = profileText(formData, "title", 80);
  if (!albumId || !title) redirect(withReturnStatus(returnPath, "error", "album"));

  const { error } = await admin
    .from("community_profile_albums")
    .update({
      title,
      description: profileText(formData, "description", 300) || null,
      visibility: normalizedCommunityVisibility(formData.get("visibility")),
      updated_at: new Date().toISOString()
    })
    .eq("id", albumId)
    .eq("user_id", user.id);

  if (error) redirect(withReturnStatus(returnPath, "error", "album"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "album-updated"));
}

export async function deleteCommunityProfileAlbum(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community/profiel");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));

  const albumId = profileText(formData, "album_id", 64);
  if (!albumId) redirect(withReturnStatus(returnPath, "error", "album"));

  const { error } = await admin
    .from("community_profile_albums")
    .delete()
    .eq("id", albumId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete album error", error);
    redirect(withReturnStatus(returnPath, "error", "album"));
  }
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "album-deleted"));
}

export async function updateCommunityProfilePhoto(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const photoId = profileText(formData, "photo_id", 64);
  const albumId = profileText(formData, "album_id", 64) || null;
  if (!photoId) redirect(withReturnStatus(returnPath, "error", "photo"));
  if (albumId) {
    const { data: album } = await admin
      .from("community_profile_albums")
      .select("id")
      .eq("id", albumId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!album) redirect(withReturnStatus(returnPath, "error", "album"));
  }
  const { error } = await admin
    .from("community_profile_photos")
    .update({
      album_id: albumId,
      caption: profileText(formData, "caption", 180) || null,
      alt_text: profileText(formData, "alt_text", 180) || null,
      visibility: normalizedCommunityVisibility(formData.get("visibility")),
      status: normalizedActiveStatus(formData.get("status")),
      updated_at: new Date().toISOString()
    })
    .eq("id", photoId)
    .eq("user_id", user.id);
  if (error) redirect(withReturnStatus(returnPath, "error", "photo"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "photo-updated"));
}

export async function deleteCommunityProfilePhoto(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const photoId = profileText(formData, "photo_id", 64);
  if (!photoId) redirect(withReturnStatus(returnPath, "error", "photo"));
  const { error } = await admin
    .from("community_profile_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);
  if (error) redirect(withReturnStatus(returnPath, "error", "photo"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "photo-deleted"));
}

export async function createCommunityProfileEvent(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  await ensureCommunityProfile(user);
  const title = profileText(formData, "title", 120);
  const startsAt = profileText(formData, "starts_at", 40);
  if (!title || !startsAt || Number.isNaN(Date.parse(startsAt))) redirect(withReturnStatus(returnPath, "error", "event"));
  const image = getUploadFile(formData, "event_image");
  if (image && !isAllowedCommunityImage(image)) redirect(withReturnStatus(returnPath, "error", "photo"));
  const imageUrl = image
    ? await uploadPublicFile(admin, "community-profile-media", `${user.id}/events`, image, "jpg", returnPath)
    : null;
  const { error } = await admin.from("community_profile_events").insert({
    user_id: user.id,
    title,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: optionalIsoDate(profileText(formData, "ends_at", 40)),
    location: profileText(formData, "location", 140) || null,
    description: profileText(formData, "description", 1000) || null,
    image_url: imageUrl,
    visibility: normalizedCommunityVisibility(formData.get("visibility")),
    status: "active",
    reminder_enabled: formData.get("remind_me") === "on",
    reminder_note: profileText(formData, "reminder_note", 300) || null
  });
  if (error) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "moment-saved"));
}

export async function updateCommunityProfileEvent(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const eventId = profileText(formData, "event_id", 64);
  const title = profileText(formData, "title", 120);
  const startsAt = profileText(formData, "starts_at", 40);
  if (!eventId || !title || !startsAt || Number.isNaN(Date.parse(startsAt))) redirect(withReturnStatus(returnPath, "error", "event"));
  const image = getUploadFile(formData, "event_image");
  if (image && !isAllowedCommunityImage(image)) redirect(withReturnStatus(returnPath, "error", "photo"));
  const existingImageUrl = profileText(formData, "existing_image_url", 600);
  const imageUrl = image
    ? await uploadPublicFile(admin, "community-profile-media", `${user.id}/events`, image, "jpg", returnPath)
    : existingImageUrl || null;
  const { error } = await admin
    .from("community_profile_events")
    .update({
      title,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: optionalIsoDate(profileText(formData, "ends_at", 40)),
      location: profileText(formData, "location", 140) || null,
      description: profileText(formData, "description", 1000) || null,
      image_url: imageUrl,
      visibility: normalizedCommunityVisibility(formData.get("visibility")),
      status: normalizedActiveStatus(formData.get("status")) === "archived" ? "archived" : "active",
      reminder_enabled: formData.get("remind_me") === "on",
      reminder_note: profileText(formData, "reminder_note", 300) || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", eventId)
    .eq("user_id", user.id);
  if (error) redirect(withReturnStatus(returnPath, "error", "event"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "moment-updated"));
}

export async function sendCommunityFriendRequest(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const addresseeId = profileText(formData, "addressee_id", 64);
  if (!addresseeId || addresseeId === user.id) redirect(withReturnStatus(returnPath, "error", "connection"));
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  await ensureCommunityProfile(user);
  const { data: target } = await admin.from("community_profiles").select("user_id").eq("user_id", addresseeId).eq("is_discoverable", true).maybeSingle();
  if (!target) redirect(withReturnStatus(returnPath, "error", "connection"));
  const { error } = await admin.from("community_friendships").insert({ requester_id: user.id, addressee_id: addresseeId });
  if (error && error.code !== "23505") redirect(withReturnStatus(returnPath, "error", "connection"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "connection-requested"));
}

export async function respondToCommunityFriendRequest(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const friendshipId = profileText(formData, "friendship_id", 64);
  const response = String(formData.get("response") ?? "");
  if (!friendshipId || !["accepted", "declined"].includes(response)) redirect(withReturnStatus(returnPath, "error", "connection"));
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const { error } = await admin.from("community_friendships").update({
    status: response,
    updated_at: new Date().toISOString()
  }).eq("id", friendshipId).eq("addressee_id", user.id).eq("status", "pending");
  if (error) redirect(withReturnStatus(returnPath, "error", "connection"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", response === "accepted" ? "connection-accepted" : "connection-declined"));
}

export async function deleteCommunityProfileEvent(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const eventId = profileText(formData, "event_id", 64);
  if (!eventId) redirect(withReturnStatus(returnPath, "error", "event"));
  const { error } = await admin.from("community_profile_events").delete().eq("id", eventId).eq("user_id", user.id);
  if (error) redirect(withReturnStatus(returnPath, "error", "event"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "moment-deleted"));
}

export async function deleteCommunityConnection(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const friendshipId = profileText(formData, "friendship_id", 64);
  if (!friendshipId) redirect(withReturnStatus(returnPath, "error", "connection"));
  const { error } = await admin
    .from("community_friendships")
    .delete()
    .eq("id", friendshipId)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
  if (error) redirect(withReturnStatus(returnPath, "error", "connection"));
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "connection-removed"));
}

export async function saveCommunityPulseMoment(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  try {
    await ensureCommunityProfile(user);
  } catch (failure) {
    console.error("[pulse] profile preparation failed", { name: failure instanceof Error ? failure.name : "OperationError" });
    redirect(withReturnStatus(returnPath, "error", "pulse"));
  }

  const requestedTitle = profileText(formData, "title", 120);
  const body = profileText(formData, "body", 1000);
  const animation = normalizedPulseAnimation(formData.get("animation"));
  const visibility = normalizedPulseVisibility(formData.get("visibility"));
  const status = normalizedPulseStatus(formData.get("status"));
  const backgroundColor = normalizedHexColor(formData.get("background_color"));
  const backgroundStyle = sanitizePulseBackgroundStyle(profileText(formData, "background_style", 60));
  const image = getUploadFile(formData, "pulse_image");
  if (image && !isAllowedCommunityImage(image)) redirect(withReturnStatus(returnPath, "error", "photo"));
  const existingImageUrl = profileText(formData, "existing_image_url", 600);
  const imageUrl = image
    ? await uploadPublicFile(admin, "community-profile-media", `${user.id}/aan-de-pols`, image, "jpg", returnPath)
    : existingImageUrl || null;
  const layers = sanitizePulseLayers(String(formData.get("layers_json") ?? ""), animation);
  const mediaManifest = sanitizePulseMediaManifest(String(formData.get("media_manifest_json") ?? ""));
  if (imageUrl && !mediaManifest.items.some((item) => item.url === imageUrl)) {
    const legacyItem: PulseMediaItem = {
      id: "legacy-image",
      type: "image",
      url: imageUrl,
      provider: "upload",
      cropX: 50,
      cropY: 50,
      zoom: 1,
      alt: requestedTitle || body || "Momentfoto"
    };
    mediaManifest.items.unshift(legacyItem);
    mediaManifest.items = mediaManifest.items.slice(0, 8);
  }
  const visualImageUrl = mediaManifest.items.find((item) => ["image", "gif", "icon"].includes(item.type))?.url ?? imageUrl;
  const title = derivePulseTitle(requestedTitle, body, layers, mediaManifest.items.length > 0);
  const momentId = profileText(formData, "moment_id", 64);

  const legacyPayload = {
    user_id: user.id,
    title,
    body: body || null,
    image_url: visualImageUrl,
    background_color: backgroundColor,
    animation,
    visibility,
    status,
    layers,
    ai_prompt: null,
    ai_generation_id: null,
    ai_generation_status: "not_requested",
    ai_estimated_price_cents: 0,
    ai_payment_status: "not_required",
    ai_render_orientation: null,
    stripe_payment_link: null,
    stripe_buy_button_id: null,
    updated_at: new Date().toISOString()
  };
  const payload = { ...legacyPayload, background_style: backgroundStyle, media_manifest: mediaManifest };
  const pulseAdmin = admin;

  async function writeMoment(writePayload: typeof payload | typeof legacyPayload) {
    return momentId
      ? pulseAdmin.from("community_pulse_moments").update(writePayload).eq("id", momentId).eq("user_id", user.id)
      : pulseAdmin.from("community_pulse_moments").insert(writePayload);
  }
  let result: Awaited<ReturnType<typeof writeMoment>>;
  try {
    result = await writeMoment(payload);
  } catch (failure) {
    console.error("[pulse] save failed", { name: failure instanceof Error ? failure.name : "OperationError" });
    redirect(withReturnStatus(returnPath, "error", "pulse"));
  }
  if (isPulseComposerSchemaError(result.error)) {
    console.warn("Pulse composer schema is not deployed; saving the legacy fields", {
      code: result.error?.code,
      operation: momentId ? "update" : "insert"
    });
    try {
      result = await writeMoment(legacyPayload);
    } catch (failure) {
      console.error("[pulse] legacy save failed", { name: failure instanceof Error ? failure.name : "OperationError" });
      redirect(withReturnStatus(returnPath, "error", "pulse"));
    }
  }
  if (result.error) redirect(withReturnStatus(returnPath, "error", "pulse"));
  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "pulse-saved"));
}

export async function deleteCommunityPulseMoment(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const momentId = profileText(formData, "moment_id", 64);
  if (!momentId) redirect(withReturnStatus(returnPath, "error", "pulse"));
  const { error } = await admin.from("community_pulse_moments").delete().eq("id", momentId).eq("user_id", user.id);
  if (error) redirect(withReturnStatus(returnPath, "error", "pulse"));
  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "pulse-deleted"));
}

export async function deleteCommunityPost(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const postId = profileText(formData, "post_id", 64);
  if (!postId) redirect(withReturnStatus(returnPath, "error", "activity"));
  const { error } = await admin.from("community_posts").delete().eq("id", postId).eq("user_id", user.id);
  if (error) redirect(withReturnStatus(returnPath, "error", "activity"));
  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "post-deleted"));
}

export async function deleteCommunityReply(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  const replyId = profileText(formData, "reply_id", 64);
  if (!replyId) redirect(withReturnStatus(returnPath, "error", "activity"));
  const { error } = await admin.from("community_replies").delete().eq("id", replyId).eq("user_id", user.id);
  if (error) redirect(withReturnStatus(returnPath, "error", "activity"));
  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "reply-deleted"));
}

export async function deleteCommunityAccount(formData: FormData) {
  const returnPath = "/community/profiel";
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "invalid"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));

  const confirmation = profileText(formData, "confirm_text", 40);
  if (confirmation !== "VERWIJDER") redirect(withReturnStatus(returnPath, "error", "account-confirm"));

  const mode = String(formData.get("mode") ?? "").trim();
  if (mode !== "anonymize" && mode !== "erase") redirect(withReturnStatus(returnPath, "error", "account-confirm"));

  if (mode === "erase") {
    await admin.from("community_posts").delete().eq("user_id", user.id);
    await admin.from("community_replies").delete().eq("user_id", user.id);
  } else {
    await admin
      .from("community_posts")
      .update({ author_name: "Verwijderde gebruiker" })
      .eq("user_id", user.id);
    await admin
      .from("community_replies")
      .update({ author_name: "Verwijderde gebruiker" })
      .eq("user_id", user.id);
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) redirect(withReturnStatus(returnPath, "error", "account-delete"));

  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();

  redirect("/community?account=deleted");
}

export async function reactToCommunityPulseMoment(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "pulse"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  await ensureCommunityProfile(user);
  const momentId = profileText(formData, "moment_id", 64);
  if (!momentId) redirect(withReturnStatus(returnPath, "error", "pulse"));
  if (!(await canUsePulseMoment(admin, user.id, momentId))) redirect(withReturnStatus(returnPath, "error", "pulse"));
  const { error } = await admin.from("community_pulse_reactions").upsert({ moment_id: momentId, user_id: user.id }, { onConflict: "moment_id,user_id" });
  if (error) redirect(withReturnStatus(returnPath, "error", "pulse"));
  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "pulse-reacted"));
}

export async function saveCommunityPulseMomentBookmark(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(withReturnStatus(returnPath, "error", "pulse"));
  const { user } = await requireCommunityUser(returnPath);
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(withReturnStatus(returnPath, "error", "profile-storage"));
  await ensureCommunityProfile(user);
  const momentId = profileText(formData, "moment_id", 64);
  if (!momentId) redirect(withReturnStatus(returnPath, "error", "pulse"));
  if (!(await canUsePulseMoment(admin, user.id, momentId))) redirect(withReturnStatus(returnPath, "error", "pulse"));
  const { error } = await admin.from("community_pulse_saves").upsert({ moment_id: momentId, user_id: user.id }, { onConflict: "moment_id,user_id" });
  if (error) redirect(withReturnStatus(returnPath, "error", "pulse"));
  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(withReturnStatus(returnPath, "profile", "pulse-saved-bookmark"));
}

export async function startCommunityConversation(formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(`${returnPath}?error=chat-create`);
  const participantUserId = String(formData.get("participant_user_id") ?? "").trim();
  const { user } = await requireCommunityUser(returnPath);
  if (!participantUserId || participantUserId === user.id) redirect(`${returnPath}?error=chat-target`);

  const admin = createSupabaseAdminClient();
  if (!admin) redirect(`${returnPath}?error=chat-service`);
  await ensureCommunityProfile(user);

  const { data: targetProfile } = await admin
    .from("community_profiles")
    .select("user_id")
    .eq("user_id", participantUserId)
    .eq("is_discoverable", true)
    .maybeSingle();
  if (!targetProfile) redirect(`${returnPath}?error=chat-target`);

  const { data: myConversations } = await admin
    .from("community_conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);
  const existingIds = (myConversations ?? []).map((row) => row.conversation_id).filter(Boolean);

  if (existingIds.length) {
    const { data: existing } = await admin
      .from("community_conversation_participants")
      .select("conversation_id")
      .eq("user_id", participantUserId)
      .in("conversation_id", existingIds)
      .limit(1)
      .maybeSingle();
    if (existing?.conversation_id) {
      revalidatePath("/community");
      redirect(`${returnPath}?conversation=${encodeURIComponent(existing.conversation_id)}`);
    }
  }

  const { data: conversation, error } = await admin
    .from("community_conversations")
    .insert({ created_by: user.id })
    .select("id")
    .single();
  if (error || !conversation?.id) redirect(`${returnPath}?error=chat-create`);

  const { error: participantsError } = await admin.from("community_conversation_participants").insert([
    { conversation_id: conversation.id, user_id: user.id },
    { conversation_id: conversation.id, user_id: participantUserId }
  ]);
  if (participantsError) {
    await admin.from("community_conversations").delete().eq("id", conversation.id);
    redirect(`${returnPath}?error=chat-create`);
  }

  revalidatePath("/community");
  redirect(`${returnPath}?conversation=${encodeURIComponent(conversation.id)}`);
}

export async function sendCommunityMessage(conversationId: string, formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(`${returnPath}?error=message-send`);
  const { supabase, user } = await requireCommunityUser(returnPath);
  const body = String(formData.get("body") ?? "").trim();
  if (!body || body.length > 2000) redirect(`${returnPath}?error=message`);
  await ensureCommunityProfile(user);

  const { error } = await supabase.from("community_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body
  });
  if (error) redirect(`${returnPath}?error=message-send`);

  void notifyOtherParticipantsOfMessage(conversationId, user.id, body);

  revalidatePath("/community");
  revalidatePath("/community/profiel");
  redirect(`${returnPath}?conversation=${encodeURIComponent(conversationId)}`);
}

/**
 * Push-notifies the other participant(s) in a conversation about a new message.
 * Best-effort and fire-and-forget: failures here must never block message delivery,
 * which is already committed to the database by the time this runs.
 */
async function notifyOtherParticipantsOfMessage(conversationId: string, senderId: string, body: string) {
  try {
    const admin = createSupabaseAdminClient();
    if (!admin) return;
    const [{ data: participants }, { data: senderProfile }] = await Promise.all([
      admin.from("community_conversation_participants").select("user_id").eq("conversation_id", conversationId).neq("user_id", senderId),
      admin.from("community_profiles").select("display_name").eq("user_id", senderId).maybeSingle()
    ]);
    if (!participants?.length) return;
    const senderName = senderProfile?.display_name ?? "Iemand";
    const preview = body.length > 120 ? `${body.slice(0, 117)}...` : body;
    await Promise.all(
      participants.map((participant) =>
        sendPushToUser(participant.user_id, {
          title: `Nieuw bericht van ${senderName}`,
          body: preview,
          url: "/community?panel=chat",
          tag: `message-${conversationId}`
        })
      )
    );
  } catch (err) {
    console.error("[push] failed to notify conversation participants", err);
  }
}

export async function subscribeEpisodeSignup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "homepage_episode_1").trim() || "homepage_episode_1";

  if (!name || !emailPattern.test(email)) redirect(signupRedirectTarget(formData, "invalid"));
  if (!(await assertSameOriginRequest())) redirect(signupRedirectTarget(formData, "invalid"));
  const ip = await requestIpAddress();
  if (
    !consumeRateLimit(`signup:ip:${ip}`, signupRateLimitWindowMs, signupRateLimitMax) ||
    !consumeRateLimit(`signup:email:${email}`, signupRateLimitWindowMs, signupRateLimitMax)
  ) {
    redirect(signupRedirectTarget(formData, "rate-limited"));
  }

  const result = await saveEpisodeSignup({
    name,
    email,
    source,
    status: "subscribed",
    updated_at: new Date().toISOString()
  });

  if (!result.ok) redirect(signupRedirectTarget(formData, "error"));

  revalidatePath("/");
  revalidatePath("/podcast");
  redirect(signupRedirectTarget(formData, "subscribed"));
}

export async function createCommunityPost(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(`${returnPath}?error=invalid`);
  if (!supabase) redirect(`${returnPath}?missing=supabase`);

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnPath)}`);

  const requestedTitle = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const title = requestedTitle || body.split(/\r?\n/).find((line) => line.trim())?.trim().slice(0, 140) || "Nieuw bericht";
  const category = String(formData.get("category") ?? "").trim();
  const requestedDisplayType = String(formData.get("author_display_type") ?? "first_name");
  const authorDisplayType = ["real_name", "first_name", "anonymous"].includes(requestedDisplayType)
    ? requestedDisplayType
    : "first_name";
  const targetGroup = String(formData.get("target_group") ?? "").trim() || null;
  const postType = normalizePostType(formData.get("post_type"));
  const resourceUrl = optionalUrl(formData.get("resource_url"));
  const resourceLabel = String(formData.get("resource_label") ?? "").trim() || null;
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);

  if (title.length > 140 || !body || body.length > 5000 || !category || category.length > 120) {
    redirect(`${returnPath}?error=missing-fields`);
  }

  const postSlug = `${slugify(title)}-${Date.now()}`;
  try {
    await ensureCommunityProfile(user);
  } catch (failure) {
    console.error("[community-post] profile preparation failed", { name: failure instanceof Error ? failure.name : "OperationError" });
    redirect(`${returnPath}?error=supabase`);
  }
  const admin = createSupabaseAdminClient();
  if (!admin) redirect(`${returnPath}?error=storage`);
  const image = getUploadFile(formData, "image_file");
  const uploadedImagePath = String(formData.get("image_path") ?? "").trim();
  let imageUrl: string | null = null;
  let imageHash: string | null = null;
  if (uploadedImagePath) {
    imageUrl = await ownedCommunityMediaPublicUrl(admin, user.id, "feed-image", uploadedImagePath);
    if (!imageUrl) redirect(`${returnPath}?error=image`);
  } else if (image) {
    if (!isAllowedCommunityImage(image)) redirect(`${returnPath}?error=image`);
    imageHash = await fileSha256(image);
    imageUrl = await uploadPublicFile(admin, "community-images", `community/${user.id}/${postSlug}`, image, "jpg", returnPath);
  }

  let postError: { code?: string; message?: string } | null = null;
  try {
    const result = await admin.from("community_posts").insert({
      user_id: user.id,
      author_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
      author_display_type: authorDisplayType,
      title,
      slug: postSlug,
      body,
      image_url: imageUrl,
      image_hash: imageHash,
      category,
      post_type: postType,
      resource_url: resourceUrl,
      resource_label: resourceUrl ? resourceLabel ?? new URL(resourceUrl).hostname.replace(/^www\./, "") : null,
      tags,
      target_group: targetGroup,
      status: "pending"
    });
    postError = result.error;
  } catch (failure) {
    console.error("[community-post] insert failed", { name: failure instanceof Error ? failure.name : "OperationError" });
    redirect(`${returnPath}?error=supabase`);
  }
  if (postError) redirect(`${returnPath}?error=post-create`);

  revalidatePath("/");
  revalidatePath("/community");
  revalidatePath("/community/profiel");
  revalidatePath("/bijsluiter");
  redirect(`${returnPath}?submitted=pending`);
}

export async function createCommunityReply(postId: string, formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(`${returnPath}?error=reply-create`);
  const { supabase, user } = await requireCommunityUser(returnPath);

  const body = String(formData.get("body") ?? "").trim();
  const authorDisplayTypeInput = String(formData.get("author_display_type") ?? "first_name");
  const authorDisplayType = ["real_name", "first_name", "anonymous"].includes(authorDisplayTypeInput)
    ? authorDisplayTypeInput
    : "first_name";
  const parentReplyId = String(formData.get("parent_reply_id") ?? "").trim() || null;
  if (!body || body.length > 2000) redirect(`${returnPath}?error=reply`);

  if (parentReplyId) {
    const { data: parentReply } = await supabase
      .from("community_replies")
      .select("id")
      .eq("id", parentReplyId)
      .eq("post_id", postId)
      .maybeSingle();
    if (!parentReply) redirect(`${returnPath}?error=reply-create`);
  }

  const payload = {
    post_id: postId,
    user_id: user.id,
    author_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
    author_display_type: authorDisplayType,
    body,
    status: "pending",
    ...(parentReplyId ? { parent_reply_id: parentReplyId } : {})
  };

  const { error } = await supabase.from("community_replies").insert(payload);
  if (error) redirect(`${returnPath}?error=reply-create`);

  revalidatePath("/community");
  revalidatePath("/community/profiel");
  revalidatePath(returnPath);
  redirect(`${returnPath}?comments=${encodeURIComponent(postId)}&reply=submitted`);
}

export async function supportPost(postId: string, formData?: FormData) {
  const returnPath = safeReturnPath(formData?.get("return_to") ?? null, "/community");
  if (!(await assertSameOriginRequest())) redirect(`${returnPath}?error=support`);
  const { supabase, user } = await requireCommunityUser(returnPath);
  const { data: existing } = await supabase
    .from("community_supports")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  let supportError = null;
  if (existing) {
    const { error } = await supabase.from("community_supports").delete().eq("post_id", postId).eq("user_id", user.id);
    supportError = error;
  } else {
    const { error } = await supabase.from("community_supports").insert({ post_id: postId, user_id: user.id });
    supportError = error;
  }
  if (supportError) redirect(`${returnPath}?error=support`);

  revalidatePath("/community");
  revalidatePath(returnPath);
}

export async function reportCommunityContent(targetType: string, targetId: string, formData: FormData) {
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!(await assertSameOriginRequest())) redirect(`${returnPath}?error=report`);
  const { supabase, user } = await requireCommunityUser(returnPath);
  const normalizedType = communityReportTypes.has(targetType) ? targetType : "post";
  const categoryInput = String(formData.get("report_category") ?? formData.get("reason") ?? "ongepast").trim().toLowerCase();
  const category = communityReportCategories.has(categoryInput) ? categoryInput : "anders";
  const details = String(formData.get("details") ?? formData.get("reason") ?? "").trim().slice(0, 1000);
  const ip = await requestIpAddress();
  const emailHash = moderationHash(user.email);
  const ipHash = moderationHash(ip);
  const reason = details || `${category} gemeld op ${normalizedType}`;
  let imageContext: { image_hash?: string | null; image_url?: string | null } = {};
  if (normalizedType === "image") {
    const admin = createSupabaseAdminClient();
    const { data: postImage } = admin
      ? await admin.from("community_posts").select("image_hash,image_url").eq("id", targetId).maybeSingle()
      : await supabase.from("community_posts").select("image_hash,image_url").eq("id", targetId).maybeSingle();
    imageContext = {
      image_hash: typeof postImage?.image_hash === "string" ? postImage.image_hash : null,
      image_url: typeof postImage?.image_url === "string" ? postImage.image_url : null
    };
  }
  const basePayload = {
    user_id: user.id,
    reason,
    post_id: normalizedType === "post" || normalizedType === "image" || normalizedType === "language" ? targetId : null,
    reply_id: normalizedType === "reply" ? targetId : null
  };
  const richPayload = {
    ...basePayload,
    target_type: normalizedType,
    target_id: targetId,
    report_category: category,
    details,
    status: "open",
    priority: category === "veiligheid" ? "high" : "normal",
    metadata: {
      reporter_email_hash: emailHash,
      reporter_ip_hash: ipHash,
      ...imageContext,
      reported_from: returnPath
    }
  };

  const { error } = await supabase.from("community_reports").insert(richPayload);
  if (error) await supabase.from("community_reports").insert(basePayload);
  revalidatePath("/admin");
  revalidatePath(returnPath);
}

export async function reportPost(postId: string, formData: FormData) {
  await reportCommunityContent("post", postId, formData);
}

export async function moderatePost(postId: string, status: "approved" | "rejected" | "archived") {
  const supabase = await requireAdminClient();
  await supabase.from("community_posts").update({ status }).eq("id", postId);
  revalidatePath("/admin");
  revalidatePath("/community");
}

export async function moderateCommunityReply(replyId: string, status: "approved" | "rejected" | "archived") {
  const supabase = await requireAdminClient();
  await supabase.from("community_replies").update({ status }).eq("id", replyId);
  revalidatePath("/admin");
  revalidatePath("/community");
}

export async function resolveCommunityReport(reportId: string, formData: FormData) {
  const supabase = await requireAdminClient();
  const note = String(formData.get("resolution_note") ?? "").trim().slice(0, 500);
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("community_reports")
    .update({
      status: "resolved",
      resolved_at: now,
      reviewed_at: now,
      resolution_note: note || null
    })
    .eq("id", reportId);

  if (error) {
    await supabase.from("community_reports").update({ resolved_at: now }).eq("id", reportId);
  }
  revalidatePath("/admin");
}

export async function moderateInterviewComment(commentId: string, interviewId: string, status: "approved" | "rejected") {
  const supabase = await requireAdminClient();
  await supabase
    .from("interview_comments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", commentId);
  await supabase.rpc("recount_interview_comments", { p_interview_id: interviewId });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function saveSeason(formData: FormData) {
  const supabase = await requireAdminClient();
  const title = String(formData.get("title") ?? "").trim();
  const seasonNumber = Number(formData.get("season_number"));
  if (!title || !seasonNumber) redirect(adminReturnTarget(formData, "error", "season", "seasons"));

  await supabase.from("podcast_seasons").upsert(
    {
      title,
      season_number: seasonNumber,
      description: String(formData.get("description") ?? "").trim() || null,
      cover_image: String(formData.get("cover_image") ?? "").trim() || null,
      status: String(formData.get("status") ?? "draft")
    },
    { onConflict: "season_number" }
  );
  revalidatePath("/podcast");
  revalidatePath("/admin");
  redirect(adminReturnTarget(formData, "saved", "season", "seasons"));
}

export async function saveEpisode(formData: FormData) {
  const supabase = await requireAdminClient();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const seasonNumber = Number(formData.get("season_number"));
  const episodeNumber = Number(formData.get("episode_number"));
  if (!title || !seasonNumber || !episodeNumber) redirect(adminReturnTarget(formData, "error", "episode", "podcast"));

  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const uploadFolder = `podcast/${safePathPart(slug)}`;
  const audioUpload = getUploadFile(formData, "audio_file");
  const imageUpload = getUploadFile(formData, "image_file");
  const audioFileUrl = audioUpload
    ? await uploadPublicFile(supabase, "podcast-audio", uploadFolder, audioUpload, "mp3")
    : String(formData.get("audio_file_url") ?? "").trim() || null;
  const imageUrl = imageUpload
    ? await uploadPublicFile(supabase, "podcast-images", uploadFolder, imageUpload, "jpg")
    : String(formData.get("image_url") ?? "").trim() || null;
  const featuredLatest = formData.get("featured_latest") === "on";
  const payload = {
    title,
    slug,
    season_number: seasonNumber,
    episode_number: episodeNumber,
    short_intro: String(formData.get("short_intro") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    audio_file_url: audioFileUrl,
    spotify_url: String(formData.get("spotify_url") ?? "").trim() || null,
    podimo_url: String(formData.get("podimo_url") ?? "").trim() || null,
    apple_podcast_url: String(formData.get("apple_podcast_url") ?? "").trim() || null,
    image_url: imageUrl,
    publication_date: String(formData.get("publication_date") ?? "").trim() || null,
    next_episode_date: String(formData.get("next_episode_date") ?? "").trim() || null,
    duration: String(formData.get("duration") ?? "").trim() || null,
    link_cards: parseLinkCards(formData.get("link_cards")),
    featured_latest: featuredLatest,
    status: String(formData.get("status") ?? "draft"),
    updated_at: new Date().toISOString()
  };

  if (featuredLatest) {
    await supabase.from("podcast_episodes").update({ featured_latest: false }).neq("slug", slug);
  }

  const result = id
    ? await supabase.from("podcast_episodes").update(payload).eq("id", id)
    : await supabase.from("podcast_episodes").upsert(payload, { onConflict: "slug" });
  if (result.error) redirect(adminReturnTarget(formData, "error", "episode-save", "podcast"));
  revalidatePath("/");
  revalidatePath("/podcast");
  revalidatePath(`/podcast/${slug}`);
  revalidatePath("/admin");
  redirect(adminReturnTarget(formData, "saved", "episode", "podcast"));
}

export async function archiveEpisode(episodeId: string) {
  const supabase = await requireAdminClient();
  await supabase.from("podcast_episodes").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", episodeId);
  revalidatePath("/");
  revalidatePath("/podcast");
  revalidatePath("/admin");
  redirect("/admin?tab=podcast&saved=archived");
}

export async function startEpisodeTranscript(episodeId: string) {
  const supabase = await requireAdminClient();
  let target = "/admin?tab=podcast&saved=transcript-started";
  try {
    const episode = await getEpisodeForTranscript(supabase, episodeId);
    if (!episode.audio_file_url) throw new Error("missing-audio");

    const config = getGoogleSpeechConfig();
    const token = await getGoogleAccessToken();
    const audioUrl = absoluteAudioUrl(episode.audio_file_url);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) throw new Error("audio-fetch");

    const contentType = audioResponse.headers.get("content-type") ?? "application/octet-stream";
    const extension = extensionFromAudio(audioUrl, contentType);
    const audioBytes = new Uint8Array(await audioResponse.arrayBuffer());
    const audioObject = `podcast-audio/${safePathPart(episode.slug)}/${Date.now()}-${safePathPart(episode.title)}.${extension}`;
    const audioUri = await uploadGoogleStorageObject(config.bucket, audioObject, audioBytes, contentType, token);

    const request = {
      files: [{ uri: audioUri }],
      config: {
        features: { enableWordTimeOffsets: true },
        autoDecodingConfig: {},
        model: config.model,
        languageCodes: [config.language]
      },
      recognitionOutputConfig: {
        inlineResponseConfig: {}
      }
    };

    const response = await fetch(
      `https://speech.googleapis.com/v2/projects/${config.project}/locations/${config.location}/recognizers/_:batchRecognize`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(request)
      }
    );
    if (!response.ok) throw new Error("speech-start");
    const operation = (await response.json()) as SpeechOperation;
    if (!operation.name) throw new Error("speech-operation");

    await supabase
      .from("podcast_episodes")
      .update({
        transcript_status: "processing",
        transcript_language: config.language,
        transcript_segments: [],
        transcript_operation_name: operation.name,
        transcript_generated_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", episodeId);

    revalidatePath("/");
    revalidatePath("/podcast");
    revalidatePath("/admin");
  } catch {
    await supabase
      .from("podcast_episodes")
      .update({ transcript_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", episodeId);
    revalidatePath("/admin");
    target = "/admin?tab=podcast&error=transcript-start";
  }
  redirect(target);
}

export async function refreshEpisodeTranscript(episodeId: string) {
  const supabase = await requireAdminClient();
  let target = "/admin?tab=podcast&saved=transcript-ready";
  try {
    const episode = await getEpisodeForTranscript(supabase, episodeId);
    if (!episode.transcript_operation_name) throw new Error("missing-operation");

    const config = getGoogleSpeechConfig();
    const token = await getGoogleAccessToken();
    const operationUrl = `https://speech.googleapis.com/v2/${episode.transcript_operation_name}`;
    const response = await fetch(operationUrl, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("speech-refresh");
    const operation = (await response.json()) as SpeechOperation;

    if (!operation.done) {
      await supabase
        .from("podcast_episodes")
        .update({ transcript_status: "processing", updated_at: new Date().toISOString() })
        .eq("id", episodeId);
      revalidatePath("/admin");
      target = "/admin?tab=podcast&saved=transcript-processing";
    } else {
      if (operation.error) throw new Error(operation.error.message ?? "speech-operation-error");

      const segments = parseSpeechSegments(operation);
      if (!segments.length) throw new Error("empty-transcript");

      const vtt = new TextEncoder().encode(segmentsToVtt(segments));
      const vttObject = `podcast-transcripts/${safePathPart(episode.slug)}/transcript.vtt`;
      await uploadGoogleStorageObject(config.bucket, vttObject, vtt, "text/vtt; charset=utf-8", token);

      await supabase
        .from("podcast_episodes")
        .update({
          transcript_status: "ready",
          transcript_language: config.language,
          transcript_segments: segments,
          transcript_vtt_url: gcsPublicUrl(config.bucket, vttObject),
          transcript_generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", episodeId);

      revalidatePath("/");
      revalidatePath("/podcast");
      revalidatePath("/admin");
    }
  } catch {
    await supabase
      .from("podcast_episodes")
      .update({ transcript_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", episodeId);
    revalidatePath("/admin");
    target = "/admin?tab=podcast&error=transcript-refresh";
  }
  redirect(target);
}

export async function saveHost(formData: FormData) {
  const supabase = await requireAdminClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect(adminReturnTarget(formData, "error", "host", "hosts"));

  await supabase.from("host_profiles").insert({
    name,
    role: String(formData.get("role") ?? "").trim() || null,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    personal_motivation: String(formData.get("personal_motivation") ?? "").trim() || null,
    display_order: Number(formData.get("display_order") ?? 100),
    status: String(formData.get("status") ?? "draft")
  });
  revalidatePath("/");
  revalidatePath("/over");
  revalidatePath("/admin");
  redirect(adminReturnTarget(formData, "saved", "host", "hosts"));
}

export async function saveFaq(formData: FormData) {
  const supabase = await requireAdminClient();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) redirect(adminReturnTarget(formData, "error", "faq", "hosts"));

  await supabase.from("faqs").insert({
    question,
    answer,
    category: String(formData.get("category") ?? "").trim() || null,
    display_order: Number(formData.get("display_order") ?? 100),
    status: String(formData.get("status") ?? "draft")
  });
  revalidatePath("/faq");
  revalidatePath("/admin");
  redirect(adminReturnTarget(formData, "saved", "faq", "hosts"));
}

export async function saveShopProduct(formData: FormData) {
  const supabase = await requireAdminClient();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(adminReturnTarget(formData, "error", "shop-product", "shop"));

  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const priceInput = String(formData.get("price") ?? "").replace(",", ".").trim();
  const priceCents = Math.round(Number(priceInput) * 100);
  if (!slug || !Number.isFinite(priceCents) || priceCents < 0) {
    redirect(adminReturnTarget(formData, "error", "shop-product", "shop"));
  }

  const imageUpload = getUploadFile(formData, "image_file");
  const imageUrl = imageUpload
    ? await uploadPublicFile(supabase, "shop-products", `products/${safePathPart(slug)}`, imageUpload, "jpg", "/admin?tab=shop")
    : String(formData.get("image_url") ?? "").trim() || null;
  const inventoryRaw = String(formData.get("inventory_count") ?? "").trim();
  const inventoryCount = inventoryRaw === "" ? null : Math.max(0, Number(inventoryRaw));
  const payload = {
    title,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    short_description: String(formData.get("short_description") ?? "").trim() || null,
    image_url: imageUrl,
    price_cents: priceCents,
    currency: String(formData.get("currency") ?? "eur").trim().toLowerCase().slice(0, 3) || "eur",
    inventory_count: Number.isFinite(inventoryCount) ? inventoryCount : null,
    stripe_price_id: String(formData.get("stripe_price_id") ?? "").trim() || null,
    stripe_product_id: String(formData.get("stripe_product_id") ?? "").trim() || null,
    status: String(formData.get("status") ?? "draft"),
    featured: formData.get("featured") === "on",
    sort_order: Number(formData.get("sort_order") ?? 100),
    updated_at: new Date().toISOString()
  };

  const result = id
    ? await supabase.from("shop_products").update(payload).eq("id", id)
    : await supabase.from("shop_products").upsert(payload, { onConflict: "slug" });
  if (result.error) redirect(adminReturnTarget(formData, "error", "shop-product", "shop"));

  revalidatePath("/shop");
  revalidatePath("/admin");
  redirect(adminReturnTarget(formData, "saved", "shop-product", "shop"));
}

export async function archiveShopProduct(productId: string) {
  const supabase = await requireAdminClient();
  await supabase.from("shop_products").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", productId);
  revalidatePath("/shop");
  revalidatePath("/admin");
  redirect("/admin?tab=shop&saved=shop-product");
}

export async function saveShopSettings(formData: FormData) {
  const supabase = await requireAdminClient();
  const title = String(formData.get("title") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  if (!title || !intro) redirect(adminReturnTarget(formData, "error", "shop-settings", "shop"));

  const servicePoints = String(formData.get("service_points") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  const result = await supabase.from("shop_settings").upsert(
    {
      id: "main",
      eyebrow: String(formData.get("eyebrow") ?? "").trim() || "Stuk Verdriet shop",
      title,
      intro,
      service_points: servicePoints.length ? servicePoints : ["zorgvuldig en ingetogen"],
      checkout_note: String(formData.get("checkout_note") ?? "").trim() || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
  if (result.error) redirect(adminReturnTarget(formData, "error", "shop-settings", "shop"));

  revalidatePath("/shop");
  revalidatePath("/admin");
  redirect(adminReturnTarget(formData, "saved", "shop-settings", "shop"));
}

export async function saveSiteSettings(formData: FormData) {
  const supabase = await requireAdminClient();
  const { data } = await supabase.from("site_settings").select("social_links, logo_url").eq("id", "main").single();
  const currentSocialLinks =
    data?.social_links && typeof data.social_links === "object" && !Array.isArray(data.social_links)
      ? (data.social_links as Record<string, unknown>)
      : {};

  const logoUpload = getUploadFile(formData, "logo_file");
  let logoUrl = String(formData.get("logo_url") ?? "").trim() || data?.logo_url || "/brand/sverdriet_logo.webp";
  if (logoUpload) {
    if (!isAllowedSiteLogo(logoUpload)) redirect(adminReturnTarget(formData, "error", "site-logo", "site"));
    logoUrl = await uploadPublicFile(supabase, "site-branding", "logo", logoUpload, "png", "/admin?tab=site");
  }

  await supabase.from("site_settings").upsert(
    {
      id: "main",
      logo_url: logoUrl,
      homepage_intro: String(formData.get("homepage_intro") ?? "").trim() || null,
      social_links: {
        section_styles: currentSocialLinks.section_styles ?? {},
        instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
        facebook_url: String(formData.get("facebook_url") ?? "").trim() || null,
        tiktok_url: String(formData.get("tiktok_url") ?? "").trim() || null,
        spotify_url: String(formData.get("spotify_url") ?? "").trim() || null,
        youtube_music_url: String(formData.get("youtube_music_url") ?? "").trim() || null,
        podimo_url: String(formData.get("podimo_url") ?? "").trim() || null,
        apple_podcast_url: String(formData.get("apple_podcast_url") ?? "").trim() || null
      }
    },
    { onConflict: "id" }
  );
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin");
  redirect(adminReturnTarget(formData, "saved", "site", "site"));
}

export async function saveSectionDesignSettings(formData: FormData) {
  const supabase = await requireAdminClient();
  const rawSettings = String(formData.get("section_styles") ?? "{}");
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(rawSettings);
  } catch {
    redirect(adminReturnTarget(formData, "error", "section-design", "sections"));
  }

  const { data } = await supabase.from("site_settings").select("social_links").eq("id", "main").single();
  const currentSocialLinks =
    data?.social_links && typeof data.social_links === "object" && !Array.isArray(data.social_links)
      ? (data.social_links as Record<string, unknown>)
      : {};

  const result = await supabase.from("site_settings").upsert(
    {
      id: "main",
      social_links: {
        ...currentSocialLinks,
        section_styles: normalizeSectionDesign(parsed)
      },
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  if (result.error) redirect(adminReturnTarget(formData, "error", "section-design-save", "sections"));
  revalidatePath("/");
  revalidatePath("/podcast");
  revalidatePath("/themas");
  revalidatePath("/community");
  revalidatePath("/admin");
  redirect(adminReturnTarget(formData, "saved", "section-design", "sections"));
}

type PushSubscriptionKeys = { p256dh: string; auth: string };
type PushActionResult = { ok: boolean; error?: string };

function isValidPushKeys(value: unknown): value is PushSubscriptionKeys {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).p256dh === "string" &&
    typeof (value as Record<string, unknown>).auth === "string"
  );
}

/** Saves (or refreshes) a browser push subscription for the signed-in user. */
export async function saveCommunityPushSubscription(subscription: {
  endpoint: string;
  keys: PushSubscriptionKeys;
}): Promise<PushActionResult> {
  if (!(await assertSameOriginRequest())) return { ok: false, error: "invalid" };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "profile-storage" };
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };
  if (!subscription?.endpoint || !isValidPushKeys(subscription.keys)) return { ok: false, error: "invalid" };

  await ensureCommunityProfile(user);
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "profile-storage" };

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,endpoint" }
  );
  if (error) return { ok: false, error: "push-save" };
  return { ok: true };
}

/** Removes a browser push subscription (called on unsubscribe / toggle off). */
export async function deleteCommunityPushSubscription(endpoint: string): Promise<PushActionResult> {
  if (!(await assertSameOriginRequest())) return { ok: false, error: "invalid" };
  const { supabase, user } = await requireCommunityUserApi();
  if (!supabase || !user) return { ok: false, error: "auth" };
  if (!endpoint) return { ok: false, error: "invalid" };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "profile-storage" };
  const { error } = await admin.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  if (error) return { ok: false, error: "push-delete" };
  return { ok: true };
}

/** Updates the sound_enabled toggle for one subscription, independent from push on/off. */
export async function updateCommunityPushSoundPreference(endpoint: string, soundEnabled: boolean): Promise<PushActionResult> {
  if (!(await assertSameOriginRequest())) return { ok: false, error: "invalid" };
  const { supabase, user } = await requireCommunityUserApi();
  if (!supabase || !user) return { ok: false, error: "auth" };
  if (!endpoint) return { ok: false, error: "invalid" };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "profile-storage" };
  const { error } = await admin
    .from("push_subscriptions")
    .update({ sound_enabled: soundEnabled, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);
  if (error) return { ok: false, error: "push-sound" };
  return { ok: true };
}

/** Reads whether the current user has any active push subscription, and its sound setting. */
export async function getCommunityPushStatus(): Promise<{
  isLoggedIn: boolean;
  subscribed: boolean;
  soundEnabled: boolean;
}> {
  const { supabase, user } = await requireCommunityUserApi();
  if (!supabase || !user) return { isLoggedIn: false, subscribed: false, soundEnabled: true };

  const admin = createSupabaseAdminClient();
  if (!admin) return { isLoggedIn: true, subscribed: false, soundEnabled: true };
  const { data } = await admin
    .from("push_subscriptions")
    .select("sound_enabled")
    .eq("user_id", user.id)
    .eq("push_enabled", true)
    .limit(1)
    .maybeSingle();
  return { isLoggedIn: true, subscribed: Boolean(data), soundEnabled: data?.sound_enabled ?? true };
}

/** Same shape as requireCommunityUser but returns nulls instead of redirecting, for JSON-returning actions. */
async function requireCommunityUserApi() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null };
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, user: null };
  return { supabase, user };
}
