import {
  fallbackCategories,
  fallbackEpisodes,
  fallbackFaqs,
  fallbackHosts,
  fallbackPosts,
  fallbackSeasons,
  fallbackSocialLinks,
  fallbackSponsors
} from "@/lib/fallback-data";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type {
  CommunityCategory,
  CommunityPost,
  FAQ,
  HostProfile,
  PodcastEpisode,
  PodcastSeason,
  SocialLinks,
  SponsorLogo
} from "@/types/content";

function newestFirst(a: PodcastEpisode, b: PodcastEpisode) {
  return new Date(b.publication_date ?? 0).getTime() - new Date(a.publication_date ?? 0).getTime();
}

function normalizeEpisode(episode: PodcastEpisode): PodcastEpisode {
  return {
    ...episode,
    link_cards: Array.isArray(episode.link_cards) ? episode.link_cards : []
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
  const posts = await fromTable<CommunityPost>("community_posts", fallbackPosts, "status.eq.approved");
  return posts
    .map((post) => ({ ...post, image_url: post.image_url ?? null }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getCommunityPostBySlug(slug: string) {
  const posts = await getApprovedCommunityPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPublishedHosts(): Promise<HostProfile[]> {
  const hosts = await fromTable<HostProfile>("host_profiles", fallbackHosts);
  return hosts.sort((a, b) => a.display_order - b.display_order);
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
