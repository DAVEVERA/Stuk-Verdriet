"use server";

import { createSign } from "crypto";
import { readFileSync } from "fs";
import { appendFile, mkdir } from "fs/promises";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeSectionDesign } from "@/lib/section-design";
import { adminEmailList, createSupabaseAdminClient, createSupabasePublicClient, createSupabaseServerClient } from "@/lib/supabase";
import type { PodcastEpisode, PodcastLinkCard, PodcastTranscriptSegment } from "@/types/content";

const linkCardTypes: PodcastLinkCard["type"][] = ["link", "spotify", "podimo", "apple", "book", "donation"];
const communityImageMaxSize = 4 * 1024 * 1024;
const communityImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const communityImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const signupRateLimit = new Map<string, { count: number; resetAt: number }>();
const signupRateLimitWindowMs = 10 * 60 * 1000;
const signupRateLimitMax = 5;

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

function safeReturnPath(value: FormDataEntryValue | null, fallback: "/community" | "/bijsluiter") {
  const path = String(value ?? "").trim();
  return path === "/bijsluiter" || path === "/community" || path.startsWith("/community/") ? path : fallback;
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";
}

async function assertSameOriginRequest() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (!origin) return true;
  return origin === (await getRequestOrigin());
}

async function requestIpAddress() {
  const headerStore = await headers();
  return (
    headerStore
      .get("x-forwarded-for")
      ?.split(",")
      .map((part) => part.trim())
      .find(Boolean) ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

function consumeSignupRateLimit(key: string) {
  const now = Date.now();
  const current = signupRateLimit.get(key);
  if (!current || current.resetAt <= now) {
    signupRateLimit.set(key, { count: 1, resetAt: now + signupRateLimitWindowMs });
    return true;
  }

  if (current.count >= signupRateLimitMax) return false;
  current.count += 1;
  return true;
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

function isAllowedCommunityImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.size <= communityImageMaxSize && communityImageTypes.has(file.type) && communityImageExtensions.has(extension);
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
  const { error } = await admin.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: true
  });
  if (error) redirect(`${errorPath}?error=${bucket}`);
  const {
    data: { publicUrl }
  } = admin.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

async function requireAdminClient() {
  const server = await createSupabaseServerClient();
  if (!server) redirect("/admin?missing=supabase");

  const {
    data: { user }
  } = await server.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!email || !adminEmailList().includes(email)) redirect("/login");

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
    options: { redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` }
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?missing=supabase");
  const siteUrl = await getRequestOrigin();
  const next = safeReturnPath(formData.get("next"), "/community");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!emailPattern.test(email)) redirect(`/login?next=${encodeURIComponent(next)}&error=email`);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm/redirect?next=${encodeURIComponent(next)}`
    }
  });

  if (error) redirect(`/login?next=${encodeURIComponent(next)}&error=email-login`);
  redirect(`/login?next=${encodeURIComponent(next)}&sent=1`);
}

export async function signOut(formData?: FormData) {
  const supabase = await createSupabaseServerClient();
  const next = safeReturnPath(formData?.get("next") ?? null, "/community");
  if (supabase) await supabase.auth.signOut();
  redirect(next);
}

export async function subscribeEpisodeSignup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "homepage_episode_1").trim() || "homepage_episode_1";

  if (!name || !emailPattern.test(email)) redirect("/?signup=invalid#aanmelden");
  if (!(await assertSameOriginRequest())) redirect("/?signup=invalid#aanmelden");
  const ip = await requestIpAddress();
  if (!consumeSignupRateLimit(`signup:ip:${ip}`) || !consumeSignupRateLimit(`signup:email:${email}`)) {
    redirect("/?signup=rate-limited#aanmelden");
  }

  const result = await saveEpisodeSignup({
    name,
    email,
    source,
    status: "subscribed",
    updated_at: new Date().toISOString()
  });

  if (!result.ok) redirect("/?signup=error#aanmelden");

  revalidatePath("/");
  redirect("/?signup=subscribed#aanmelden");
}

export async function createCommunityPost(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const returnPath = safeReturnPath(formData.get("return_to"), "/community");
  if (!supabase) redirect(`${returnPath}?missing=supabase`);

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnPath)}`);

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const authorDisplayType = String(formData.get("author_display_type") ?? "first_name");
  const targetGroup = String(formData.get("target_group") ?? "").trim() || null;
  const postType = normalizePostType(formData.get("post_type"));
  const resourceUrl = optionalUrl(formData.get("resource_url"));
  const resourceLabel = String(formData.get("resource_label") ?? "").trim() || null;
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);

  if (!title || !body || !category) redirect(`${returnPath}?error=missing-fields`);

  const postSlug = `${slugify(title)}-${Date.now()}`;
  const image = getUploadFile(formData, "image_file");
  let imageUrl: string | null = null;
  if (image) {
    if (!isAllowedCommunityImage(image)) redirect(`${returnPath}?error=image`);
    const admin = createSupabaseAdminClient();
    if (!admin) redirect(`${returnPath}?error=storage`);
    imageUrl = await uploadPublicFile(admin, "community-images", `community/${user.id}/${postSlug}`, image, "jpg", returnPath);
  }

  await supabase.from("community_posts").insert({
    user_id: user.id,
    author_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
    author_display_type: authorDisplayType,
    title,
    slug: postSlug,
    body,
    image_url: imageUrl,
    category,
    post_type: postType,
    resource_url: resourceUrl,
    resource_label: resourceUrl ? resourceLabel ?? new URL(resourceUrl).hostname.replace(/^www\./, "") : null,
    tags,
    target_group: targetGroup,
    status: "pending"
  });

  revalidatePath("/");
  revalidatePath("/community");
  revalidatePath("/bijsluiter");
  redirect(`${returnPath}?submitted=pending`);
}

export async function createCommunityReply(postId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = String(formData.get("body") ?? "").trim();
  const authorDisplayType = String(formData.get("author_display_type") ?? "first_name");
  if (!body) return;

  await supabase.from("community_replies").insert({
    post_id: postId,
    user_id: user.id,
    author_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
    author_display_type: authorDisplayType,
    body,
    status: "pending"
  });

  revalidatePath("/community");
}

export async function supportPost(postId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("community_supports").upsert({ post_id: postId, user_id: user.id }, { onConflict: "post_id,user_id", ignoreDuplicates: true });

  revalidatePath("/community");
}

export async function reportPost(postId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("community_reports").insert({
    post_id: postId,
    user_id: user.id,
    reason: String(formData.get("reason") ?? "Ongepaste inhoud").slice(0, 500)
  });
  revalidatePath("/admin");
}

export async function moderatePost(postId: string, status: "approved" | "rejected" | "archived") {
  const supabase = await requireAdminClient();
  await supabase.from("community_posts").update({ status }).eq("id", postId);
  revalidatePath("/admin");
  revalidatePath("/community");
}

export async function saveSeason(formData: FormData) {
  const supabase = await requireAdminClient();
  const title = String(formData.get("title") ?? "").trim();
  const seasonNumber = Number(formData.get("season_number"));
  if (!title || !seasonNumber) redirect("/admin?error=season");

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
  redirect("/admin?saved=season");
}

export async function saveEpisode(formData: FormData) {
  const supabase = await requireAdminClient();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const seasonNumber = Number(formData.get("season_number"));
  const episodeNumber = Number(formData.get("episode_number"));
  if (!title || !seasonNumber || !episodeNumber) redirect("/admin?error=episode");

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
  if (result.error) redirect("/admin?error=episode-save");
  revalidatePath("/");
  revalidatePath("/podcast");
  revalidatePath(`/podcast/${slug}`);
  revalidatePath("/admin");
  redirect("/admin?saved=episode");
}

export async function archiveEpisode(episodeId: string) {
  const supabase = await requireAdminClient();
  await supabase.from("podcast_episodes").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", episodeId);
  revalidatePath("/");
  revalidatePath("/podcast");
  revalidatePath("/admin");
  redirect("/admin?saved=archived");
}

export async function startEpisodeTranscript(episodeId: string) {
  const supabase = await requireAdminClient();
  let target = "/admin?saved=transcript-started";
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
    target = "/admin?error=transcript-start";
  }
  redirect(target);
}

export async function refreshEpisodeTranscript(episodeId: string) {
  const supabase = await requireAdminClient();
  let target = "/admin?saved=transcript-ready";
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
      target = "/admin?saved=transcript-processing";
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
    target = "/admin?error=transcript-refresh";
  }
  redirect(target);
}

export async function saveHost(formData: FormData) {
  const supabase = await requireAdminClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin?error=host");

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
  redirect("/admin?saved=host");
}

export async function saveFaq(formData: FormData) {
  const supabase = await requireAdminClient();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) redirect("/admin?error=faq");

  await supabase.from("faqs").insert({
    question,
    answer,
    category: String(formData.get("category") ?? "").trim() || null,
    display_order: Number(formData.get("display_order") ?? 100),
    status: String(formData.get("status") ?? "draft")
  });
  revalidatePath("/faq");
  revalidatePath("/admin");
  redirect("/admin?saved=faq");
}

export async function saveSiteSettings(formData: FormData) {
  const supabase = await requireAdminClient();
  const { data } = await supabase.from("site_settings").select("social_links").eq("id", "main").single();
  const currentSocialLinks =
    data?.social_links && typeof data.social_links === "object" && !Array.isArray(data.social_links)
      ? (data.social_links as Record<string, unknown>)
      : {};
  await supabase.from("site_settings").upsert(
    {
      id: "main",
      logo_url: String(formData.get("logo_url") ?? "").trim() || "/brand/sverdriet_logo.webp",
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
  redirect("/admin?saved=site");
}

export async function saveSectionDesignSettings(formData: FormData) {
  const supabase = await requireAdminClient();
  const rawSettings = String(formData.get("section_styles") ?? "{}");
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(rawSettings);
  } catch {
    redirect("/admin?error=section-design");
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

  if (result.error) redirect("/admin?error=section-design-save");
  revalidatePath("/");
  revalidatePath("/podcast");
  revalidatePath("/themas");
  revalidatePath("/community");
  revalidatePath("/admin");
  redirect("/admin?saved=section-design");
}
