import type {
  CommunityCategory,
  CommunityPost,
  FAQ,
  HostProfile,
  Interview,
  PodcastEpisode,
  PodcastSeason,
  LegalDocument,
  SocialLinks,
  SponsorLogo,
} from '@/types/content';

export const fallbackSeasons: PodcastSeason[] = [
  {
    id: 'season-1',
    title: 'Seizoen 1',
    season_number: 1,
    description: null,
    cover_image: null,
    status: 'published',
  },
];

export const fallbackInterviews: Interview[] = [
  {
    id: 'interview-mijn-verhaal-mag-erbij',
    title: 'Mijn verhaal mag erbij',
    slug: 'mijn-verhaal-mag-erbij',
    excerpt:
      'Achter Stuk Verdriet staat niet alleen een podcast, maar ook een plek die met aandacht, gevoel en overtuiging is gebouwd.',
    full_content: `# Mijn verhaal mag erbij

Achter Stuk Verdriet staat niet alleen een podcast, maar ook een plek die met aandacht, gevoel en overtuiging is gebouwd.

De afgelopen periode heb ik met veel toewijding gewerkt aan stukverdriet.com. Niet zomaar een website, maar een plek die recht doet aan waar Stuk Verdriet voor staat. Een plek waar je alle podcastafleveringen kunt beluisteren, ook als je geen abonnement hebt op Spotify, Apple Podcasts of Podimo. Juist omdat verlies iedereen kan raken, vond ik het belangrijk dat de verhalen voor iedereen toegankelijk zijn.

Maar al snel ontdekte ik dat dit geen alledaags project was.

Normaal bouw ik webshops, digitale oplossingen en platformen. Projecten waarin logica, techniek en efficiëntie centraal staan. Dit was anders. Rouw laat zich nu eenmaal niet netjes uitlijnen in een scriptje, een onepager of een contactformulier. Je kunt verdriet niet vangen in pixels alleen.

Zoiets bouw je niet met je hoofd, maar met je hart.

Mijn overtuiging was daarom helder: de techniek mocht nooit op de voorgrond staan. Alles moest in dienst staan van de mensen die hier terechtkomen. Een omgeving die rust uitstraalt. Waar verhalen mogen bestaan. Een plek waar iets uitgesproken kan worden wat niet in woorden te bevatten is en waar je hopelijk voelt dat je er niet alleen voor staat.

Voor mij stopt dit project hier dan ook niet. De komende tijd wil ik Stuk Verdriet verder uitbreiden tot een volwaardig communityplatform. Een plek waar mensen elkaar kunnen vinden, ervaringen kunnen delen en werkelijk kunnen ervaren dat verdriet niet alleen gedragen hoeft te worden.

Natuurlijk is er de GoFundMe. Iedere donatie, hoe klein ook, wordt enorm gewaardeerd en helpt om Stuk Verdriet verder te laten groeien. De link vind je in de bio.

Maar misschien is jouw bijdrage wel iets anders. Deel een aflevering. Vertel over Stuk Verdriet. Of laat simpelweg weten dat deze plek bestaat.

Deze plek is er. Ik hoop hiermee iets meer gebouwd te hebben dan een website en ik ben dankbaar dat ik een fundament kon bouwen voor iets waar mensen zich gezien, gehoord en minder alleen voelen.

Verdriet verdient een stem. Laat van je horen.

Veel succes en bedankt Daniela, Susan Mathijsen, Anissa Kroot en Anita voor deze bijzondere en eervolle opdracht.`,
    cover_image_url: '/img/DV.jpeg',
    interviewee_name: 'Dave Vera',
    publication_date: '2026-07-15',
    tags: ['stuk verdriet', 'website', 'community', 'toegankelijkheid', 'verhalen'],
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    status: 'published',
  },
  {
    id: 'interview-4',
    title: 'Ik ben vooral... ik',
    slug: 'ik-ben-vooral-ik',
    excerpt:
      'Een persoonlijk verhaal over het vele gezichten van rouw, gemis en hoe liefde van vorm verandert wanneer iemand sterft.',
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
    cover_image_url: '/img/interview1.png',
    interviewee_name: 'Anoniem',
    publication_date: '2026-07-08',
    tags: ['verlies', 'rouw', 'liefde', 'moeder', 'herinnering', 'gemis'],
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    status: 'published',
  },
];

export const fallbackEpisodes: PodcastEpisode[] = [
  {
    id: 'episode-1',
    title: 'Aflevering 1: Het begin.',
    slug: 'voor-de-vroege-vogels',
    season_number: 0,
    episode_number: 0,
    short_intro: 'Luister naar deze bijzondere aflevering.',
    description: 'Deze aflevering kun je nu beluisteren.',
    audio_file_url: '/audio/Aflevering 1.mpeg',
    spotify_url: 'https://open.spotify.com/episode/3Eh39z3GjPJB5ivTEB4zyX',
    podimo_url: null,
    apple_podcast_url: null,
    image_url:
      'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80',
    publication_date: '2026-06-18',
    next_episode_date: '2026-07-02',
    duration: '31:10',
    link_cards: [],
    transcript_status: 'missing',
    transcript_language: 'nl-NL',
    transcript_segments: [],
    transcript_vtt_url: null,
    transcript_operation_name: null,
    transcript_generated_at: null,
    featured_latest: false,
    status: 'published',
  },
  {
    id: 'episode-2',
    title: 'Afl. 2 - In gesprek met een AYA en haar vader',
    slug: 'in-gesprek-met-een-aya-en-haar-vader',
    season_number: 0,
    episode_number: 1,
    short_intro: 'Luister naar deze bijzondere aflevering.',
    description: 'Deze aflevering kun je nu beluisteren.',
    audio_file_url:
      'https://traffic.omny.fm/d/clips/56337cb8-b71d-4e6c-b279-b31700c37714/39e4cd19-74cc-4c95-82d1-b483009801e1/17a8a080-a3df-4694-a7a2-b49400ec1ef6/audio.mp3?utm_source=Podcast&in_playlist=75be1074-3a78-4407-80fb-b48300980637',
    spotify_url: 'https://open.spotify.com/episode/1krrANNcoXfDGxTX70pN5o',
    podimo_url: null,
    apple_podcast_url: null,
    image_url:
      'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80',
    publication_date: '2026-07-02',
    next_episode_date: null,
    duration: null,
    link_cards: [],
    transcript_status: 'missing',
    transcript_language: 'nl-NL',
    transcript_segments: [],
    transcript_vtt_url: null,
    transcript_operation_name: null,
    transcript_generated_at: null,
    featured_latest: false,
    status: 'published',
  },
  {
    id: 'episode-3',
    title: 'Afl. 3 - Rouw is rauw',
    slug: 'rouw-is-rauw',
    season_number: 0,
    episode_number: 2,
    short_intro: 'Luister naar deze bijzondere aflevering.',
    description: 'Deze aflevering kun je nu beluisteren.',
    audio_file_url: null,
    spotify_url: 'https://open.spotify.com/episode/7FGCF4p55XSYEKQ75D450P',
    podimo_url: null,
    apple_podcast_url: null,
    image_url:
      'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80',
    publication_date: '2026-08-10',
    next_episode_date: null,
    duration: null,
    link_cards: [],
    transcript_status: 'missing',
    transcript_language: 'nl-NL',
    transcript_segments: [],
    transcript_vtt_url: null,
    transcript_operation_name: null,
    transcript_generated_at: null,
    featured_latest: true,
    status: 'published',
  },
];

export const fallbackCategories: CommunityCategory[] = [
  {
    id: 'rouw',
    title: 'Rouw algemeen',
    slug: 'rouw-algemeen',
    description: 'Ruimte voor herkenning, vragen en steun.',
    icon: 'heart',
    display_order: 1,
  },
  {
    id: 'ouders',
    title: 'Voor ouders',
    slug: 'voor-ouders',
    description: 'Voor ouders die leven met gemis.',
    icon: 'users',
    display_order: 2,
  },
  {
    id: 'ayas',
    title: "Voor AYA's",
    slug: 'voor-ayas',
    description: 'Voor jonge mensen die rouw meemaken.',
    icon: 'user',
    display_order: 3,
  },
  {
    id: 'naasten',
    title: 'Naasten en familie',
    slug: 'naasten-en-familie',
    description: 'Voor broers, zussen, vrienden en andere naasten.',
    icon: 'users',
    display_order: 4,
  },
  {
    id: 'praktisch',
    title: 'Praktische steun',
    slug: 'praktische-steun',
    description: 'Ervaringen en tips voor wat er geregeld moet worden.',
    icon: 'leaf',
    display_order: 5,
  },
  {
    id: 'vragen',
    title: 'Vragen & antwoorden',
    slug: 'vragen-en-antwoorden',
    description: 'Stel een vraag of reageer op die van een ander.',
    icon: 'message',
    display_order: 6,
  },
  {
    id: 'verhalen',
    title: 'Verhalen & herkenning',
    slug: 'verhalen-en-herkenning',
    description: 'Persoonlijke verhalen die mogen bestaan.',
    icon: 'star',
    display_order: 7,
  },
  {
    id: 'podcast',
    title: 'Podcast',
    slug: 'podcast',
    description: 'Echte stemmen en eerlijke gesprekken over missen, liefhebben en verder leven.',
    icon: 'message',
    display_order: 8,
  },
  {
    id: 'hulp',
    title: 'Hulp & ondersteuning',
    slug: 'hulp-en-ondersteuning',
    description: 'Soms is er meer nodig dan tijd alleen.',
    icon: 'shield',
    display_order: 9,
  },
  {
    id: 'herinneren',
    title: 'Herinneren',
    slug: 'herinneren',
    description: 'Omdat liefde niet stopt waar het leven eindigt.',
    icon: 'heart',
    display_order: 10,
  },
  {
    id: 'leven-na-verlies',
    title: 'Leven na verlies',
    slug: 'leven-na-verlies',
    description: 'Verder leven zonder verder te hoeven gaan.',
    icon: 'leaf',
    display_order: 11,
  },
  {
    id: 'omgeving',
    title: 'Voor de omgeving',
    slug: 'voor-de-omgeving',
    description: 'Je hoeft niet de juiste woorden te hebben om er te zijn.',
    icon: 'users',
    display_order: 12,
  },
];

export const fallbackPosts: CommunityPost[] = [
  {
    id: 'post-1',
    author_name: null,
    author_display_type: 'anonymous',
    title: 'Hoe houd je ruimte voor iemand die gemist wordt?',
    slug: 'ruimte-voor-iemand-die-gemist-wordt',
    body: 'Soms wil ik iemands naam blijven noemen, maar ik twijfel of anderen dat zwaar vinden. Hoe doen jullie dat op verjaardagen, gewone dagen of momenten waarop iemand ineens heel dichtbij voelt?',
    image_url: null,
    category: 'Rouw algemeen',
    post_type: 'question',
    resource_url: null,
    resource_label: null,
    tags: ['herkenning'],
    target_group: 'naasten',
    created_at: '2026-07-14T10:00:00.000Z',
    status: 'approved',
    reply_count: 4,
    support_count: 18,
  },
  {
    id: 'post-2',
    author_name: 'Susan',
    author_display_type: 'first_name',
    title: 'Een klein ritueel voor een zware dag',
    slug: 'klein-ritueel-voor-een-zware-dag',
    body: 'Op dagen waarop alles scherp voelt, helpt het mij om iets kleins te doen dat niet hoeft te worden uitgelegd. Een kaars aan, een wandeling, een liedje, of gewoon even hardop zeggen: vandaag mis ik je.',
    image_url: null,
    category: 'Herinneren',
    post_type: 'tip',
    resource_url: null,
    resource_label: null,
    tags: ['ritueel', 'herinneren'],
    target_group: 'ouders',
    created_at: '2026-07-13T18:20:00.000Z',
    status: 'approved',
    reply_count: 7,
    support_count: 31,
  },
  {
    id: 'post-3',
    author_name: 'Daniela',
    author_display_type: 'first_name',
    title: 'Wat zeg je tegen iemand die net slecht nieuws heeft gekregen?',
    slug: 'wat-zeg-je-bij-slecht-nieuws',
    body: 'Ik merk dat veel mensen bang zijn om iets verkeerds te zeggen. Misschien helpt het om niet te zoeken naar de perfecte zin, maar naar aanwezigheid. Iets als: ik weet niet wat ik moet zeggen, maar ik ben er.',
    image_url: null,
    category: 'Voor de omgeving',
    post_type: 'story',
    resource_url: null,
    resource_label: null,
    tags: ['woorden', 'naasten'],
    target_group: 'vrienden',
    created_at: '2026-07-12T12:45:00.000Z',
    status: 'approved',
    reply_count: 3,
    support_count: 22,
  },
  {
    id: 'post-4',
    author_name: null,
    author_display_type: 'anonymous',
    title: 'Handige route: hulp en ondersteuning',
    slug: 'handige-route-hulp-en-ondersteuning',
    body: 'Voor wie merkt dat lezen alleen niet genoeg is: verzamel hier rustige routes naar hulp, lotgenotencontact en steun die past bij rouw, ziekte of langdurige spanning.',
    image_url: null,
    category: 'Hulp & ondersteuning',
    post_type: 'link',
    resource_url: '/themas/hulp-en-ondersteuning',
    resource_label: 'Bekijk hulp en ondersteuning',
    tags: ['hulp', 'lotgenoten'],
    target_group: null,
    created_at: '2026-07-11T09:15:00.000Z',
    status: 'approved',
    reply_count: 1,
    support_count: 12,
  },
];

export const fallbackHosts: HostProfile[] = [
  {
    id: 'susan',
    name: 'Susan',
    role: 'Host',
    image_url: '/img/portretsuus.png',
    bio: null,
    personal_motivation: null,
    display_order: 1,
    status: 'published',
  },
  {
    id: 'daniela',
    name: 'Daniela',
    role: 'Host',
    image_url: '/img/portret-daniela.jpg',
    bio: null,
    personal_motivation: null,
    display_order: 2,
    status: 'published',
  },
];

export const fallbackFaqs: FAQ[] = [];
export const fallbackLegalDocuments: LegalDocument[] = [];
export const fallbackSponsors: SponsorLogo[] = [];

export const fallbackSocialLinks: SocialLinks = {
  instagram_url: null,
  facebook_url: null,
  tiktok_url: null,
  spotify_url: null,
  youtube_music_url: null,
  podimo_url: null,
  apple_podcast_url: null,
};
