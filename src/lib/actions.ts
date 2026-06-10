"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeSectionDesign } from "@/lib/section-design";
import { adminEmailList, createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";
import type { PodcastLinkCard } from "@/types/content";

const linkCardTypes: PodcastLinkCard["type"][] = ["link", "spotify", "podimo", "apple", "book", "donation"];
const communityImageMaxSize = 4 * 1024 * 1024;
const communityImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const communityImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function signInWithProvider(provider: "google", formData?: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?missing=supabase");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const next = safeReturnPath(formData?.get("next") ?? null, "/community");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${siteUrl}/redirect?next=${encodeURIComponent(next)}` }
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?missing=supabase");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const next = safeReturnPath(formData.get("next"), "/community");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!emailPattern.test(email)) redirect(`/login?next=${encodeURIComponent(next)}&error=email`);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/redirect?next=${encodeURIComponent(next)}`
    }
  });

  if (error) redirect(`/login?next=${encodeURIComponent(next)}&error=email-login`);
  redirect(`/login?next=${encodeURIComponent(next)}&sent=1`);
}

export async function subscribeEpisodeSignup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "homepage_episode_1").trim() || "homepage_episode_1";

  if (!name || !emailPattern.test(email)) redirect("/?signup=invalid#aanmelden");

  const supabase = createSupabaseAdminClient();
  if (!supabase) redirect("/?signup=storage#aanmelden");

  const { error } = await supabase.from("episode_signups").upsert(
    {
      name,
      email,
      source,
      status: "subscribed",
      updated_at: new Date().toISOString()
    },
    { onConflict: "email" }
  );

  if (error) redirect("/?signup=error#aanmelden");

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
  await supabase.from("community_supports").upsert({ post_id: postId, user_id: user.id });
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
