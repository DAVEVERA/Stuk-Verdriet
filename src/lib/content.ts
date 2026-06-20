import {
  fallbackCategories,
  fallbackEpisodes,
  fallbackFaqs,
  fallbackHosts,
  fallbackSeasons,
  fallbackSocialLinks,
  fallbackSponsors
} from "@/lib/fallback-data";
import { normalizeSectionDesign } from "@/lib/section-design";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type {
  CommunityCategory,
  CommunityPost,
  CommunityReply,
  FAQ,
  HostProfile,
  PodcastEpisode,
  PodcastSeason,
  SiteDesignSettings,
  SocialLinks,
  SponsorLogo
} from "@/types/content";

function newestFirst(a: PodcastEpisode, b: PodcastEpisode) {
  return new Date(b.publication_date ?? 0).getTime() - new Date(a.publication_date ?? 0).getTime();
}

function normalizeEpisode(episode: PodcastEpisode): PodcastEpisode {
  return {
    ...episode,
    link_cards: Array.isArray(episode.link_cards) ? episode.link_cards : [],
    transcript_status: episode.transcript_status ?? "missing",
    transcript_language: episode.transcript_language ?? "nl-NL",
    transcript_segments: Array.isArray(episode.transcript_segments) ? episode.transcript_segments : [],
    transcript_vtt_url: episode.transcript_vtt_url ?? null,
    transcript_operation_name: episode.transcript_operation_name ?? null,
    transcript_generated_at: episode.transcript_generated_at ?? null
  };
}

function normalizeCategory(category: CommunityCategory): CommunityCategory {
  if (category.slug !== "voor-broers-en-zussen") return category;
  return {
    ...category,
    title: "Naasten en familie",
    slug: "naasten-en-familie",
    description: "Voor broers, zussen, partners, vrienden en andere naasten."
  };
}

async function fromTable<T>(table: string, fallback: T[], query = "status.eq.published") {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallback;
  const request = supabase.from(table).select("*");
  if (query) {
    const [column, op, value] = query.split(".");
    if (column && op === "eq") request.eq(column, value);
  }
  const { data, error } = await request;
  if (error || !data) return fallback;
  return data as T[];
}

export async function getPublishedSeasons(): Promise<PodcastSeason[]> {
  const seasons = await fromTable<PodcastSeason>("podcast_seasons", fallbackSeasons);
  return (seasons.length ? seasons : fallbackSeasons).sort((a, b) => a.season_number - b.season_number);
}

export async function getPublishedEpisodes(): Promise<PodcastEpisode[]> {
  const episodes = await fromTable<PodcastEpisode>("podcast_episodes", fallbackEpisodes);
  const source = episodes.length ? episodes : fallbackEpisodes;
  return source.map(normalizeEpisode).sort(newestFirst);
}

export async function getLatestEpisode() {
  const episodes = await getPublishedEpisodes();
  return episodes.find((episode) => episode.featured_latest) ?? episodes[0] ?? null;
}

export async function getEpisodeBySlug(slug: string) {
  const episodes = await getPublishedEpisodes();
  return episodes.find((episode) => episode.slug === slug) ?? null;
}

export async function getCommunityCategories(): Promise<CommunityCategory[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallbackCategories;
  const { data, error } = await supabase.from("community_categories").select("*").order("display_order");
  if (error || !data) return fallbackCategories;
  const categories = (data as CommunityCategory[]).map(normalizeCategory);
  const knownSlugs = new Set(categories.map((category) => category.slug));
  const missingFallbacks = fallbackCategories.filter((category) => !knownSlugs.has(category.slug));
  const uniqueCategories = new Map<string, CommunityCategory>();
  [...categories, ...missingFallbacks]
    .sort((a, b) => a.display_order - b.display_order)
    .forEach((category) => {
      if (!uniqueCategories.has(category.slug)) uniqueCategories.set(category.slug, category);
    });
  return [...uniqueCategories.values()];
}

export async function getApprovedCommunityPosts(): Promise<CommunityPost[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("community_posts").select("*").eq("status", "approved");
  if (error || !data) return [];
  const posts = data as CommunityPost[];
  return posts
    .map((post) => ({
      ...post,
      image_url: post.image_url ?? null,
      post_type: post.post_type ?? "story",
      resource_url: post.resource_url ?? null,
      resource_label: post.resource_label ?? null,
      tags: Array.isArray(post.tags) ? post.tags : []
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getApprovedCommunityPostBySlug(slug: string) {
  const posts = await getApprovedCommunityPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getApprovedCommunityReplies(postId: string): Promise<CommunityReply[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("community_replies")
    .select("id,post_id,author_name,author_display_type,body,created_at,status")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as CommunityReply[];
}

export async function getPublishedHosts(): Promise<HostProfile[]> {
  const hosts = await fromTable<HostProfile>("host_profiles", fallbackHosts);
  const source = hosts.length ? hosts : fallbackHosts.filter((host) => host.status === "published");
  return source.sort((a, b) => a.display_order - b.display_order);
}

export async function getPublishedFaqs(): Promise<FAQ[]> {
  const faqs = await fromTable<FAQ>("faqs", fallbackFaqs);
  return faqs.sort((a, b) => a.display_order - b.display_order);
}

export async function getPublishedSponsors(): Promise<SponsorLogo[]> {
  const sponsors = await fromTable<SponsorLogo>("sponsor_logos", fallbackSponsors);
  return sponsors.sort((a, b) => a.display_order - b.display_order);
}

export async function getSocialLinks(): Promise<SocialLinks> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return fallbackSocialLinks;
  const { data, error } = await supabase.from("site_settings").select("social_links").eq("id", "main").single();
  if (error || !data?.social_links) return fallbackSocialLinks;
  return data.social_links as SocialLinks;
}

export async function getSiteDesignSettings(): Promise<SiteDesignSettings> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return {};
  const { data, error } = await supabase.from("site_settings").select("social_links").eq("id", "main").single();
  if (error || !data?.social_links || typeof data.social_links !== "object") return {};
  return normalizeSectionDesign((data.social_links as Record<string, unknown>).section_styles);
}
