-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  full_content TEXT NOT NULL,
  cover_image_url TEXT,
  interviewee_name TEXT NOT NULL,
  publication_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_comments table
CREATE TABLE IF NOT EXISTS interview_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  author_name TEXT,
  author_display_type TEXT DEFAULT 'anonymous' CHECK (author_display_type IN ('anonymous', 'first_name', 'real_name')),
  body TEXT NOT NULL,
  parent_comment_id UUID REFERENCES interview_comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_likes table
CREATE TABLE IF NOT EXISTS interview_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(interview_id, user_id)
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES interview_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_publication_date ON interviews(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_slug ON interviews(slug);
CREATE INDEX IF NOT EXISTS idx_interview_comments_interview_id ON interview_comments(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_comments_status ON interview_comments(status);
CREATE INDEX IF NOT EXISTS idx_interview_likes_interview_id ON interview_likes(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_likes_user_id ON interview_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: interviews (public read, authenticated write)
CREATE POLICY "Anyone can read published interviews"
  ON interviews FOR SELECT
  USING (status = 'published');

-- RLS Policies: interview_comments (public read approved, authenticated write)
CREATE POLICY "Anyone can read approved comments"
  ON interview_comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can create comments"
  ON interview_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies: interview_likes (authenticated users only)
CREATE POLICY "Authenticated users can view likes"
  ON interview_likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage own likes"
  ON interview_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies: comment_likes (authenticated users only)
CREATE POLICY "Authenticated users can view comment likes"
  ON comment_likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage own comment likes"
  ON comment_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
