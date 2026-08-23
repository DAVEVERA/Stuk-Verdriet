import type { SiteContentSettings, SiteHeroSlide, SocialLinks } from "@/types/content";

export const defaultSocialLinks: SocialLinks = {
  instagram_url: null,
  facebook_url: null,
  tiktok_url: null,
  spotify_url: null,
  youtube_music_url: null,
  podimo_url: null,
  apple_podcast_url: null
};

export const defaultSiteContent: SiteContentSettings = {
  heroSlides: [
    {
      id: "podcast",
      image: "/img/podcastopnamehero.png",
      mobileImage: "/img/mobile/podcastopnameheromobiel.png",
      imageAlt: "Susan en Daniela tijdens een podcastopname",
      slogan: ["Verdriet verdient", "een stem."],
      mobileSlogan: ["Verdriet verdient een stem."],
      hideCopy: false,
      enabled: true
    },
    {
      id: "lavie",
      image: "/img/Laviehero.png",
      mobileImage: "/img/mobile/Lavieheromobiel.png",
      imageAlt: "Podcastopstelling bij La Vie met microfoons en een roze bank",
      slogan: ["Woorden geven aan", "wat niet te bevatten is."],
      mobileSlogan: ["Woorden geven aan", "wat niet te bevatten is."],
      hideCopy: false,
      enabled: true
    },
    {
      id: "episode-live",
      image: "/hero/Hero_ep1_live.png",
      mobileImage: "/hero/Hero_ep1_live.png",
      imageAlt: "Hero-afbeelding voor aflevering 1 live",
      slogan: ["Samen door wat niemand", "alleen zou moeten dragen."],
      mobileSlogan: ["Samen door wat niemand", "alleen zou moeten dragen."],
      hideCopy: true,
      enabled: true
    }
  ],
  hostsTitle: "Over de podcastmakers",
  communityKicker: "De community is live",
  communityTitle: "Je hoeft het niet alleen te doen.",
  communityBody: "Lees hoe anderen omgaan met verlies, deel je eigen verhaal of lees rustig mee. SNAAR is de community van Stuk Verdriet.",
  communityCtaLabel: "Ga naar SNAAR",
  ayaTitle: "Deze podcast is mogelijk gemaakt door het AYA Fonds.",
  ayaBody: "Het AYA Fonds zet zich in voor betere mentale, sociale en fysieke zorg voor jongvolwassenen met kanker (AYA's) en hun naasten. Met hun steun krijgen verhalen over rouw, zorg en verder leven een plek waar ze gehoord mogen worden.",
  ayaCtaLine: "Geef voor jongvolwassenen met kanker.",
  ayaSecondaryLabel: "Meer over AYA Fonds",
  ayaPrimaryLabel: "Doneer direct aan AYA Fonds",
  interviewsTitle: "Échte verhalen",
  interviewsIntro: "Echte verhalen van mensen die hun ervaringen delen rond verlies, rouw en verder leven.",
  communityHeroLine1: "Hoe gevoelig de snaar ook is,",
  communityHeroLine2: "hier raken we hem samen.",
  communityHeroLine3: "Je hoeft het niet alleen te doen.",
  communityFeedKicker: "Nieuw in de community",
  communityFeedTitle: "Jouw Feed",
  communityEmptyTitle: "De community wordt gevuld.",
  communityEmptyBody: "De eerste goedgekeurde verhalen, vragen en tips verschijnen hier. Je kunt alvast een bijdrage insturen."
};

const contentTextLimits: Record<Exclude<keyof SiteContentSettings, "heroSlides">, number> = {
  hostsTitle: 100,
  communityKicker: 180,
  communityTitle: 80,
  communityBody: 500,
  communityCtaLabel: 60,
  ayaTitle: 100,
  ayaBody: 700,
  ayaCtaLine: 220,
  ayaSecondaryLabel: 60,
  ayaPrimaryLabel: 60,
  interviewsTitle: 100,
  interviewsIntro: 350,
  communityHeroLine1: 70,
  communityHeroLine2: 70,
  communityHeroLine3: 70,
  communityFeedKicker: 100,
  communityFeedTitle: 120,
  communityEmptyTitle: 120,
  communityEmptyBody: 350
};

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/\r\n?/g, "\n").trim().slice(0, maxLength);
  return cleaned || fallback;
}

function cleanImageUrl(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim().slice(0, 600);
  if (cleaned.startsWith("/") && !cleaned.startsWith("//")) return cleaned;
  try {
    const parsed = new URL(cleaned);
    const supportedHost = parsed.hostname === "images.unsplash.com" || parsed.hostname.endsWith(".supabase.co");
    return parsed.protocol === "https:" && supportedHost ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function normalizeSiteImageUrl(value: unknown, fallback: string) {
  return cleanImageUrl(value, fallback);
}

function normalizeSlide(value: unknown, fallback: SiteHeroSlide, index: number): SiteHeroSlide {
  const input = recordValue(value);
  const sloganInput = Array.isArray(input.slogan) ? input.slogan : [];
  const mobileInput = Array.isArray(input.mobileSlogan) ? input.mobileSlogan : [];
  const first = cleanText(sloganInput[0], fallback.slogan[0], 90);
  const second = cleanText(sloganInput[1], fallback.slogan[1], 90);
  const mobileLines = mobileInput
    .slice(0, 2)
    .map((line, lineIndex) => cleanText(line, fallback.mobileSlogan[lineIndex] ?? fallback.slogan[lineIndex], 100))
    .filter(Boolean) as [string] | [string, string];

  return {
    id: cleanText(input.id, fallback.id || `slide-${index + 1}`, 50).replace(/[^a-z0-9_-]/gi, "-").toLowerCase(),
    image: cleanImageUrl(input.image, fallback.image),
    mobileImage: cleanImageUrl(input.mobileImage, fallback.mobileImage),
    imageAlt: cleanText(input.imageAlt, fallback.imageAlt, 180),
    slogan: [first, second],
    mobileSlogan: mobileLines.length ? mobileLines : fallback.mobileSlogan,
    hideCopy: typeof input.hideCopy === "boolean" ? input.hideCopy : fallback.hideCopy,
    enabled: typeof input.enabled === "boolean" ? input.enabled : fallback.enabled
  };
}

export function normalizeSocialLinks(value: unknown): SocialLinks {
  const input = recordValue(value);
  return Object.fromEntries(
    Object.keys(defaultSocialLinks).map((key) => {
      const candidate = input[key];
      if (typeof candidate !== "string" || !candidate.trim()) return [key, null];
      try {
        const parsed = new URL(candidate.trim().slice(0, 600));
        return [key, parsed.protocol === "https:" ? parsed.toString() : null];
      } catch {
        return [key, null];
      }
    })
  ) as SocialLinks;
}

export function normalizeSiteContent(value: unknown): SiteContentSettings {
  const input = recordValue(value);
  const suppliedSlides = Array.isArray(input.heroSlides) ? input.heroSlides : [];
  const heroSlides = defaultSiteContent.heroSlides.map((fallback, index) =>
    normalizeSlide(suppliedSlides[index], fallback, index)
  );
  const output = { heroSlides } as SiteContentSettings;

  for (const [key, maxLength] of Object.entries(contentTextLimits) as [Exclude<keyof SiteContentSettings, "heroSlides">, number][]) {
    output[key] = cleanText(input[key], defaultSiteContent[key], maxLength);
  }
  return output;
}

export function parseSiteContent(value: string): SiteContentSettings {
  try {
    return normalizeSiteContent(JSON.parse(value));
  } catch {
    return normalizeSiteContent({});
  }
}
