export type ContentStatus = "draft" | "scheduled" | "published" | "archived";
export type CommunityStatus = "pending" | "approved" | "rejected" | "archived";
export type AuthorDisplayType = "real_name" | "first_name" | "anonymous";

export type PodcastSeason = {
  id: string;
  title: string;
  season_number: number;
  description: string | null;
  cover_image: string | null;
  status: ContentStatus;
};

export type PodcastLinkCard = {
  label: string;
  url: string;
  description: string | null;
  type: "link" | "spotify" | "podimo" | "apple" | "book" | "donation";
};

export type PodcastTranscriptStatus = "missing" | "processing" | "ready" | "failed";

export type PodcastTranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type PodcastEpisode = {
  id: string;
  title: string;
  slug: string;
  season_number: number;
  episode_number: number;
  short_intro: string | null;
  description: string | null;
  audio_file_url: string | null;
  spotify_url: string | null;
  podimo_url: string | null;
  apple_podcast_url: string | null;
  image_url: string | null;
  publication_date: string | null;
  next_episode_date: string | null;
  duration: string | null;
  link_cards: PodcastLinkCard[];
  transcript_status: PodcastTranscriptStatus;
  transcript_language: string | null;
  transcript_segments: PodcastTranscriptSegment[];
  transcript_vtt_url: string | null;
  transcript_operation_name: string | null;
  transcript_generated_at: string | null;
  featured_latest: boolean;
  status: ContentStatus;
  created_at?: string;
  updated_at?: string;
};

export type CommunityCategory = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: "heart" | "users" | "user" | "leaf" | "message" | "star" | "shield";
  display_order: number;
};

export type CommunityPost = {
  id: string;
  author_name: string | null;
  author_display_type: AuthorDisplayType;
  title: string;
  slug: string;
  body: string;
  image_url: string | null;
  category: string;
  post_type?: "story" | "question" | "tip" | "link";
  resource_url?: string | null;
  resource_label?: string | null;
  tags: string[];
  target_group: string | null;
  created_at: string;
  updated_at?: string;
  status: CommunityStatus;
  reply_count: number;
  support_count: number;
};

export type CommunityReply = {
  id: string;
  post_id: string;
  user_id?: string | null;
  author_name: string | null;
  author_display_type: AuthorDisplayType;
  body: string;
  created_at: string;
  status: CommunityStatus;
};

export type HostProfile = {
  id: string;
  name: string;
  role: string | null;
  image_url: string | null;
  bio: string | null;
  personal_motivation: string | null;
  display_order: number;
  status: ContentStatus;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
  status: ContentStatus;
};

export type SocialLinks = {
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  spotify_url: string | null;
  youtube_music_url: string | null;
  podimo_url: string | null;
  apple_podcast_url: string | null;
};

export type SectionDesignKey =
  | "hero"
  | "signup"
  | "podcast"
  | "themes"
  | "community"
  | "aya"
  | "hosts";

export type SectionDesignSettings = {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: "brand" | "display" | "handwritten";
  fontScale: "compact" | "normal" | "large";
  spacing: "compact" | "normal" | "spacious";
  maxWidth: "standard" | "wide" | "full";
  minHeight: "auto" | "focus" | "screen";
  layout: "default" | "centered" | "split" | "dense";
};

export type SiteDesignSettings = Partial<Record<SectionDesignKey, Partial<SectionDesignSettings>>>;

export type SponsorLogo = {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  display_order: number;
  status: ContentStatus;
};

export type ThemeArticleBlock =
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "list";
      items: string[];
    };

export type ThemeArticleSection = {
  heading: string;
  blocks: ThemeArticleBlock[];
};

export type ThemeArticleSeo = {
  title: string;
  metaDescription: string;
  slug: string;
  cardText: string;
};

export type ThemeArticle = {
  slug: string;
  title: string;
  intro: string[];
  sections: ThemeArticleSection[];
  seo: ThemeArticleSeo;
};
