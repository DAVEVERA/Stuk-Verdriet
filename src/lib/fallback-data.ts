import type {
  CommunityCategory,
  CommunityPost,
  FAQ,
  HostProfile,
  Interview,
  PodcastEpisode,
  PodcastSeason,
  SocialLinks,
  SponsorLogo
} from "@/types/content";

export const fallbackSeasons: PodcastSeason[] = [
  {
    id: "season-1",
    title: "Seizoen 1",
    season_number: 1,
    description: null,
    cover_image: null,
    status: "published"
  }
];

export const fallbackInterviews: Interview[] = [
  {
    id: "interview-1",
    title: "Leven na het verlies van mijn moeder",
    slug: "leven-na-verlies-moeder",
    excerpt: "Een eerlijk gesprek over rouw, herinnering en hoe je weitergaat zonder de persoon die je het meest dierbaar was.",
    full_content: `# Leven na het verlies van mijn moeder

Dit is een diepgaand interview over het verliesproces en hoe we betekenis geven aan herinneringen.

## Het moment van afscheid

De eerste dagen waren surrealistisch. Ik kon niet geloven dat ze echt weg was...

## Hoe ik mezelf terug heb gevonden

Maanden gingen voorbij voordat ik kon lachen zonder me schuldig te voelen. Dat moment...`,
    cover_image_url: "https://images.unsplash.com/photo-1516979187457-635ffe35ff15?auto=format&fit=crop&w=800&q=80",
    interviewee_name: "Maria",
    publication_date: "2026-06-15",
    tags: ["verlies", "moeder", "rouw", "herinnering"],
    like_count: 24,
    comment_count: 7,
    share_count: 12,
    status: "published"
  },
  {
    id: "interview-2",
    title: "Kanker op jonge leeftijd: mijn verhaal",
    slug: "kanker-jong-verhaal",
    excerpt: "Op mijn 28e kreeg ik de diagnose kanker. Dit is hoe ik die reis heb doorstaan en wat ik daarvan heb geleerd.",
    full_content: `# Kanker op jonge leeftijd: mijn verhaal

De diagnose was een schok die ik nooit zou kunnen vergeten...

## De behandeling

Zes maanden chemotherapie veranderden alles in mijn perspectief...`,
    cover_image_url: "https://images.unsplash.com/photo-1631217b0fbb-4dc-4d70-a9cd-8faae3b0d5ea?auto=format&fit=crop&w=800&q=80",
    interviewee_name: "Thomas",
    publication_date: "2026-05-20",
    tags: ["gezondheid", "kanker", "AYA", "hoop"],
    like_count: 42,
    comment_count: 15,
    share_count: 28,
    status: "published"
  },
  {
    id: "interview-3",
    title: "Mijn broer helpen door zijn rouw",
    slug: "broer-helpen-rouw",
    excerpt: "Als broer of zus van iemand die rouwt, weet je niet altijd wat je moet zeggen. Dit interview gaat over dat gevoel.",
    full_content: `# Mijn broer helpen door zijn rouw

Je voelt je hulpeloos omdat je het verdriet van je dierbaren niet kunt wegnemen...

## Wat werkelijk hielp

Luisteren bleek meer waard dan troostende woorden...`,
    cover_image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    interviewee_name: "Sarah",
    publication_date: "2026-04-10",
    tags: ["familie", "steun", "naasten", "verbinding"],
    like_count: 18,
    comment_count: 5,
    share_count: 9,
    status: "published"
  },
  {
    id: "interview-4",
    title: "Ik ben vooral... ik",
    slug: "ik-ben-vooral-ik",
    excerpt: "Een persoonlijk verhaal over het vele gezichten van rouw, gemis en hoe liefde van vorm verandert wanneer iemand sterft.",
    full_content: `# Ik ben vooral... ik

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

En misschien is dat wel de enige plek waar afscheid en liefde voor altijd naast elkaar mogen bestaan.`,
    cover_image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    interviewee_name: "Anoniem",
    publication_date: "2026-07-08",
    tags: ["verlies", "rouw", "liefde", "moeder", "herinnering", "gemis"],
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    status: "published"
  }
];

export const fallbackEpisodes: PodcastEpisode[] = [
  {
    id: "episode-1",
    title: "Trailer: Voor de vroege vogels",
    slug: "voor-de-vroege-vogels",
    season_number: 0,
    episode_number: 0,
    short_intro: "Luister naar deze bijzondere aflevering.",
    description: "Deze aflevering kun je nu beluisteren.",
    audio_file_url: "/audio/Voor de vroege vogels.mp3",
    spotify_url: null,
    podimo_url: null,
    apple_podcast_url: null,
    image_url:
      "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
    publication_date: "2026-06-18",
    next_episode_date: "2026-07-02",
    duration: "00:06",
    link_cards: [],
    transcript_status: "missing",
    transcript_language: "nl-NL",
    transcript_segments: [],
    transcript_vtt_url: null,
    transcript_operation_name: null,
    transcript_generated_at: null,
    featured_latest: true,
    status: "published"
  }
];

export const fallbackCategories: CommunityCategory[] = [
  { id: "rouw", title: "Rouw algemeen", slug: "rouw-algemeen", description: "Ruimte voor herkenning, vragen en steun.", icon: "heart", display_order: 1 },
  { id: "ouders", title: "Voor ouders", slug: "voor-ouders", description: "Voor ouders die leven met gemis.", icon: "users", display_order: 2 },
  { id: "ayas", title: "Voor AYA's", slug: "voor-ayas", description: "Voor jonge mensen die rouw meemaken.", icon: "user", display_order: 3 },
  { id: "naasten", title: "Naasten en familie", slug: "naasten-en-familie", description: "Voor broers, zussen, vrienden en andere naasten.", icon: "users", display_order: 4 },
  { id: "praktisch", title: "Praktische steun", slug: "praktische-steun", description: "Ervaringen en tips voor wat er geregeld moet worden.", icon: "leaf", display_order: 5 },
  { id: "vragen", title: "Vragen & antwoorden", slug: "vragen-en-antwoorden", description: "Stel een vraag of reageer op die van een ander.", icon: "message", display_order: 6 },
  { id: "verhalen", title: "Verhalen & herkenning", slug: "verhalen-en-herkenning", description: "Persoonlijke verhalen die mogen bestaan.", icon: "star", display_order: 7 },
  { id: "podcast", title: "Podcast", slug: "podcast", description: "Echte stemmen en eerlijke gesprekken over missen, liefhebben en verder leven.", icon: "message", display_order: 8 },
  { id: "hulp", title: "Hulp & ondersteuning", slug: "hulp-en-ondersteuning", description: "Soms is er meer nodig dan tijd alleen.", icon: "shield", display_order: 9 },
  { id: "herinneren", title: "Herinneren", slug: "herinneren", description: "Omdat liefde niet stopt waar het leven eindigt.", icon: "heart", display_order: 10 },
  { id: "leven-na-verlies", title: "Leven na verlies", slug: "leven-na-verlies", description: "Verder leven zonder verder te hoeven gaan.", icon: "leaf", display_order: 11 },
  { id: "omgeving", title: "Voor de omgeving", slug: "voor-de-omgeving", description: "Je hoeft niet de juiste woorden te hebben om er te zijn.", icon: "users", display_order: 12 }
];

export const fallbackPosts: CommunityPost[] = [
  {
    id: "post-1",
    author_name: null,
    author_display_type: "anonymous",
    title: "Hoe houd je ruimte voor iemand die gemist wordt?",
    slug: "ruimte-voor-iemand-die-gemist-wordt",
    body:
      "Een voorbeeld van een goedgekeurde communityvraag. In de live omgeving worden nieuwe berichten eerst door de beheerder gelezen.",
    image_url: null,
    category: "Rouw algemeen",
    tags: ["herkenning"],
    target_group: "naasten",
    created_at: "2026-06-04T10:00:00.000Z",
    status: "approved",
    reply_count: 0,
    support_count: 3
  }
];

export const fallbackHosts: HostProfile[] = [
  {
    id: "susan",
    name: "Susan",
    role: "Host",
    image_url: "/img/portretsuus.png",
    bio: null,
    personal_motivation: null,
    display_order: 1,
    status: "published"
  },
  {
    id: "daniela",
    name: "Daniela",
    role: "Host",
    image_url: "/img/portret-daniela.jpg",
    bio: null,
    personal_motivation: null,
    display_order: 2,
    status: "published"
  }
];

export const fallbackFaqs: FAQ[] = [];
export const fallbackSponsors: SponsorLogo[] = [];

export const fallbackSocialLinks: SocialLinks = {
  instagram_url: null,
  facebook_url: null,
  tiktok_url: null,
  spotify_url: null,
  youtube_music_url: null,
  podimo_url: null,
  apple_podcast_url: null
};
