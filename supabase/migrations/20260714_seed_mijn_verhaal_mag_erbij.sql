-- Interview/blog entry: "Mijn verhaal mag erbij"
-- Idempotent: bestaat de slug al, dan wordt de inhoud bijgewerkt.

INSERT INTO interviews (title, slug, excerpt, full_content, cover_image_url, interviewee_name, publication_date, tags, status)
VALUES (
  'Mijn verhaal mag erbij',
  'mijn-verhaal-mag-erbij',
  'Achter Stuk Verdriet staat niet alleen een podcast, maar ook een plek die met aandacht, gevoel en overtuiging is gebouwd.',
  $interview_content$# Mijn verhaal mag erbij

Achter Stuk Verdriet staat niet alleen een podcast, maar ook een plek die met aandacht, gevoel en overtuiging is gebouwd.

De afgelopen periode heb ik met veel toewijding gewerkt aan stukverdriet.com. Niet zomaar een website, maar een plek die recht doet aan waar Stuk Verdriet voor staat. Een plek waar je alle podcastafleveringen kunt beluisteren, ook als je geen abonnement hebt op Spotify, Apple Podcasts of Podimo. Juist omdat verlies iedereen kan raken, vond ik het belangrijk dat de verhalen voor iedereen toegankelijk zijn.

Maar al snel ontdekte ik dat dit geen alledaags project was.

Normaal bouw ik webshops, AI-oplossingen en digitale platformen. Projecten waarin logica, techniek en efficiëntie centraal staan. Dit was anders. Rouw laat zich nu eenmaal niet netjes uitlijnen in een scriptje, een onepager of een contactformulier. Je kunt verdriet niet vangen in pixels alleen.

Zoiets bouw je niet met je hoofd, maar met je hart.

Mijn overtuiging was daarom helder: de techniek mocht nooit op de voorgrond staan. Alles moest in dienst staan van de mensen die hier terechtkomen. Een omgeving die rust uitstraalt. Waar verhalen mogen bestaan. Een plek waar iets uitgesproken kan worden wat niet in woorden te bevatten is en waar je hopelijk voelt dat je er niet alleen voor staat.

Voor mij stopt dit project hier dan ook niet. De komende tijd wil ik Stuk Verdriet verder uitbreiden tot een volwaardig communityplatform. Een plek waar mensen elkaar kunnen vinden, ervaringen kunnen delen en werkelijk kunnen ervaren dat verdriet niet alleen gedragen hoeft te worden.

Natuurlijk is er de GoFundMe. Iedere donatie, hoe klein ook, wordt enorm gewaardeerd en helpt om Stuk Verdriet verder te laten groeien. De link vind je in de bio.

Maar misschien is jouw bijdrage wel iets anders. Deel een aflevering. Vertel over Stuk Verdriet. Of laat simpelweg weten dat deze plek bestaat.

Deze plek is er. Ik hoop hiermee iets meer gebouwd te hebben dan een website en ik ben dankbaar dat ik een fundament kon bouwen voor iets waar mensen zich gezien, gehoord en minder alleen voelen.

Verdriet verdient een stem. Laat van je horen.

Veel succes en bedankt Daniela, Susan Mathijsen, Anissa Kroot en Anita voor deze bijzondere en eervolle opdracht.$interview_content$,
  NULL,
  'Dave Vera',
  '2026-07-14',
  ARRAY['stuk verdriet', 'website', 'community', 'toegankelijkheid', 'verhalen'],
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  full_content = EXCLUDED.full_content,
  cover_image_url = EXCLUDED.cover_image_url,
  interviewee_name = EXCLUDED.interviewee_name,
  publication_date = EXCLUDED.publication_date,
  tags = EXCLUDED.tags,
  status = 'published',
  updated_at = NOW();
