import type {
  CommunityCategory,
  CommunityPost,
  FAQ,
  HostProfile,
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

export const fallbackEpisodes: PodcastEpisode[] = [
  {
    id: "episode-1",
    title: "Voor de vroege vogels",
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
