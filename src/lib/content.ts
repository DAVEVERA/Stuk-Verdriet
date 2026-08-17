import {
  fallbackCategories,
  fallbackEpisodes,
  fallbackFaqs,
  fallbackHosts,
  fallbackInterviews,
  fallbackPosts,
  fallbackSeasons,
  fallbackSocialLinks,
  fallbackSponsors
} from "@/lib/fallback-data";
import { normalizeSectionDesign } from "@/lib/section-design";
import { createSupabaseAdminClient, createSupabasePublicClient } from "@/lib/supabase";
import type {
  CommunityCategory,
  CommunityPost,
  CommunityReply,
  FAQ,
  HostProfile,
  Interview,
  InterviewComment,
  PodcastEpisode,
  PodcastSeason,
  SiteDesignSettings,
  SiteSettings,
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

type CommunityProfileLookup = {
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
};

function normalizeCommunityPost(post: CommunityPost): CommunityPost {
  return {
    ...post,
    image_url: post.image_url ?? null,
    post_type: post.post_type ?? "story",
    resource_url: post.resource_url ?? null,
    resource_label: post.resource_label ?? null,
    tags: Array.isArray(post.tags) ? post.tags : [],
    replies: Array.isArray(post.replies) ? post.replies : []
  };
}

function attachReplyTree(replies: CommunityReply[]) {
  const byId = new Map<string, CommunityReply>();
  replies.forEach((reply) => byId.set(reply.id, { ...reply, replies: [] }));

  const topLevel: CommunityReply[] = [];
  byId.forEach((reply) => {
    if (reply.parent_reply_id && byId.has(reply.parent_reply_id)) {
      byId.get(reply.parent_reply_id)?.replies?.push(reply);
    } else {
      topLevel.push(reply);
    }
  });

  return topLevel;
}

function applyProfilesToPosts(posts: CommunityPost[], profiles: Map<string, CommunityProfileLookup>) {
  return posts.map((post) => ({
    ...post,
    author_name: post.author_name ?? (post.user_id ? profiles.get(post.user_id)?.display_name ?? null : null),
    author_avatar_url: post.user_id ? profiles.get(post.user_id)?.avatar_url ?? null : null
  }));
}

function applyProfilesToReplies(replies: CommunityReply[], profiles: Map<string, CommunityProfileLookup>) {
  return replies.map((reply) => ({
    ...reply,
    author_name: reply.author_name ?? (reply.user_id ? profiles.get(reply.user_id)?.display_name ?? null : null),
    author_avatar_url: reply.user_id ? profiles.get(reply.user_id)?.avatar_url ?? null : null
  }));
}

async function fromTable<T>(table: string, fallback: T[], query = "status.eq.published") {
  const supabase = createSupabasePublicClient();
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
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallbackEpisodes.map(normalizeEpisode).sort(newestFirst);

  const { data, error } = await supabase
    .from("podcast_episodes")
    .select("*")
    .in("status", ["published", "scheduled"]);

  if (error || !data) {
    return fallbackEpisodes.map(normalizeEpisode).sort(newestFirst);
  }

  const now = new Date();
  const filtered = (data as PodcastEpisode[]).filter((episode) => {
    if (episode.status === "published") return true;
    if (episode.status === "scheduled") {
      if (!episode.publication_date) return false;
      return new Date(episode.publication_date) <= now;
    }
    return false;
  });

  const source = filtered.length ? filtered : fallbackEpisodes;
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
  const supabase = createSupabasePublicClient();
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

export async function getApprovedCommunityPosts(currentUserId?: string | null): Promise<CommunityPost[]> {
  const supabase = createSupabaseAdminClient() ?? createSupabasePublicClient();
  if (!supabase) return fallbackPosts;
  const { data, error } = await supabase.from("community_posts").select("*").eq("status", "approved");
  if (error || !data || data.length === 0) return fallbackPosts;
  const posts = (data as CommunityPost[]).map(normalizeCommunityPost);
  const postIds = posts.map((post) => post.id);
  const postUserIds = posts.map((post) => post.user_id).filter((value): value is string => Boolean(value));

  const [{ data: supportRows }, { data: replyRows }] = await Promise.all([
    currentUserId && postIds.length
      ? supabase.from("community_supports").select("post_id").eq("user_id", currentUserId).in("post_id", postIds)
      : Promise.resolve({ data: [] as Array<{ post_id: string }> }),
    postIds.length
      ? supabase
          .from("community_replies")
          .select("*")
          .in("post_id", postIds)
          .eq("status", "approved")
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] as CommunityReply[] })
  ]);

  const replies = ((replyRows ?? []) as CommunityReply[]).map((reply) => ({ ...reply, replies: [] }));
  const replyUserIds = replies.map((reply) => reply.user_id).filter((value): value is string => Boolean(value));
  const userIds = [...new Set([...postUserIds, ...replyUserIds])];
  const profiles = new Map<string, CommunityProfileLookup>();

  if (userIds.length) {
    const { data: profileRows } = await supabase
      .from("community_profiles")
      .select("user_id,display_name,avatar_url")
      .in("user_id", userIds);
    ((profileRows ?? []) as CommunityProfileLookup[]).forEach((profile) => profiles.set(profile.user_id, profile));
  }

  const supported = new Set(((supportRows ?? []) as Array<{ post_id: string }>).map((row) => row.post_id));
  const repliesByPost = new Map<string, CommunityReply[]>();
  attachReplyTree(applyProfilesToReplies(replies, profiles)).forEach((reply) => {
    const list = repliesByPost.get(reply.post_id) ?? [];
    list.push(reply);
    repliesByPost.set(reply.post_id, list);
  });

  return applyProfilesToPosts(posts, profiles)
    .map((post) => ({
      ...post,
      has_supported: supported.has(post.id),
      replies: (repliesByPost.get(post.id) ?? []).slice(0, 3).map((reply) => ({
        ...reply,
        replies: (reply.replies ?? []).slice(0, 2)
      }))
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getApprovedCommunityPostBySlug(slug: string) {
  const posts = await getApprovedCommunityPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getApprovedCommunityReplies(postId: string): Promise<CommunityReply[]> {
  const supabase = createSupabaseAdminClient() ?? createSupabasePublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("community_replies")
    .select("*")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  const replies = data as CommunityReply[];
  const userIds = [...new Set(replies.map((reply) => reply.user_id).filter((value): value is string => Boolean(value)))];
  const profiles = new Map<string, CommunityProfileLookup>();
  if (userIds.length) {
    const { data: profileRows } = await supabase
      .from("community_profiles")
      .select("user_id,display_name,avatar_url")
      .in("user_id", userIds);
    ((profileRows ?? []) as CommunityProfileLookup[]).forEach((profile) => profiles.set(profile.user_id, profile));
  }
  return attachReplyTree(applyProfilesToReplies(replies, profiles));
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
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallbackSocialLinks;
  const { data, error } = await supabase.from("site_settings").select("social_links").eq("id", "main").single();
  if (error || !data?.social_links) return fallbackSocialLinks;
  return data.social_links as SocialLinks;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = { logo_url: null, homepage_intro: null };
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallback;
  const { data, error } = await supabase.from("site_settings").select("logo_url, homepage_intro").eq("id", "main").single();
  if (error || !data) return fallback;
  return { logo_url: data.logo_url ?? null, homepage_intro: data.homepage_intro ?? null };
}

export async function getSiteDesignSettings(): Promise<SiteDesignSettings> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return {};
  const { data, error } = await supabase.from("site_settings").select("social_links").eq("id", "main").single();
  if (error || !data?.social_links || typeof data.social_links !== "object") return {};
  return normalizeSectionDesign((data.social_links as Record<string, unknown>).section_styles);
}

export async function getPublishedInterviews(): Promise<Interview[]> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallbackInterviews;

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("status", "published")
    .order("publication_date", { ascending: false });

  if (error || !data) return fallbackInterviews;
  return data as Interview[];
}

export async function getInterviewsWithComments() {
  const interviews = await getPublishedInterviews();
  const supabase = createSupabasePublicClient();
  if (!supabase) return { interviews, commentsByInterview: {} };

  const { data: comments, error } = await supabase
    .from("interview_comments")
    .select("*")
    .eq("status", "approved");

  if (error || !comments) return { interviews, commentsByInterview: {} };

  const commentsByInterview: Record<string, InterviewComment[]> = {};
  interviews.forEach((interview) => {
    commentsByInterview[interview.id] = (comments as any[]).filter(
      (c) => c.interview_id === interview.id
    );
  });

  return { interviews, commentsByInterview };
}
