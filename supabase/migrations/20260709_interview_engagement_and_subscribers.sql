-- Interviews: anoniem reageren, engagement-tellers en naam/e-mail opslag
-- Sluit aan op de app-flows in src/lib/interview-actions.ts

-- 1. Reacties: iedereen (ook zonder account) mag een reactie insturen.
--    Nieuwe reacties staan altijd op 'pending' tot de beheerder goedkeurt.
DROP POLICY IF EXISTS "Authenticated users can create comments" ON interview_comments;
DROP POLICY IF EXISTS "Anyone can create pending comments" ON interview_comments;
CREATE POLICY "Anyone can create pending comments"
  ON interview_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- 2. Engagement-tellers op interviews: bezoekers mogen ALLEEN de
--    tellerkolommen bijwerken (hartjes/delen/reacties), nooit de inhoud.
REVOKE UPDATE ON interviews FROM anon, authenticated;
GRANT UPDATE (like_count, share_count, comment_count) ON interviews TO anon, authenticated;
DROP POLICY IF EXISTS "Anyone can update engagement counters" ON interviews;
CREATE POLICY "Anyone can update engagement counters"
  ON interviews FOR UPDATE
  TO anon, authenticated
  USING (status = 'published')
  WITH CHECK (status = 'published');

-- 3. Like-teller op reacties (alleen ingelogde gebruikers liken reacties)
REVOKE UPDATE ON interview_comments FROM anon, authenticated;
GRANT UPDATE (like_count) ON interview_comments TO authenticated;
DROP POLICY IF EXISTS "Authenticated can update comment like counter" ON interview_comments;
CREATE POLICY "Authenticated can update comment like counter"
  ON interview_comments FOR UPDATE
  TO authenticated
  USING (status = 'approved')
  WITH CHECK (status = 'approved');

-- 4. Bezoekers die hun naam/e-mail achterlaten om op de hoogte te blijven.
--    Insturen mag door iedereen; lezen kan uitsluitend via de service role
--    (dashboard/admin) zodat e-mailadressen nooit publiek uitleesbaar zijn.
CREATE TABLE IF NOT EXISTS interview_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  interview_id UUID REFERENCES interviews(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_subscribers_interview_id ON interview_subscribers(interview_id);

ALTER TABLE interview_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON interview_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON interview_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
