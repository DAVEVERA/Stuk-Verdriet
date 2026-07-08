-- ============================================================
-- STUK VERDRIET — INTERVIEWS: ALLES-IN-ÉÉN INSTALLATIE
-- Plak dit hele bestand in de SQL Editor van het Supabase-
-- dashboard (project nrpjgrlwsjxvlxlexhrs) en klik op Run.
-- Dit is een gemakskopie van de drie migraties in
-- supabase/migrations/ en is veilig om vaker uit te voeren.
-- ============================================================

-- ---------- 1. Tabellen ----------

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

CREATE TABLE IF NOT EXISTS interview_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(interview_id, user_id)
);

CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES interview_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_publication_date ON interviews(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_slug ON interviews(slug);
CREATE INDEX IF NOT EXISTS idx_interview_comments_interview_id ON interview_comments(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_comments_status ON interview_comments(status);
CREATE INDEX IF NOT EXISTS idx_interview_likes_interview_id ON interview_likes(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_likes_user_id ON interview_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published interviews" ON interviews;
CREATE POLICY "Anyone can read published interviews"
  ON interviews FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Anyone can read approved comments" ON interview_comments;
CREATE POLICY "Anyone can read approved comments"
  ON interview_comments FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can view likes" ON interview_likes;
CREATE POLICY "Authenticated users can view likes"
  ON interview_likes FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage own likes" ON interview_likes;
CREATE POLICY "Authenticated users can manage own likes"
  ON interview_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view comment likes" ON comment_likes;
CREATE POLICY "Authenticated users can view comment likes"
  ON comment_likes FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage own comment likes" ON comment_likes;
CREATE POLICY "Authenticated users can manage own comment likes"
  ON comment_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- 2. Anoniem reageren, tellers en subscribers ----------

DROP POLICY IF EXISTS "Authenticated users can create comments" ON interview_comments;
DROP POLICY IF EXISTS "Anyone can create pending comments" ON interview_comments;
CREATE POLICY "Anyone can create pending comments"
  ON interview_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

REVOKE UPDATE ON interviews FROM anon, authenticated;
GRANT UPDATE (like_count, share_count, comment_count) ON interviews TO anon, authenticated;
DROP POLICY IF EXISTS "Anyone can update engagement counters" ON interviews;
CREATE POLICY "Anyone can update engagement counters"
  ON interviews FOR UPDATE
  TO anon, authenticated
  USING (status = 'published')
  WITH CHECK (status = 'published');

REVOKE UPDATE ON interview_comments FROM anon, authenticated;
GRANT UPDATE (like_count) ON interview_comments TO authenticated;
DROP POLICY IF EXISTS "Authenticated can update comment like counter" ON interview_comments;
CREATE POLICY "Authenticated can update comment like counter"
  ON interview_comments FOR UPDATE
  TO authenticated
  USING (status = 'approved')
  WITH CHECK (status = 'approved');

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

-- ---------- 3. Eerste interview ----------

INSERT INTO interviews (title, slug, excerpt, full_content, cover_image_url, interviewee_name, publication_date, tags, status)
VALUES (
  'Ik ben vooral... ik',
  'ik-ben-vooral-ik',
  'Een persoonlijk verhaal over de vele gezichten van rouw, gemis en hoe liefde van vorm verandert wanneer iemand sterft.',
  $interview_content$# Ik ben vooral... ik

Ik ben moeder. Ik ben kind. Ik ben vrouw. Ik ben zus. Maar boven alles ben ik vooral ik.

Ik kan huilen, lachen, brullen, fluisteren en schreeuwen. Maar misschien ben ik nog wel het vaakst stil.

Zoals zovelen heb ik afscheid moeten nemen van mensen die mij dierbaar waren. Niet van mijn eigen kind, maar wel van iemands kind. En pas wanneer verdriet je leven binnenwandelt, ontdek je hoeveel gezichten rouw eigenlijk heeft.

Na de voortdurende golf van verdriet die volgde op het overlijden van mijn moeder en later mijn vriendin, kreeg ik onverwacht een inkijkje in een heel ander verdriet. Het verdriet van een moeder die haar kind verloor. Mijn oma.

## Het verdriet van een moeder

Mijn oma was 74 jaar toen haar dochter, mijn moeder, overleed. Mijn moeder werd slechts vijftig jaar. Een leeftijd waarop je nog midden in het leven hoort te staan.

Niemand leek het verdriet van oma echt te zien.

Ze zat zoals altijd aan de grote tafel, bedekt met het vertrouwde Perzische tafelkleed. Wanneer oma nadacht of haar emoties probeerde te bedwingen, trok ze met haar wijsvinger kleine streepjes door de vleug van het kleed. Een bijna onzichtbaar ritueel dat meer vertelde dan woorden ooit konden.

Eigenlijk was oma nooit stil. Ze kon over van alles praten. Desnoods over een aflevering van The Bold and the Beautiful. Maar over haar eigen verdriet sprak ze nauwelijks.

Pas veel later besefte ik dat de slijtage van het tafelkleed misschien wel liet zien hoeveel uren ze daar alleen had gezeten. Familie kwam trouw eens in de veertien dagen langs voor een kort bezoek. Daarna bleef de stilte weer achter.

En met die stilte haar verdriet.

Haar dochter was er niet meer.

Maar zij moest sterk zijn. Vooral niet huilen. Misschien een enkele traan wanneer niemand keek. Want zo was ze opgevoed. Emoties hield je voor jezelf. Huilen hielp toch niet.

## De Last van Sterkzijn

Wat is rouwen eigenlijk moeilijk wanneer mensen denken dat het wel goed met je gaat.

"Ach, oma redt zich wel."

Hoe vaak zeggen we dat niet over iemand? Alsof overleven hetzelfde is als verwerken.

Ik zag iets anders.

Ik besloot mijn eigen verdriet niet langer voor haar verborgen te houden. Ik huilde aan haar tafel. Ik sprak over mijn gemis. En precies op dat moment gebeurde er iets wat ik nooit meer zal vergeten.

Vanonder haar bril rolde heel voorzichtig een klein, verstolen traantje.

Daarna volgde een diepe zucht.

Alsof er na al die tijd heel even ruimte ontstond om moeder te mogen zijn. Om verdriet te mogen voelen. Om niet sterk te hoeven zijn.

Dat ene kleine traantje vertelde meer dan duizend woorden.

## Over Gemis en Liefde

Ik heb dan misschien geen kind verloren, maar ik ken de pijn van verlies. Ik ken de eenzaamheid die je kan overvallen, zelfs wanneer er mensen om je heen zijn. Dat verstikkende gevoel van niet weten hoe je verder moet. En die ene vraag die zich eindeloos blijft herhalen.

Waarom?

Waarom moet ik jou missen?

Of het nu je kind is, je broer, je zus, je moeder, je vader of een dierbare vriend. Waarom blijft het gemis zo aanwezig?

Op die vraag bestaat geen antwoord.

Wel geloof ik dat liefde niet verdwijnt wanneer iemand sterft. Ze verandert alleen van vorm.

Jaren geleden hoorde ik een liedje waarvan één zin zich voorgoed in mijn hart nestelde:

"Ik wil wonen op een ster in het heelal van jouw hart. Op de allerkleinste ster in het heelal van jouw hart."

Sindsdien draag ik die woorden altijd met me mee.

Want ergens geloof ik dat daar, op die allerkleinste ster in het heelal van ons hart, de mensen wonen die wij zo intens missen.

En misschien is dat wel de enige plek waar afscheid en liefde voor altijd naast elkaar mogen bestaan.$interview_content$,
  '/img/interview1.png',
  'Anoniem',
  '2026-07-08',
  '{}',
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  full_content = EXCLUDED.full_content,
  cover_image_url = EXCLUDED.cover_image_url,
  interviewee_name = EXCLUDED.interviewee_name,
  publication_date = EXCLUDED.publication_date,
  status = 'published',
  updated_at = NOW();
