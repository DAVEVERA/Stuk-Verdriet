-- Eerste interview: "Ik ben vooral... ik" (bron: Heelal van mijn hart.txt)
-- Idempotent: bestaat de slug al, dan wordt de inhoud bijgewerkt.

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
