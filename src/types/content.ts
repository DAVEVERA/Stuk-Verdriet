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
  user_id?: string | null;
  author_name: string | null;
  author_display_type: AuthorDisplayType;
  author_avatar_url?: string | null;
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
  has_supported?: boolean;
  replies?: CommunityReply[];
};

export type CommunityReply = {
  id: string;
  post_id: string;
  user_id?: string | null;
  parent_reply_id?: string | null;
  author_name: string | null;
  author_display_type: AuthorDisplayType;
  author_avatar_url?: string | null;
  body: string;
  created_at: string;
  status: CommunityStatus;
  replies?: CommunityReply[];
};

export type CommunityProfile = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  cover_url?: string | null;
  bio?: string | null;
  profile_details?: CommunityProfileDetails | null;
  is_discoverable: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CommunityProfileDetails = {
  category?: string;
  pronouns?: string;
  birthday?: string;
  hometown?: string;
  current_city?: string;
  relationship_status?: string;
  job_title?: string;
  employer?: string;
  education?: string;
  hobbies?: string;
  interests?: string;
  places?: string;
  website?: string;
  contact_email?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};

export type CommunityProfilePhoto = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
};

export type CommunityProfileEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  image_url: string | null;
  created_at: string;
};

export type CommunityFriendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
};

export type CommunityMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type CommunityConversationParticipant = {
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  created_at: string;
  community_profiles?: CommunityProfile | CommunityProfile[] | null;
};

export type CommunityConversation = {
  id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  community_conversation_participants?: CommunityConversationParticipant[];
  community_messages?: CommunityMessage[];
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

export type { Interview, InterviewComment, InterviewEngagement } from "./interview";
