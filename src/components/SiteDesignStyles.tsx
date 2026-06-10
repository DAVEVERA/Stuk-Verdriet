import { mergeSectionDesign, sectionDesignSections } from "@/lib/section-design";
import type { SectionDesignSettings, SiteDesignSettings } from "@/types/content";

const fontFamilyMap: Record<SectionDesignSettings["fontFamily"], string> = {
  brand: "var(--font-jost), Jost, Arial, sans-serif",
  display: "var(--font-figtree), Figtree, Arial, sans-serif",
  handwritten: "var(--font-slogan), cursive"
};

const fontScaleMap: Record<SectionDesignSettings["fontScale"], string> = {
  compact: "0.94",
  normal: "1",
  large: "1.12"
};

const spacingMap: Record<SectionDesignSettings["spacing"], string> = {
  compact: "clamp(28px, 5vw, 58px)",
  normal: "clamp(42px, 8vw, 96px)",
  spacious: "clamp(64px, 11vw, 140px)"
};

const widthMap: Record<SectionDesignSettings["maxWidth"], string> = {
  standard: "1180px",
  wide: "1440px",
  full: "none"
};

const minHeightMap: Record<SectionDesignSettings["minHeight"], string> = {
  auto: "",
  focus: "min(760px, 78dvh)",
  screen: "100dvh"
};

function cssForSection(selector: string, settings: SectionDesignSettings) {
  const declarations = [
    settings.backgroundColor ? `background: ${settings.backgroundColor} !important;` : "",
    settings.textColor ? `color: ${settings.textColor} !important;` : "",
    `font-family: ${fontFamilyMap[settings.fontFamily]};`,
    `font-size: calc(1rem * ${fontScaleMap[settings.fontScale]});`,
    `padding-block: ${spacingMap[settings.spacing]};`,
    minHeightMap[settings.minHeight] ? `min-height: ${minHeightMap[settings.minHeight]};` : ""
  ].filter(Boolean);

  const contentWidth = widthMap[settings.maxWidth];
  const childWidthRule =
    contentWidth === "none"
      ? `${selector} > * { max-width: none !important; }`
      : `${selector} > * { max-width: ${contentWidth} !important; }`;
  const centeredRule = settings.layout === "centered" ? `${selector} { text-align: center; }` : "";
  const denseRule = settings.layout === "dense" ? `${selector} { gap: 12px; }` : "";
  const accentRule = settings.accentColor
    ? `${selector} .button, ${selector} .aya-donate-button { background: ${settings.accentColor} !important; border-color: ${settings.accentColor} !important; color: var(--white) !important; }`
    : "";

  return `${selector} { ${declarations.join(" ")} } ${selector} h1, ${selector} h2, ${selector} h3, ${selector} p, ${selector} a { color: inherit; } ${childWidthRule} ${centeredRule} ${denseRule} ${accentRule}`;
}

export function SiteDesignStyles({ settings }: { settings: SiteDesignSettings }) {
  const css = sectionDesignSections
    .filter((section) => settings[section.key])
    .map((section) => cssForSection(section.selector, mergeSectionDesign(settings, section.key)))
    .join("\n");

  if (!css) return null;
  return <style id="site-section-design" dangerouslySetInnerHTML={{ __html: css }} />;
}
