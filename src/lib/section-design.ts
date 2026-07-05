import type { SectionDesignKey, SectionDesignSettings, SiteDesignSettings } from "@/types/content";

export const sectionDesignSections: { key: SectionDesignKey; label: string; selector: string }[] = [
  { key: "hero", label: "Hero", selector: ".hero" },
  { key: "signup", label: "Aanmelden", selector: ".episode-signup-section" },
  { key: "podcast", label: "Podcast", selector: ".podcast-module" },
  { key: "themes", label: "Thema's", selector: ".image-band" },
  { key: "community", label: "Community formulier", selector: ".community-story-section" },
  { key: "aya", label: "AYA Fonds", selector: ".aya-support-banner" },
  { key: "hosts", label: "Podcast makers", selector: ".hosts-section" }
];

export const defaultSectionDesign: SectionDesignSettings = {
  backgroundColor: "",
  textColor: "",
  accentColor: "",
  fontFamily: "brand",
  fontScale: "normal",
  spacing: "normal",
  maxWidth: "standard",
  minHeight: "auto",
  layout: "default"
};

const fontFamilies = new Set<SectionDesignSettings["fontFamily"]>(["brand", "display", "handwritten"]);
const fontScales = new Set<SectionDesignSettings["fontScale"]>(["compact", "normal", "large"]);
const spacings = new Set<SectionDesignSettings["spacing"]>(["compact", "normal", "spacious"]);
const maxWidths = new Set<SectionDesignSettings["maxWidth"]>(["standard", "wide", "full"]);
const minHeights = new Set<SectionDesignSettings["minHeight"]>(["auto", "focus", "screen"]);
const layouts = new Set<SectionDesignSettings["layout"]>(["default", "centered", "split", "dense"]);

function safeColor(value: unknown) {
  const color = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "";
}

function fromSet<T extends string>(value: unknown, allowed: Set<T>, fallback: T) {
  return allowed.has(value as T) ? (value as T) : fallback;
}

export function normalizeSectionDesign(value: unknown): SiteDesignSettings {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, Record<string, unknown>>;
  return Object.fromEntries(
    sectionDesignSections.map(({ key }) => {
      const section = source[key] ?? {};
      return [
        key,
        {
          backgroundColor: safeColor(section.backgroundColor),
          textColor: safeColor(section.textColor),
          accentColor: safeColor(section.accentColor),
          fontFamily: fromSet(section.fontFamily, fontFamilies, defaultSectionDesign.fontFamily),
          fontScale: fromSet(section.fontScale, fontScales, defaultSectionDesign.fontScale),
          spacing: fromSet(section.spacing, spacings, defaultSectionDesign.spacing),
          maxWidth: fromSet(section.maxWidth, maxWidths, defaultSectionDesign.maxWidth),
          minHeight: fromSet(section.minHeight, minHeights, defaultSectionDesign.minHeight),
          layout: fromSet(section.layout, layouts, defaultSectionDesign.layout)
        }
      ];
    })
  ) as SiteDesignSettings;
}

export function mergeSectionDesign(settings: SiteDesignSettings, key: SectionDesignKey) {
  return {
    ...defaultSectionDesign,
    ...(settings[key] ?? {})
  };
}

export function encodeSiteDesignSettings(settings: SiteDesignSettings) {
  return JSON.stringify(normalizeSectionDesign(settings));
}
