"use client";

import Image from "next/image";
import {
  Archive,
  BarChart3,
  Bot,
  Brain,
  CalendarDays,
  Captions,
  CheckCircle2,
  ClipboardCheck,
  FileAudio,
  Gauge,
  ImageIcon,
  ImagePlus,
  Instagram,
  KeyRound,
  LayoutTemplate,
  LockKeyhole,
  Network,
  Palette,
  Paintbrush,
  Plus,
  RefreshCw,
  Save,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video,
  WandSparkles,
  Workflow,
  XCircle
} from "lucide-react";
import { useMemo, useState } from "react";
import { archiveEpisode, moderateInterviewComment, moderatePost, refreshEpisodeTranscript, saveEpisode, saveFaq, saveHost, saveSeason, saveSectionDesignSettings, saveSiteSettings, startEpisodeTranscript } from "@/lib/actions";
import { encodeSiteDesignSettings, mergeSectionDesign, sectionDesignSections } from "@/lib/section-design";
import type { PodcastEpisode, PodcastLinkCard, PodcastSeason, SectionDesignKey, SectionDesignSettings, SiteDesignSettings } from "@/types/content";

type AdminPost = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  status: string;
};

type AdminReport = {
  id: string;
  reason: string;
  created_at: string;
  post_id: string | null;
  resolved_at: string | null;
};

type AdminInterviewComment = {
  id: string;
  interview_id: string;
  author_name: string | null;
  author_display_type: string;
  body: string;
  created_at: string;
  status: string;
  interviews?: {
    title: string;
    slug: string;
  } | null;
};

type AdminDashboardProps = {
  episodes: PodcastEpisode[];
  seasons: PodcastSeason[];
  pendingPosts: AdminPost[];
  reports: AdminReport[];
  pendingInterviewComments: AdminInterviewComment[];
  sectionDesign: SiteDesignSettings;
  missingSupabase?: boolean;
  localPreview?: boolean;
  savedMessage?: string | null;
  errorMessage?: string | null;
};

const emptyEpisode: PodcastEpisode = {
  id: "",
  title: "",
  slug: "",
  season_number: 1,
  episode_number: 1,
  short_intro: null,
  description: null,
  audio_file_url: null,
  spotify_url: null,
  podimo_url: null,
  apple_podcast_url: null,
  image_url: null,
  publication_date: null,
  next_episode_date: null,
  duration: null,
  link_cards: [],
  transcript_status: "missing",
  transcript_language: "nl-NL",
  transcript_segments: [],
  transcript_vtt_url: null,
  transcript_operation_name: null,
  transcript_generated_at: null,
  featured_latest: false,
  status: "draft"
};

const tabs = [
  ["today", "Vandaag"],
  ["podcast", "Podcast"],
  ["reviews", "Reviews"],
  ["builder", "Builder"],
  ["access", "Rollen"],
  ["keys", "API keys"],
  ["calendar", "Kalender"],
  ["integrations", "Integraties"],
  ["ai", "AI studio"],
  ["analytics", "Analytics"],
  ["brand", "Branding"],
  ["automation", "Automations"],
  ["seasons", "Seizoenen"],
  ["community", "Community"],
  ["site", "Site"],
  ["sections", "Secties"],
  ["hosts", "Hosts"]
] as const;

const primaryTabIds = ["today", "podcast", "reviews", "calendar", "builder"] as const;

const cardTypes: PodcastLinkCard["type"][] = ["link", "spotify", "podimo", "apple", "book", "donation"];

const feedbackLabels: Record<string, string> = {
  archived: "aflevering gearchiveerd",
  episode: "aflevering",
  faq: "FAQ",
  host: "host",
  season: "seizoen",
  "section-design": "sectie ontwerp",
  "section-design-save": "sectie ontwerp",
  site: "site instellingen",
  "transcript-started": "transcriptie gestart",
  "transcript-ready": "transcriptie klaar",
  "transcript-processing": "transcriptie wordt verwerkt",
  "transcript-failed": "transcriptie mislukt"
};

const integrationCards = [
  { platform: "Instagram", state: "Voorbereid", owner: "Meta Graph API", icon: Instagram, note: "Media planning, insights en captions." },
  { platform: "Facebook", state: "Voorbereid", owner: "Meta Pages API", icon: Share2, note: "Pagina-posts en campaign publishing." },
  { platform: "TikTok", state: "Voorbereid", owner: "TikTok Business API", icon: Video, note: "Short-form kalender en performance." },
  { platform: "Google Analytics", state: "Meetplan", owner: "GA4 Data API", icon: BarChart3, note: "Verkeer, conversie en contentprestaties." },
  { platform: "Make", state: "Webhook-ready", owner: "Make AI automation", icon: Workflow, note: "Goedkeuring naar geplande post-flow." },
  { platform: "Canva", state: "Connector actief", owner: "Brand assets", icon: Paintbrush, note: "Brand kits en templates voor campagnes." }
];

const marketingItems = [
  { date: "2026-07-12", channel: "Instagram", title: "Quote uit interview omzetten naar carousel", status: "Concept" },
  { date: "2026-07-15", channel: "TikTok", title: "Korte podcastclip met ondertiteling", status: "AI tekst nodig" },
  { date: "2026-07-18", channel: "Facebook", title: "Communityvraag rond herinneren", status: "Review" },
  { date: "2026-07-22", channel: "Nieuwsbrief", title: "Nieuwe aflevering + steunbronnen", status: "Gepland" }
];

const analyticsRows = [
  { metric: "Website bezoekers", value: "12.4k", delta: "+18%", source: "Google Analytics" },
  { metric: "Interview engagement", value: "8.7%", delta: "+3.1%", source: "Supabase" },
  { metric: "Instagram bereik", value: "42.1k", delta: "+11%", source: "Instagram Insights" },
  { metric: "TikTok kijktijd", value: "19.6u", delta: "+24%", source: "TikTok Analytics" }
];

const roleRows = [
  { role: "Eigenaar", access: "Alles beheren", members: "1 beheerder", risk: "Hoog" },
  { role: "Redacteur", access: "Podcast, interviews, kalender", members: "2 gebruikers", risk: "Middel" },
  { role: "Moderator", access: "Reviews en community", members: "3 gebruikers", risk: "Laag" },
  { role: "Analist", access: "Alleen analytics", members: "1 gebruiker", risk: "Laag" }
];

export function AdminDashboard({ episodes, seasons, pendingPosts, reports, pendingInterviewComments, sectionDesign, missingSupabase, localPreview, savedMessage, errorMessage }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number][0]>("today");
  const [showMoreNav, setShowMoreNav] = useState(false);
  const [selectedId, setSelectedId] = useState(episodes[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const selectedEpisode = episodes.find((episode) => episode.id === selectedId) ?? emptyEpisode;
  const [draftEpisode, setDraftEpisode] = useState<PodcastEpisode>(selectedEpisode);
  const [linkCards, setLinkCards] = useState<PodcastLinkCard[]>(selectedEpisode.link_cards ?? []);
  const failedTranscripts = episodes.filter((episode) => episode.transcript_status === "failed").length;
  const missingMedia = episodes.filter((episode) => !episode.audio_file_url || !episode.image_url).length;
  const scheduledEpisodes = episodes.filter((episode) => episode.status === "scheduled").length;
  const pendingReviewCount = pendingPosts.length + pendingInterviewComments.length + reports.length;
  const tabBadges: Partial<Record<(typeof tabs)[number][0], number>> = {
    today: pendingReviewCount + failedTranscripts + missingMedia,
    reviews: pendingInterviewComments.length,
    community: pendingPosts.length + reports.length,
    calendar: scheduledEpisodes,
    analytics: analyticsRows.length
  };
  const primaryTabs = tabs.filter(([id]) => primaryTabIds.includes(id as (typeof primaryTabIds)[number]));
  const secondaryTabs = tabs.filter(([id]) => !primaryTabIds.includes(id as (typeof primaryTabIds)[number]));
  const isSecondaryTabActive = secondaryTabs.some(([id]) => id === activeTab);
  const secondaryBadgeCount = secondaryTabs.reduce((total, [id]) => total + (tabBadges[id] ?? 0), 0);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((episode) => {
      const matchesQuery = `${episode.title} ${episode.slug}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || episode.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [episodes, query, statusFilter]);

  function selectEpisode(episode: PodcastEpisode) {
    setSelectedId(episode.id);
    setDraftEpisode(episode);
    setLinkCards(episode.link_cards ?? []);
  }

  function newEpisode() {
    setSelectedId("");
    setDraftEpisode(emptyEpisode);
    setLinkCards([]);
  }

  function updateDraft(formData: FormData) {
    setDraftEpisode((current) => ({
      ...current,
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      season_number: Number(formData.get("season_number") ?? 1),
      episode_number: Number(formData.get("episode_number") ?? 1),
      short_intro: String(formData.get("short_intro") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      audio_file_url: String(formData.get("audio_file_url") ?? "") || null,
      image_url: String(formData.get("image_url") ?? "") || null,
      spotify_url: String(formData.get("spotify_url") ?? "") || null,
      podimo_url: String(formData.get("podimo_url") ?? "") || null,
      apple_podcast_url: String(formData.get("apple_podcast_url") ?? "") || null,
      publication_date: String(formData.get("publication_date") ?? "") || null,
      next_episode_date: String(formData.get("next_episode_date") ?? "") || null,
      duration: String(formData.get("duration") ?? "") || null,
      transcript_status: String(formData.get("transcript_status") ?? current.transcript_status) as PodcastEpisode["transcript_status"],
      transcript_language: String(formData.get("transcript_language") ?? current.transcript_language) || "nl-NL",
      transcript_vtt_url: String(formData.get("transcript_vtt_url") ?? current.transcript_vtt_url) || null,
      featured_latest: formData.get("featured_latest") === "on",
      status: String(formData.get("status") ?? "draft") as PodcastEpisode["status"]
    }));
  }

  function updateCard(index: number, field: keyof PodcastLinkCard, value: string) {
    setLinkCards((current) =>
      current.map((card, cardIndex) => (cardIndex === index ? { ...card, [field]: field === "description" ? value || null : value } : card))
    );
  }

  function addCard() {
    setLinkCards((current) => [...current, { label: "", url: "", description: null, type: "link" }]);
  }

  function removeCard(index: number) {
    setLinkCards((current) => current.filter((_, cardIndex) => cardIndex !== index));
  }

  function openTab(tab: (typeof tabs)[number][0]) {
    setActiveTab(tab);
    setShowMoreNav(false);
  }

  function renderTabButton([id, label]: (typeof tabs)[number]) {
    const badge = tabBadges[id];
    return (
      <button key={id} type="button" aria-pressed={activeTab === id} className={activeTab === id ? "active" : undefined} onClick={() => openTab(id)}>
        {label}
        {badge ? <span>{badge}</span> : null}
      </button>
    );
  }

  return (
    <section className="admin-shell admin-console">
      {missingSupabase ? <p className="notice">Supabase env vars ontbreken. Je ziet de beheerinterface, maar live opslaan en uploads vereisen Supabase-configuratie.</p> : null}
      {localPreview ? <p className="notice">Lokale admin-preview actief. Je kunt het portaal beoordelen; live opslaan en modereren vereisen een Supabase admin-sessie en service-role configuratie.</p> : null}
      {savedMessage ? <p className="notice">Opgeslagen: {feedbackLabels[savedMessage] ?? savedMessage}.</p> : null}
      {errorMessage ? <p className="notice">Fout: {feedbackLabels[errorMessage] ?? errorMessage}. Controleer Supabase-configuratie, velden of storage buckets.</p> : null}

      <nav className="admin-navigation" aria-label="Admin onderdelen">
        <div className="admin-tabs admin-tabs-primary" role="group" aria-label="Belangrijkste admin onderdelen">
          {primaryTabs.map(renderTabButton)}
        </div>
        <button
          className={isSecondaryTabActive || showMoreNav ? "admin-more-toggle active" : "admin-more-toggle"}
          type="button"
          aria-expanded={showMoreNav}
          aria-controls="admin-secondary-navigation"
          onClick={() => setShowMoreNav((current) => !current)}
        >
          Meer onderdelen
          {secondaryBadgeCount ? <span>{secondaryBadgeCount}</span> : null}
        </button>
        <div
          className={showMoreNav ? "admin-tabs admin-tabs-secondary open" : "admin-tabs admin-tabs-secondary"}
          id="admin-secondary-navigation"
          role="group"
          aria-label="Overige admin onderdelen"
        >
          {secondaryTabs.map(renderTabButton)}
        </div>
      </nav>

      {activeTab === "today" ? (
        <TodayDashboard
          episodes={episodes}
          pendingPosts={pendingPosts}
          reports={reports}
          pendingInterviewComments={pendingInterviewComments}
          missingMedia={missingMedia}
          failedTranscripts={failedTranscripts}
          scheduledEpisodes={scheduledEpisodes}
          onOpenTab={openTab}
        />
      ) : null}

      {activeTab === "podcast" ? (
        <div className="podcast-admin-grid">
          <aside className="episode-manager">
            <div className="manager-header">
              <div>
                <p className="eyebrow">Afleveringen</p>
                <h2>Podcastbeheer</h2>
              </div>
              <button className="icon-button" type="button" onClick={newEpisode} aria-label="Nieuwe aflevering">
                <Plus aria-hidden />
              </button>
            </div>
            <label className="search-field">
              <Search aria-hidden />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoeken op titel of slug" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter op status" title="Filter op status">
              <option value="all">Alle statussen</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <div className="episode-manager-list">
              {filteredEpisodes.map((episode) => (
                <button key={episode.id} type="button" className={episode.id === selectedId ? "active" : ""} onClick={() => selectEpisode(episode)}>
                  <span>{episode.title}</span>
                  <small>S{episode.season_number} E{episode.episode_number} - {episode.status}</small>
                </button>
              ))}
              {!filteredEpisodes.length ? <p className="small-note">Geen afleveringen gevonden.</p> : null}
            </div>
          </aside>

          <form
            className="episode-editor"
            action={saveEpisode}
            key={selectedEpisode.id || "new"}
            onChange={(event) => updateDraft(new FormData(event.currentTarget))}
          >
            <input type="hidden" name="id" defaultValue={selectedEpisode.id} />
            <input type="hidden" name="link_cards" value={JSON.stringify(linkCards)} readOnly />

            <div className="editor-topbar">
              <div>
                <p className="eyebrow">{selectedEpisode.id ? "Bewerken" : "Nieuw"}</p>
                <h2>{selectedEpisode.title || "Nieuwe aflevering"}</h2>
              </div>
              <div className="editor-actions">
                {selectedEpisode.id ? (
                  <button className="text-link" type="submit" formAction={archiveEpisode.bind(null, selectedEpisode.id)}>
                    <Archive size={17} aria-hidden /> Archiveer
                  </button>
                ) : null}
                <button className="button" type="submit">
                  <Save size={17} aria-hidden /> Opslaan
                </button>
              </div>
            </div>

            <div className="editor-layout">
              <div className="form-grid">
                <label>Titel<input name="title" required defaultValue={selectedEpisode.title} /></label>
                <label>Slug<input name="slug" defaultValue={selectedEpisode.slug} placeholder="wordt automatisch gemaakt als leeg" /></label>
                <div className="field-row">
                  <label>Seizoen<SeasonSelect seasons={seasons} defaultValue={selectedEpisode.season_number} /></label>
                  <label>Aflevering<input name="episode_number" type="number" min="1" required defaultValue={selectedEpisode.episode_number} /></label>
                </div>
                <label>Korte intro<textarea name="short_intro" defaultValue={selectedEpisode.short_intro ?? ""} /></label>
                <label>Show notes / beschrijving<textarea name="description" defaultValue={selectedEpisode.description ?? ""} /></label>
                <div className="field-row">
                  <label>Publicatiedatum en tijd<input name="publication_date" type="datetime-local" defaultValue={toDateTimeLocal(selectedEpisode.publication_date)} /></label>
                  <label>Volgende aflevering<input name="next_episode_date" type="date" defaultValue={selectedEpisode.next_episode_date ?? ""} /></label>
                </div>
                <div className="field-row">
                  <label>Duur<input name="duration" defaultValue={selectedEpisode.duration ?? ""} placeholder="45:12" /></label>
                  <label>Status<StatusSelect defaultValue={selectedEpisode.status} /></label>
                </div>
                <label className="check-row"><input name="featured_latest" type="checkbox" defaultChecked={selectedEpisode.featured_latest} /> Featured latest</label>

                <div className="upload-grid">
                  <label className="upload-field">
                    <FileAudio aria-hidden />
                    <span>Audio uploaden</span>
                    <input name="audio_file" type="file" accept="audio/*" />
                  </label>
                  <label className="upload-field">
                    <ImagePlus aria-hidden />
                    <span>Cover uploaden</span>
                    <input name="image_file" type="file" accept="image/*" />
                  </label>
                </div>
                <label>Audio URL<input name="audio_file_url" defaultValue={selectedEpisode.audio_file_url ?? ""} /></label>
                <label>Afbeelding URL<input name="image_url" defaultValue={selectedEpisode.image_url ?? ""} /></label>
                <div className="field-row">
                  <label>Spotify URL<input name="spotify_url" defaultValue={selectedEpisode.spotify_url ?? ""} /></label>
                  <label>Podimo URL<input name="podimo_url" defaultValue={selectedEpisode.podimo_url ?? ""} /></label>
                </div>
                <label>Apple Podcasts URL<input name="apple_podcast_url" defaultValue={selectedEpisode.apple_podcast_url ?? ""} /></label>

                <div className="transcript-admin-panel">
                  <div>
                    <p className="eyebrow">Google STT</p>
                    <h3>Transcript</h3>
                    <p className="small-note">
                      Status: {selectedEpisode.transcript_status}
                      {selectedEpisode.transcript_generated_at ? ` · ${new Date(selectedEpisode.transcript_generated_at).toLocaleString("nl-NL")}` : ""}
                    </p>
                  </div>
                  <input type="hidden" name="transcript_status" defaultValue={selectedEpisode.transcript_status} />
                  <input type="hidden" name="transcript_language" defaultValue={selectedEpisode.transcript_language ?? "nl-NL"} />
                  <input type="hidden" name="transcript_vtt_url" defaultValue={selectedEpisode.transcript_vtt_url ?? ""} />
                  {selectedEpisode.id ? (
                    <div className="transcript-admin-actions">
                      <button className="text-link" type="submit" formAction={startEpisodeTranscript.bind(null, selectedEpisode.id)}>
                        <Captions size={17} aria-hidden /> Start transcriptie
                      </button>
                      <button className="text-link" type="submit" formAction={refreshEpisodeTranscript.bind(null, selectedEpisode.id)}>
                        <RefreshCw size={17} aria-hidden /> Vernieuw status
                      </button>
                    </div>
                  ) : (
                    <p className="small-note">Sla de aflevering eerst op voordat je transcriptie start.</p>
                  )}
                </div>

                <div className="link-card-editor">
                  <div className="manager-header">
                    <div>
                      <p className="eyebrow">CTA cards</p>
                      <h3>Link widgets</h3>
                    </div>
                    <button className="text-link" type="button" onClick={addCard}>Card toevoegen</button>
                  </div>
                  {linkCards.map((card, index) => (
                    <div className="link-card-row" key={`${index}-${card.type}`}>
                      <select value={card.type} onChange={(event) => updateCard(index, "type", event.target.value)} aria-label={`Type link widget ${index + 1}`} title={`Type link widget ${index + 1}`}>
                        {cardTypes.map((type) => <option key={type}>{type}</option>)}
                      </select>
                      <input value={card.label} onChange={(event) => updateCard(index, "label", event.target.value)} placeholder="Label" />
                      <input value={card.url} onChange={(event) => updateCard(index, "url", event.target.value)} placeholder="https://..." />
                      <input value={card.description ?? ""} onChange={(event) => updateCard(index, "description", event.target.value)} placeholder="Korte omschrijving" />
                      <button type="button" className="text-button" onClick={() => removeCard(index)}>Verwijder</button>
                    </div>
                  ))}
                  {!linkCards.length ? <p className="small-note">Voeg optionele CTA cards toe voor boeken, donaties of luisterplatforms.</p> : null}
                </div>
              </div>

              <EpisodePreview episode={draftEpisode} linkCards={linkCards} />
            </div>
          </form>
        </div>
      ) : null}

      {activeTab === "seasons" ? (
        <div className="admin-grid wide">
          <AdminForm title="Seizoen toevoegen of bijwerken" action={saveSeason}>
            <label>Titel<input name="title" required /></label>
            <label>Seizoensnummer<input name="season_number" type="number" min="1" required /></label>
            <label>Beschrijving<textarea name="description" /></label>
            <label>Cover image URL<input name="cover_image" /></label>
            <label>Status<StatusSelect /></label>
            <button className="button" type="submit">Seizoen opslaan</button>
          </AdminForm>
          <article className="admin-panel">
            <h2>Bestaande seizoenen</h2>
            <div className="compact-list">
              {seasons.map((season) => <p key={season.id}>S{season.season_number} - {season.title} ({season.status})</p>)}
            </div>
          </article>
        </div>
      ) : null}

      {activeTab === "reviews" ? <ReviewCenter pendingInterviewComments={pendingInterviewComments} pendingPosts={pendingPosts} reports={reports} /> : null}
      {activeTab === "builder" ? <ElementorBuilder settings={sectionDesign} onOpenSections={() => setActiveTab("sections")} /> : null}
      {activeTab === "access" ? <AccessAndRoles /> : null}
      {activeTab === "keys" ? <ApiKeyVault missingSupabase={missingSupabase} /> : null}
      {activeTab === "calendar" ? <MarketingCalendar /> : null}
      {activeTab === "integrations" ? <IntegrationCenter /> : null}
      {activeTab === "ai" ? <AIStudio /> : null}
      {activeTab === "analytics" ? <AnalyticsCenter /> : null}
      {activeTab === "brand" ? <BrandLibrary /> : null}
      {activeTab === "automation" ? <AutomationHub /> : null}
      {activeTab === "community" ? <CommunityModeration pendingPosts={pendingPosts} reports={reports} /> : null}
      {activeTab === "site" ? <SiteSettingsForm /> : null}
      {activeTab === "sections" ? <SectionDesignEditor initialSettings={sectionDesign} /> : null}
      {activeTab === "hosts" ? <HostAndFaqForms /> : null}
    </section>
  );
}

function SectionDesignEditor({ initialSettings }: { initialSettings: SiteDesignSettings }) {
  const [settings, setSettings] = useState<SiteDesignSettings>(initialSettings);

  function updateSection(section: SectionDesignKey, field: keyof SectionDesignSettings, value: string) {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...mergeSectionDesign(current, section),
        [field]: value
      }
    }));
  }

  return (
    <form className="section-design-editor" action={saveSectionDesignSettings}>
      <input type="hidden" name="section_styles" value={encodeSiteDesignSettings(settings)} readOnly />
      <div className="editor-topbar">
        <div>
          <p className="eyebrow">No-code stijlbeheer</p>
          <h2>Secties aanpassen</h2>
          <p className="small-note">Kies per homepage-sectie veilige presets voor kleur, lettertype, ruimte, breedte en layout.</p>
        </div>
        <button className="button" type="submit">
          <Save size={17} aria-hidden /> Secties opslaan
        </button>
      </div>

      <div className="section-design-grid">
        {sectionDesignSections.map((section) => {
          const value = mergeSectionDesign(settings, section.key);
          return (
            <article className="section-design-card" key={section.key}>
              <div className="section-design-card-header">
                <Palette size={18} aria-hidden />
                <h3>{section.label}</h3>
              </div>
              <div className="section-design-preview">
                <span aria-hidden />
                <strong>{section.label}</strong>
                <small>{value.layout} / {value.spacing}</small>
                <small>
                  {value.backgroundColor || "standaard"} / {value.textColor || "standaard"} / {value.accentColor || "standaard"}
                </small>
              </div>
              <div className="section-design-controls">
                <label>Achtergrond<ColorInput value={value.backgroundColor} onChange={(next) => updateSection(section.key, "backgroundColor", next)} /></label>
                <label>Tekst<ColorInput value={value.textColor} onChange={(next) => updateSection(section.key, "textColor", next)} /></label>
                <label>Accent<ColorInput value={value.accentColor} onChange={(next) => updateSection(section.key, "accentColor", next)} /></label>
                <label>Lettertype<SelectControl value={value.fontFamily} options={["brand", "display", "handwritten"]} onChange={(next) => updateSection(section.key, "fontFamily", next)} /></label>
                <label>Grootte<SelectControl value={value.fontScale} options={["compact", "normal", "large"]} onChange={(next) => updateSection(section.key, "fontScale", next)} /></label>
                <label>Ruimte<SelectControl value={value.spacing} options={["compact", "normal", "spacious"]} onChange={(next) => updateSection(section.key, "spacing", next)} /></label>
                <label>Breedte<SelectControl value={value.maxWidth} options={["standard", "wide", "full"]} onChange={(next) => updateSection(section.key, "maxWidth", next)} /></label>
                <label>Hoogte<SelectControl value={value.minHeight} options={["auto", "focus", "screen"]} onChange={(next) => updateSection(section.key, "minHeight", next)} /></label>
                <label>Layout<SelectControl value={value.layout} options={["default", "centered", "split", "dense"]} onChange={(next) => updateSection(section.key, "layout", next)} /></label>
              </div>
            </article>
          );
        })}
      </div>
    </form>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <span className="color-input">
      <input type="color" value={value || "#ffffff"} onChange={(event) => onChange(event.target.value)} aria-label="Kleur kiezen" />
      <button type="button" onClick={() => onChange("")}>Reset</button>
    </span>
  );
}

function SelectControl({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Preset kiezen" title="Preset kiezen">
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

function TodayDashboard({
  episodes,
  pendingPosts,
  reports,
  pendingInterviewComments,
  missingMedia,
  failedTranscripts,
  scheduledEpisodes,
  onOpenTab
}: {
  episodes: PodcastEpisode[];
  pendingPosts: AdminPost[];
  reports: AdminReport[];
  pendingInterviewComments: AdminInterviewComment[];
  missingMedia: number;
  failedTranscripts: number;
  scheduledEpisodes: number;
  onOpenTab: (tab: (typeof tabs)[number][0]) => void;
}) {
  const draftEpisodes = episodes.filter((episode) => episode.status === "draft").slice(0, 4);
  const cards = [
    { label: "Review queue", value: pendingPosts.length + pendingInterviewComments.length + reports.length, helper: "comments, posts en meldingen", icon: ClipboardCheck, tab: "reviews" as const },
    { label: "Media mist", value: missingMedia, helper: "afleveringen zonder audio of cover", icon: ImagePlus, tab: "podcast" as const },
    { label: "Transcripties", value: failedTranscripts, helper: "mislukt of aandacht nodig", icon: Captions, tab: "podcast" as const },
    { label: "Gepland", value: scheduledEpisodes, helper: "content in de kalender", icon: CalendarDays, tab: "calendar" as const }
  ];

  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Command center</p>
          <h2>Vandaag in beheer</h2>
          <p>Begin met wat aandacht vraagt: reviews, media, transcripties en geplande content.</p>
        </div>
        <button className="button" type="button" onClick={() => onOpenTab("builder")}>
          <LayoutTemplate size={17} aria-hidden /> Open builder
        </button>
      </div>
      <div className="admin-kpi-grid">
        {cards.map(({ label, value, helper, icon: Icon, tab }) => (
          <button className="admin-kpi-card" key={label} type="button" onClick={() => onOpenTab(tab)}>
            <Icon size={20} aria-hidden />
            <strong>{value}</strong>
            <span>{label}</span>
            <small>{helper}</small>
          </button>
        ))}
      </div>
      <div className="admin-grid wide">
        <article className="admin-panel">
          <h2>Snelle taken</h2>
          <div className="workflow-list">
            <button type="button" onClick={() => onOpenTab("reviews")}><CheckCircle2 size={17} aria-hidden /> Review interviewreacties</button>
            <button type="button" onClick={() => onOpenTab("calendar")}><CalendarDays size={17} aria-hidden /> Plan marketingmoment</button>
            <button type="button" onClick={() => onOpenTab("ai")}><WandSparkles size={17} aria-hidden /> Schrijf social caption met AI</button>
            <button type="button" onClick={() => onOpenTab("brand")}><Palette size={17} aria-hidden /> Controleer moodboard</button>
          </div>
        </article>
        <article className="admin-panel">
          <h2>Concepten</h2>
          <div className="compact-list">
            {draftEpisodes.length ? draftEpisodes.map((episode) => (
              <p key={episode.id}>{episode.title} <small>S{episode.season_number} E{episode.episode_number}</small></p>
            )) : <p>Geen open podcastconcepten.</p>}
          </div>
        </article>
      </div>
    </div>
  );
}

function ReviewCenter({ pendingInterviewComments, pendingPosts, reports }: { pendingInterviewComments: AdminInterviewComment[]; pendingPosts: AdminPost[]; reports: AdminReport[] }) {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Review inbox</p>
          <h2>Af- en goedkeuren</h2>
          <p>Moderatie voor interviewcomments, community posts en open meldingen in een veilige reviewflow.</p>
        </div>
      </div>
      <div className="review-board">
        <article className="admin-panel review-lane">
          <h3>Interview comments</h3>
          {pendingInterviewComments.length ? pendingInterviewComments.map((comment) => (
            <div className="review-card" key={comment.id}>
              <div className="review-card-top">
                <span>Nieuw</span>
                <small>{new Date(comment.created_at).toLocaleDateString("nl-NL")}</small>
              </div>
              <strong>{comment.interviews?.title ?? "Interview"}</strong>
              <p>{comment.body}</p>
              <small>Door {comment.author_name ?? "Anoniem"} - {comment.author_display_type}</small>
              <div className="review-timeline" aria-label="Reviewstatus">
                <span>Ingezonden</span>
                <span>Controle</span>
                <span>Publicatie</span>
              </div>
              <div className="review-actions">
                <form action={moderateInterviewComment.bind(null, comment.id, comment.interview_id, "approved")}>
                  <button className="button" type="submit"><CheckCircle2 size={16} aria-hidden /> Goedkeuren</button>
                </form>
                <form action={moderateInterviewComment.bind(null, comment.id, comment.interview_id, "rejected")}>
                  <button className="text-link danger" type="submit"><XCircle size={16} aria-hidden /> Afwijzen</button>
                </form>
              </div>
            </div>
          )) : <p>Geen interviewcomments in review.</p>}
        </article>
        <article className="admin-panel review-lane">
          <h3>Community posts</h3>
          {pendingPosts.length ? pendingPosts.map((post) => (
            <div className="review-card" key={post.id}>
              <div className="review-card-top">
                <span>Pending</span>
                <small>{new Date(post.created_at).toLocaleDateString("nl-NL")}</small>
              </div>
              <strong>{post.title}</strong>
              <p>{post.category}</p>
              <div className="review-actions">
                <form action={moderatePost.bind(null, post.id, "approved")}>
                  <button className="button" type="submit"><CheckCircle2 size={16} aria-hidden /> Goedkeuren</button>
                </form>
                <form action={moderatePost.bind(null, post.id, "rejected")}>
                  <button className="text-link danger" type="submit"><XCircle size={16} aria-hidden /> Afwijzen</button>
                </form>
              </div>
            </div>
          )) : <p>Geen community posts in review.</p>}
        </article>
        <article className="admin-panel review-lane">
          <h3>Meldingen</h3>
          {reports.length ? reports.map((report) => (
            <div className="review-card" key={report.id}>
              <div className="review-card-top"><span>Open</span><small>{new Date(report.created_at).toLocaleDateString("nl-NL")}</small></div>
              <p>{report.reason}</p>
              <small>Post: {report.post_id ?? "onbekend"}</small>
            </div>
          )) : <p>Geen open meldingen.</p>}
        </article>
      </div>
    </div>
  );
}

function ElementorBuilder({ settings, onOpenSections }: { settings: SiteDesignSettings; onOpenSections: () => void }) {
  return (
    <div className="admin-module builder-shell">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Elementor-style</p>
          <h2>Pagina builder</h2>
          <p>Een veilige page outline met live canvas, inspector en voor/na preview. Opslaan gebeurt via de bestaande Secties-module.</p>
        </div>
        <button className="button" type="button" onClick={onOpenSections}>
          <Save size={17} aria-hidden /> Open opslaglaag
        </button>
      </div>
      <div className="builder-layout">
        <aside className="builder-outline">
          <h3>Pagina outline</h3>
          {sectionDesignSections.map((section) => <button key={section.key} type="button">{section.label}</button>)}
        </aside>
        <section className="builder-canvas" aria-label="Builder preview">
          {sectionDesignSections.slice(0, 4).map((section) => {
            const value = mergeSectionDesign(settings, section.key);
            return (
              <article className="builder-section-preview" key={section.key} style={{ background: value.backgroundColor || undefined, color: value.textColor || undefined }}>
                <span style={{ background: value.accentColor || undefined }} />
                <p className="eyebrow">{section.key}</p>
                <h3>{section.label}</h3>
                <small>{value.layout} / {value.spacing} / {value.maxWidth}</small>
              </article>
            );
          })}
        </section>
        <aside className="builder-inspector">
          <h3>Inspector</h3>
          <label>Component<select defaultValue="hero"><option>Hero</option><option>Podcast</option><option>Community</option></select></label>
          <label>Layout<select defaultValue="split"><option>default</option><option>centered</option><option>split</option><option>dense</option></select></label>
          <label>AI copy tone<select defaultValue="warm"><option>warm</option><option>kort</option><option>campagne</option></select></label>
          <div className="compare-card">
            <strong>Voor / na</strong>
            <div><span>Live</span><span>Concept</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AccessAndRoles() {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Security</p>
          <h2>Beheerders en rollen</h2>
          <p>RBAC blauwdruk voor eigenaar, redacteur, moderator en analist. Koppel dit later aan Supabase Auth claims.</p>
        </div>
        <ShieldCheck aria-hidden />
      </div>
      <div className="admin-table-card">
        {roleRows.map((row) => (
          <div className="admin-table-row" key={row.role}>
            <strong>{row.role}</strong><span>{row.access}</span><span>{row.members}</span><small>Risico: {row.risk}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiKeyVault({ missingSupabase }: { missingSupabase?: boolean }) {
  const keys = ["OPENAI_API_KEY", "GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON", "META_ACCESS_TOKEN", "TIKTOK_CLIENT_SECRET", "MAKE_WEBHOOK_URL", "CANVA_BRAND_KIT_ID"];
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Secrets</p>
          <h2>API sleutels beheren</h2>
          <p>Sleutels worden hier gemaskeerd getoond en horen in env vars of een secret manager, niet in client state.</p>
        </div>
        <KeyRound aria-hidden />
      </div>
      {missingSupabase ? <p className="notice">Voor live sleutelbeheer is Supabase plus server-side secret opslag nodig.</p> : null}
      <div className="key-grid">
        {keys.map((key) => (
          <article className="key-card" key={key}>
            <LockKeyhole size={18} aria-hidden />
            <strong>{key}</strong>
            <code>••••••••••••••••</code>
            <small>Server-side beheren</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function MarketingCalendar() {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Marketing</p>
          <h2>Marketingkalender</h2>
          <p>Plan campagnes per kanaal, laat AI captions schrijven en routeer goedgekeurde items naar Make.</p>
        </div>
        <button className="button" type="button"><Plus size={17} aria-hidden /> Moment toevoegen</button>
      </div>
      <div className="calendar-list">
        {marketingItems.map((item) => (
          <article className="calendar-item" key={`${item.date}-${item.title}`}>
            <time>{new Date(item.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</time>
            <div><strong>{item.title}</strong><small>{item.channel}</small></div>
            <span>{item.status}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function IntegrationCenter() {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Koppelingen</p>
          <h2>Social, analytics en publishing</h2>
          <p>Configuratiepunten voor Instagram, Facebook, TikTok, Google Analytics, Make en Canva.</p>
        </div>
        <Network aria-hidden />
      </div>
      <div className="integration-grid">
        {integrationCards.map(({ platform, state, owner, icon: Icon, note }) => (
          <article className="integration-card" key={platform}>
            <Icon size={20} aria-hidden />
            <strong>{platform}</strong>
            <span>{state}</span>
            <small>{owner}</small>
            <p>{note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function AIStudio() {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">AI studio</p>
          <h2>Tekst, beeld en persoonlijkheid</h2>
          <p>Prompt templates, tone-of-voice training en Nano Banana beeldgeneratie naast een schrijfchatbot.</p>
        </div>
        <Bot aria-hidden />
      </div>
      <div className="ai-workbench">
        <article className="admin-panel">
          <h3><WandSparkles size={18} aria-hidden /> Tekstschrijver</h3>
          <textarea defaultValue="Schrijf een warme Instagram-caption over een nieuw interview, zonder te zwaar te worden." />
          <button className="button" type="button"><Sparkles size={17} aria-hidden /> Genereer tekst</button>
        </article>
        <article className="admin-panel">
          <h3><ImageIcon size={18} aria-hidden /> Nano Banana beelden</h3>
          <textarea defaultValue="Maak een serene social visual met vlinder, zachte natuur en ruimte voor echte HTML tekst." />
          <button className="button" type="button"><ImagePlus size={17} aria-hidden /> Genereer beeld</button>
        </article>
        <article className="admin-panel">
          <h3><Brain size={18} aria-hidden /> Persoonlijkheid finetunen</h3>
          <div className="tone-grid">
            <label>Warmte<input type="range" min="0" max="100" defaultValue="82" /></label>
            <label>Directheid<input type="range" min="0" max="100" defaultValue="58" /></label>
            <label>Hoopvol<input type="range" min="0" max="100" defaultValue="74" /></label>
          </div>
        </article>
      </div>
    </div>
  );
}

function AnalyticsCenter() {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Analytics hub</h2>
          <p>Source-backed model voor Google, Instagram, TikTok en eigen engagement zodra API toegang actief is.</p>
        </div>
        <Gauge aria-hidden />
      </div>
      <div className="admin-kpi-grid">
        {analyticsRows.map((row) => (
          <article className="admin-kpi-card static" key={row.metric}>
            <BarChart3 size={20} aria-hidden />
            <strong>{row.value}</strong>
            <span>{row.metric}</span>
            <small>{row.delta} - {row.source}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function BrandLibrary() {
  const assets = [
    { title: "Logo", image: "/brand/sverdriet_logo.webp", note: "Primair webmerk" },
    { title: "Moodboard", image: "/brand/moodboard.jpeg", note: "Visuele sfeer" },
    { title: "Kleuren", image: "/brand/Colors.png", note: "Palette reference" },
    { title: "Interview balk", image: "/brand/balk interviews redesign.png", note: "Social/interview stijl" }
  ];
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Brand system</p>
          <h2>Moodboard en branding bibliotheek</h2>
          <p>Logo&apos;s, kleuren, visuele stijl, Canva-koppeling en campagne-assets op een plek.</p>
        </div>
        <Palette aria-hidden />
      </div>
      <div className="brand-grid">
        {assets.map((asset) => (
          <article className="brand-card" key={asset.title}>
            <Image src={asset.image} alt="" width={420} height={260} />
            <strong>{asset.title}</strong>
            <small>{asset.note}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function AutomationHub() {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Make AI</p>
          <h2>Publishing automations</h2>
          <p>Automation blueprint: kalenderitem goedkeuren, AI copy finaliseren, asset koppelen en social post klaarzetten.</p>
        </div>
        <Workflow aria-hidden />
      </div>
      <div className="automation-flow">
        {["Kalenderitem", "AI copy", "Review", "Make webhook", "Social publish", "Analytics terugkoppeling"].map((step, index) => (
          <article key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </article>
        ))}
      </div>
      <article className="admin-panel">
        <h3>Webhook payload</h3>
        <code>{`{ "channel": "instagram", "status": "approved", "asset": "canva-design-id" }`}</code>
      </article>
    </div>
  );
}

function EpisodePreview({ episode, linkCards }: { episode: PodcastEpisode; linkCards: PodcastLinkCard[] }) {
  return (
    <aside className="episode-preview">
      {episode.image_url ? <Image src={episode.image_url} alt="" width={720} height={520} /> : <div className="preview-placeholder">Cover preview</div>}
      <p className="eyebrow">Preview</p>
      <h3>{episode.title || "Titel van aflevering"}</h3>
      <p>{episode.short_intro || "Korte intro verschijnt hier zodra deze is ingevuld."}</p>
      <div className="preview-meta">
        <span>S{episode.season_number}</span>
        <span>E{episode.episode_number}</span>
        <span>{episode.status}</span>
      </div>
      <div className="episode-link-card-grid">
        {linkCards.filter((card) => card.label && card.url).map((card, index) => (
          <a key={`${card.url}-${index}`} href={card.url} target="_blank" rel="noopener noreferrer">
            <span>{card.type}</span>
            <strong>{card.label}</strong>
            {card.description ? <small>{card.description}</small> : null}
          </a>
        ))}
      </div>
    </aside>
  );
}

function CommunityModeration({ pendingPosts, reports }: { pendingPosts: AdminPost[]; reports: AdminReport[] }) {
  return (
    <div className="admin-grid wide">
      <article className="admin-panel">
        <h2>Pending berichten</h2>
        {pendingPosts.length ? (
          pendingPosts.map((post) => (
            <div key={post.id} className="post-card">
              <h3>{post.title}</h3>
              <p>{post.category}</p>
              <form className="subtle-actions" action={moderatePost.bind(null, post.id, "approved")}>
                <button className="button" type="submit">Goedkeuren</button>
              </form>
              <form className="subtle-actions" action={moderatePost.bind(null, post.id, "rejected")}>
                <button className="text-link" type="submit">Afwijzen</button>
              </form>
            </div>
          ))
        ) : (
          <p>Geen pending berichten.</p>
        )}
      </article>
      <article className="admin-panel">
        <h2>Meldingen</h2>
        {reports.length ? reports.map((report) => <p key={report.id}>{report.reason}</p>) : <p>Geen open meldingen.</p>}
      </article>
    </div>
  );
}

function SiteSettingsForm() {
  return (
    <AdminForm title="Site instellingen" action={saveSiteSettings}>
      <label>Logo URL<input name="logo_url" defaultValue="/brand/sverdriet_logo.webp" /></label>
      <label>Homepage intro<textarea name="homepage_intro" placeholder="Intro voor de homepage" /></label>
      <label>Instagram<input name="instagram_url" /></label>
      <label>Facebook<input name="facebook_url" /></label>
      <label>TikTok<input name="tiktok_url" /></label>
      <label>Spotify<input name="spotify_url" /></label>
      <label>YouTube Music<input name="youtube_music_url" /></label>
      <label>Podimo<input name="podimo_url" /></label>
      <label>Apple Podcasts<input name="apple_podcast_url" /></label>
      <button className="button" type="submit">Opslaan</button>
    </AdminForm>
  );
}

function HostAndFaqForms() {
  return (
    <div className="admin-grid wide">
      <AdminForm title="Host toevoegen" action={saveHost}>
        <label>Naam<input name="name" required /></label>
        <label>Rol<input name="role" /></label>
        <label>Foto URL<input name="image_url" /></label>
        <label>Bio<textarea name="bio" /></label>
        <label>Persoonlijke motivatie<textarea name="personal_motivation" /></label>
        <label>Volgorde<input name="display_order" type="number" defaultValue="100" /></label>
        <label>Status<StatusSelect /></label>
        <button className="button" type="submit">Host opslaan</button>
      </AdminForm>
      <AdminForm title="FAQ toevoegen" action={saveFaq}>
        <label>Vraag<input name="question" required /></label>
        <label>Antwoord<textarea name="answer" required /></label>
        <label>Categorie<input name="category" /></label>
        <label>Volgorde<input name="display_order" type="number" defaultValue="100" /></label>
        <label>Status<StatusSelect /></label>
        <button className="button" type="submit">FAQ opslaan</button>
      </AdminForm>
    </div>
  );
}

function AdminForm({ title, action, children }: { title: string; action: (formData: FormData) => Promise<void>; children: React.ReactNode }) {
  return (
    <article className="admin-panel">
      <h2>{title}</h2>
      <form className="form-grid" action={action}>
        {children}
      </form>
    </article>
  );
}

function StatusSelect({ defaultValue = "draft" }: { defaultValue?: string }) {
  return (
    <select name="status" defaultValue={defaultValue} aria-label="Status" title="Status">
      <option value="draft">draft</option>
      <option value="scheduled">scheduled</option>
      <option value="published">published</option>
      <option value="archived">archived</option>
    </select>
  );
}

function SeasonSelect({ seasons, defaultValue }: { seasons: PodcastSeason[]; defaultValue: number }) {
  if (!seasons.length) {
    return <input name="season_number" type="number" min="1" required defaultValue={defaultValue} aria-label="Seizoensnummer" title="Seizoensnummer" />;
  }

  return (
    <select name="season_number" defaultValue={String(defaultValue)} aria-label="Seizoen" title="Seizoen">
      {seasons.map((season) => (
        <option key={season.id} value={season.season_number}>
          S{season.season_number} - {season.title}
        </option>
      ))}
    </select>
  );
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}
