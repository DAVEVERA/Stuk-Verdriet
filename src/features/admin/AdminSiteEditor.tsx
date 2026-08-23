"use client";

import { ExternalLink, ImagePlus, Save } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { saveSectionDesignSettings, saveSiteContentSettings, saveSiteSettings } from "@/lib/actions";
import { encodeSiteDesignSettings, mergeSectionDesign, sectionDesignSections } from "@/lib/section-design";
import type { SectionDesignKey, SectionDesignSettings, SiteContentSettings, SiteDesignSettings, SiteSettings } from "@/types/content";
import styles from "./AdminSiteEditor.module.css";

type Workspace = "basis" | "homepage" | "community" | "hero" | "vormgeving";

const workspaceLabels: Array<[Workspace, string]> = [
  ["basis", "Basis & kanalen"],
  ["homepage", "Homepage"],
  ["community", "Communitypagina"],
  ["hero", "Hero-afbeeldingen"],
  ["vormgeving", "Vormgeving"]
];

const contentFields: Array<{ key: Exclude<keyof SiteContentSettings, "heroSlides">; label: string; long?: boolean }> = [
  { key: "hostsTitle", label: "Titel boven de podcastmakers" },
  { key: "communityKicker", label: "Kleine tekst boven Community" },
  { key: "communityTitle", label: "Titel Community" },
  { key: "communityBody", label: "Uitleg bij Community", long: true },
  { key: "communityCtaLabel", label: "Tekst op communityknop" },
  { key: "ayaTitle", label: "Titel AYA" },
  { key: "ayaBody", label: "Uitleg AYA", long: true },
  { key: "ayaCtaLine", label: "Korte regel onder AYA" },
  { key: "ayaSecondaryLabel", label: "Tekst op informatieknop" },
  { key: "ayaPrimaryLabel", label: "Tekst op verhalenknop" },
  { key: "interviewsTitle", label: "Titel interviews" },
  { key: "interviewsIntro", label: "Intro interviews", long: true }
];

const communityFields: Array<{ key: Exclude<keyof SiteContentSettings, "heroSlides">; label: string; long?: boolean }> = [
  { key: "communityHeroLine1", label: "Hero regel 1" },
  { key: "communityHeroLine2", label: "Hero regel 2" },
  { key: "communityHeroLine3", label: "Hero regel 3" },
  { key: "communityFeedKicker", label: "Kleine tekst boven berichten" },
  { key: "communityFeedTitle", label: "Titel boven berichten" },
  { key: "communityEmptyTitle", label: "Titel als er geen berichten zijn" },
  { key: "communityEmptyBody", label: "Uitleg als er geen berichten zijn", long: true }
];

export function AdminSiteEditor({ siteSettings, sectionDesign }: { siteSettings: SiteSettings; sectionDesign: SiteDesignSettings }) {
  const [workspace, setWorkspace] = useState<Workspace>("basis");
  const [content, setContent] = useState(siteSettings.content);
  const [design, setDesign] = useState(sectionDesign);

  function updateContent(key: Exclude<keyof SiteContentSettings, "heroSlides">, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateHero(index: number, field: string, value: string | boolean) {
    setContent((current) => ({
      ...current,
      heroSlides: current.heroSlides.map((slide, slideIndex) => {
        if (slideIndex !== index) return slide;
        if (field === "slogan0" || field === "slogan1") {
          const slogan: [string, string] = [...slide.slogan];
          slogan[field === "slogan0" ? 0 : 1] = String(value);
          return { ...slide, slogan };
        }
        return { ...slide, [field]: value };
      })
    }));
  }

  function updateDesign(section: SectionDesignKey, field: keyof SectionDesignSettings, value: string) {
    setDesign((current) => ({ ...current, [section]: { ...mergeSectionDesign(current, section), [field]: value } }));
  }

  return (
    <section className={styles.editor} aria-label="Site bewerken">
      <div className={styles.intro}>
        <div>
          <h2>Site bewerken</h2>
          <p>Kies wat je wilt aanpassen. Elke knop slaat alleen dit onderdeel op en publiceert het daarna direct op de site.</p>
        </div>
        <div className={styles.previewLinks}>
          <a href="/" target="_blank" rel="noreferrer">Homepage bekijken <ExternalLink size={15} aria-hidden /></a>
          <a href="/community" target="_blank" rel="noreferrer">Community bekijken <ExternalLink size={15} aria-hidden /></a>
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Onderdelen van de site">
        {workspaceLabels.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={workspace === id} onClick={() => setWorkspace(id)}>{label}</button>
        ))}
      </div>

      {workspace === "basis" ? (
        <form className={styles.panel} action={saveSiteSettings}>
          <input type="hidden" name="return_tab" value="site" />
          <div className={styles.panelHeader}><div><h3>Basisgegevens en kanalen</h3><p>Wijzig het logo en de links waarop bezoekers Stuk Verdriet kunnen volgen.</p></div></div>
          <div className={styles.twoColumns}>
            <div className={styles.fields}>
              <Image src={siteSettings.logo_url ?? "/brand/sverdriet_logo.webp"} alt="Huidig logo van Stuk Verdriet" width={120} height={120} />
              <label>Nieuw logo (optioneel)<input name="logo_file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" /></label>
            </div>
            <div className={styles.fields}>
              <label>Instagram<input name="instagram_url" type="url" defaultValue={siteSettings.social_links.instagram_url ?? ""} /></label>
              <label>Facebook<input name="facebook_url" type="url" defaultValue={siteSettings.social_links.facebook_url ?? ""} /></label>
              <label>TikTok<input name="tiktok_url" type="url" defaultValue={siteSettings.social_links.tiktok_url ?? ""} /></label>
              <label>Spotify<input name="spotify_url" type="url" defaultValue={siteSettings.social_links.spotify_url ?? ""} /></label>
              <label>YouTube Music<input name="youtube_music_url" type="url" defaultValue={siteSettings.social_links.youtube_music_url ?? ""} /></label>
              <label>Podimo<input name="podimo_url" type="url" defaultValue={siteSettings.social_links.podimo_url ?? ""} /></label>
              <label>Apple Podcasts<input name="apple_podcast_url" type="url" defaultValue={siteSettings.social_links.apple_podcast_url ?? ""} /></label>
            </div>
          </div>
          <p className={styles.publishNote}>Na opslaan worden deze gegevens meteen gepubliceerd.</p>
          <div className={styles.actions}><button type="submit"><Save size={17} aria-hidden /> Basisgegevens opslaan en publiceren</button></div>
        </form>
      ) : null}

      {workspace === "homepage" || workspace === "community" ? (
        <form className={styles.panel} action={saveSiteContentSettings}>
          <input type="hidden" name="return_tab" value="site" />
          <input type="hidden" name="site_content" value={JSON.stringify(content)} readOnly />
          <div className={styles.panelHeader}><div><h3>{workspace === "homepage" ? "Teksten op de homepage" : "Teksten op de communitypagina"}</h3><p>Schrijf helder en menselijk. Lege velden vallen veilig terug op de oorspronkelijke tekst.</p></div></div>
          <div className={styles.twoColumns}>
            {(workspace === "homepage" ? contentFields : communityFields).map((field) => (
              <div className={styles.fields} key={field.key}>
                <label>{field.label}{field.long ? <textarea value={content[field.key]} onChange={(event) => updateContent(field.key, event.target.value)} /> : <input value={content[field.key]} onChange={(event) => updateContent(field.key, event.target.value)} />}</label>
              </div>
            ))}
          </div>
          <p className={styles.publishNote}>Na opslaan zijn deze teksten direct zichtbaar. Open de voorbeeldpagina daarna in een nieuw tabblad om ze te controleren.</p>
          <div className={styles.actions}><button type="submit"><Save size={17} aria-hidden /> Teksten opslaan en publiceren</button></div>
        </form>
      ) : null}

      {workspace === "hero" ? (
        <form className={styles.panel} action={saveSiteContentSettings}>
          <input type="hidden" name="return_tab" value="site" />
          <input type="hidden" name="site_content" value={JSON.stringify(content)} readOnly />
          <div className={styles.panelHeader}><div><h3>Hero-afbeeldingen en hoofdzinnen</h3><p>Gebruik brede beelden voor desktop en een uitsnede in staand formaat voor mobiel. Maximaal 5 MB per bestand.</p></div></div>
          <div className={styles.slides}>
            {content.heroSlides.map((slide, index) => (
              <article className={styles.slide} key={slide.id}>
                <div className={styles.slidePreview} style={{ backgroundImage: `url(${slide.image})` }} role="img" aria-label={`Voorbeeld van slide ${index + 1}`} />
                <div><h4>Slide {index + 1}</h4><p>{slide.enabled ? "Zichtbaar in de carrousel" : "Verborgen"}</p></div>
                <label className={styles.check}><input type="checkbox" checked={slide.enabled} onChange={(event) => updateHero(index, "enabled", event.target.checked)} /> Slide tonen</label>
                <label className={styles.check}><input type="checkbox" checked={slide.hideCopy} onChange={(event) => updateHero(index, "hideCopy", event.target.checked)} /> Tekst verbergen</label>
                <label>Hoofdzin regel 1<input value={slide.slogan[0]} onChange={(event) => updateHero(index, "slogan0", event.target.value)} /></label>
                <label>Hoofdzin regel 2<input value={slide.slogan[1]} onChange={(event) => updateHero(index, "slogan1", event.target.value)} /></label>
                <label>Beschrijving voor toegankelijkheid<input value={slide.imageAlt} onChange={(event) => updateHero(index, "imageAlt", event.target.value)} /></label>
                <label><ImagePlus size={18} aria-hidden /> Nieuwe desktopafbeelding<input name={`hero_desktop_${index}`} type="file" accept="image/png,image/jpeg,image/webp" /></label>
                <label><ImagePlus size={18} aria-hidden /> Nieuwe mobiele afbeelding<input name={`hero_mobile_${index}`} type="file" accept="image/png,image/jpeg,image/webp" /></label>
              </article>
            ))}
          </div>
          <p className={styles.publishNote}>Laat altijd ten minste één slide aan staan. Als alles wordt uitgezet, gebruikt de site automatisch de eerste veilige standaardafbeelding.</p>
          <div className={styles.actions}><button type="submit"><Save size={17} aria-hidden /> Hero opslaan en publiceren</button></div>
        </form>
      ) : null}

      {workspace === "vormgeving" ? (
        <form className={styles.panel} action={saveSectionDesignSettings}>
          <input type="hidden" name="section_styles" value={encodeSiteDesignSettings(design)} readOnly />
          <input type="hidden" name="return_tab" value="site" />
          <div className={styles.panelHeader}><div><h3>Kleuren en indeling per onderdeel</h3><p>Pas gerichte stijlen aan zonder de vaste merkopmaak en leesbaarheid van de site te doorbreken.</p></div></div>
          <div className={styles.appearanceGrid}>
            {sectionDesignSections.map((section) => {
              const current = mergeSectionDesign(design, section.key);
              return (
                <article className={styles.appearanceCard} key={section.key}>
                  <h4>{section.label}</h4>
                  <label>Achtergrondkleur<input type="color" value={current.backgroundColor} onChange={(event) => updateDesign(section.key, "backgroundColor", event.target.value)} /></label>
                  <label>Tekstkleur<input type="color" value={current.textColor} onChange={(event) => updateDesign(section.key, "textColor", event.target.value)} /></label>
                  <label>Accentkleur<input type="color" value={current.accentColor} onChange={(event) => updateDesign(section.key, "accentColor", event.target.value)} /></label>
                  <label>Tekstgrootte<select value={current.fontScale} onChange={(event) => updateDesign(section.key, "fontScale", event.target.value)}><option value="compact">Compact</option><option value="normal">Normaal</option><option value="large">Groot</option></select></label>
                  <label>Ruimte<select value={current.spacing} onChange={(event) => updateDesign(section.key, "spacing", event.target.value)}><option value="compact">Compact</option><option value="normal">Normaal</option><option value="spacious">Ruim</option></select></label>
                  <label>Indeling<select value={current.layout} onChange={(event) => updateDesign(section.key, "layout", event.target.value)}><option value="default">Standaard</option><option value="centered">Gecentreerd</option><option value="split">Twee kolommen</option><option value="dense">Compact overzicht</option></select></label>
                </article>
              );
            })}
          </div>
          <div className={styles.actions}><button type="submit"><Save size={17} aria-hidden /> Vormgeving opslaan en publiceren</button></div>
        </form>
      ) : null}
    </section>
  );
}
