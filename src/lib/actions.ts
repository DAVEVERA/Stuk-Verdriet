"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminEmailList, createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export async function signInWithProvider(provider: "google" | "apple") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?missing=supabase");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${siteUrl}/auth/callback` }
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function createCommunityPost(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/community?missing=supabase");

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const authorDisplayType = String(formData.get("author_display_type") ?? "first_name");
  const targetGroup = String(formData.get("target_group") ?? "").trim() || null;

  if (!title || !body || !category) redirect("/community?error=missing-fields");

  await supabase.from("community_posts").insert({
    user_id: user.id,
    author_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
    author_display_type: authorDisplayType,
    title,
    slug: `${slugify(title)}-${Date.now()}`,
    body,
    category,
    target_group: targetGroup,
    status: "pending"
  });

  revalidatePath("/community");
  redirect("/community?submitted=pending");
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
}

export async function saveEpisode(formData: FormData) {
  const supabase = await requireAdminClient();
  const title = String(formData.get("title") ?? "").trim();
  const seasonNumber = Number(formData.get("season_number"));
  const episodeNumber = Number(formData.get("episode_number"));
  if (!title || !seasonNumber || !episodeNumber) redirect("/admin?error=episode");

  await supabase.from("podcast_episodes").upsert(
    {
      title,
      slug: String(formData.get("slug") ?? "").trim() || slugify(title),
      season_number: seasonNumber,
      episode_number: episodeNumber,
      short_intro: String(formData.get("short_intro") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      audio_file_url: String(formData.get("audio_file_url") ?? "").trim() || null,
      spotify_url: String(formData.get("spotify_url") ?? "").trim() || null,
      podimo_url: String(formData.get("podimo_url") ?? "").trim() || null,
      apple_podcast_url: String(formData.get("apple_podcast_url") ?? "").trim() || null,
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      publication_date: String(formData.get("publication_date") ?? "").trim() || null,
      next_episode_date: String(formData.get("next_episode_date") ?? "").trim() || null,
      duration: String(formData.get("duration") ?? "").trim() || null,
      featured_latest: formData.get("featured_latest") === "on",
      status: String(formData.get("status") ?? "draft")
    },
    { onConflict: "slug" }
  );
  revalidatePath("/");
  revalidatePath("/podcast");
  revalidatePath("/admin");
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
}

export async function saveSiteSettings(formData: FormData) {
  const supabase = await requireAdminClient();
  await supabase.from("site_settings").upsert(
    {
      id: "main",
      logo_url: String(formData.get("logo_url") ?? "").trim() || "/brand/sverdriet_logo.webp",
      homepage_intro: String(formData.get("homepage_intro") ?? "").trim() || null,
      social_links: {
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
}
