export type Interview = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  full_content: string;
  cover_image_url: string | null;
  interviewee_name: string;
  publication_date: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  share_count: number;
  status: "published" | "draft";
};

export type InterviewComment = {
  id: string;
  interview_id: string;
  author_name: string | null;
  author_display_type: "anonymous" | "first_name" | "real_name";
  body: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  parent_comment_id: string | null;
  status: "approved" | "pending";
};

export type InterviewEngagement = {
  interview_id: string;
  user_id: string | null;
  has_liked: boolean;
  has_shared: boolean;
};
