"use client";

import Image from "next/image";
import { Archive, Captions, FileAudio, ImagePlus, Palette, Plus, RefreshCw, Save, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { archiveEpisode, moderatePost, refreshEpisodeTranscript, saveEpisode, saveFaq, saveHost, saveSeason, saveSectionDesignSettings, saveSiteSettings, startEpisodeTranscript } from "@/lib/actions";
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

type AdminDashboardProps = {
  episodes: PodcastEpisode[];
  seasons: PodcastSeason[];
  pendingPosts: AdminPost[];
  reports: AdminReport[];
  sectionDesign: SiteDesignSettings;
  missingSupabase?: boolean;
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
  ["podcast", "Podcast"],
  ["seasons", "Seizoenen"],
  ["community", "Community"],
  ["site", "Site"],
  ["sections", "Secties"],
  ["hosts", "Hosts"]
] as const;

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

export function AdminDashboard({ episodes, seasons, pendingPosts, reports, sectionDesign, missingSupabase, savedMessage, errorMessage }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number][0]>("podcast");
  const [selectedId, setSelectedId] = useState(episodes[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const selectedEpisode = episodes.find((episode) => episode.id === selectedId) ?? emptyEpisode;
  const [draftEpisode, setDraftEpisode] = useState<PodcastEpisode>(selectedEpisode);
  const [linkCards, setLinkCards] = useState<PodcastLinkCard[]>(selectedEpisode.link_cards ?? []);

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

  return (
    <section className="admin-shell admin-console">
      {missingSupabase ? <p className="notice">Supabase env vars ontbreken. Je ziet de beheerinterface, maar live opslaan en uploads vereisen Supabase-configuratie.</p> : null}
      {savedMessage ? <p className="notice">Opgeslagen: {feedbackLabels[savedMessage] ?? savedMessage}.</p> : null}
      {errorMessage ? <p className="notice">Fout: {feedbackLabels[errorMessage] ?? errorMessage}. Controleer Supabase-configuratie, velden of storage buckets.</p> : null}

      <div className="admin-tabs" role="tablist" aria-label="Admin onderdelen">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>

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
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter op status">
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
            encType="multipart/form-data"
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
                      <select value={card.type} onChange={(event) => updateCard(index, "type", event.target.value)}>
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
              <div className="section-design-preview" style={{ backgroundColor: value.backgroundColor || undefined, color: value.textColor || undefined }}>
                <span style={{ backgroundColor: value.accentColor || undefined }} />
                <strong>{section.label}</strong>
                <small>{value.layout} / {value.spacing}</small>
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
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
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
    <select name="status" defaultValue={defaultValue}>
      <option value="draft">draft</option>
      <option value="scheduled">scheduled</option>
      <option value="published">published</option>
      <option value="archived">archived</option>
    </select>
  );
}

function SeasonSelect({ seasons, defaultValue }: { seasons: PodcastSeason[]; defaultValue: number }) {
  if (!seasons.length) {
    return <input name="season_number" type="number" min="1" required defaultValue={defaultValue} />;
  }

  return (
    <select name="season_number" defaultValue={String(defaultValue)}>
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
