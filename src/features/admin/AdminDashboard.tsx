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
  Database,
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
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveEpisode, moderateCommunityReply, moderateInterviewComment, moderatePost, refreshEpisodeTranscript, resolveCommunityReport, saveEpisode, saveSeason, saveSectionDesignSettings, saveSiteSettings, signOutAdmin, startEpisodeTranscript } from "@/lib/actions";
import { addAdminUser, removeAdminUser, updateAdminUserRole, saveLegalDocument, deleteLegalDocument, saveFaq as saveFaqDb, deleteFaq as deleteFaqDb, saveHost as saveHostDb, deleteHost as deleteHostDb, saveMarketingItem, deleteMarketingItem, saveAISettings, saveAutomation, deleteAutomation } from "@/lib/admin-operations";
import { encodeSiteDesignSettings, mergeSectionDesign, sectionDesignSections } from "@/lib/section-design";
import styles from "./AdminDashboard.module.css";
import type {
  PodcastEpisode,
  PodcastLinkCard,
  PodcastSeason,
  SectionDesignKey,
  SectionDesignSettings,
  SiteDesignSettings,
  SiteSettings,
  AdminUser,
  LegalDocument,
  FAQ,
  HostProfile,
  AdminUserRole,
  ContentStatus,
  MarketingItem,
  AISettings,
  Automation,
  MarketingItemStatus
} from "@/types/content";

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
  reply_id?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  report_category?: string | null;
  details?: string | null;
  status?: string | null;
  priority?: string | null;
  metadata?: Record<string, unknown> | null;
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

type AdminCommunityReply = {
  id: string;
  post_id: string;
  author_name: string | null;
  author_display_type: string;
  body: string;
  created_at: string;
  status: string;
  community_posts?: {
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
  pendingCommunityReplies: AdminCommunityReply[];
  analyticsRows: AdminAnalyticsRow[];
  analyticsSources: AdminAnalyticsSource[];
  sectionDesign: SiteDesignSettings;
  siteSettings?: SiteSettings;
  missingSupabase?: boolean;
  localPreview?: boolean;
  savedMessage?: string | null;
  errorMessage?: string | null;
  initialTab?: string | null;
  adminUsers?: AdminUser[];
  adminUsersError?: string | null;
  legalDocuments?: LegalDocument[];
  faqs?: FAQ[];
  hosts?: HostProfile[];
  marketingItems?: MarketingItem[];
  aiSettings?: AISettings;
  automations?: Automation[];
  adminIdentity: AdminIdentity;
  dataCheckedAt: string;
  loginActivity: AdminLoginActivity[];
  loginActivityState: AdminDataState;
};

export type AdminDataState = "verified" | "unknown" | "error";

export type AdminAnalyticsRow = {
  metric: string;
  value: string;
  detail: string;
  source: string;
  state?: AdminDataState;
};

export type AdminAnalyticsSource = {
  platform: string;
  state: string;
  owner: string;
  note: string;
};

export type AdminIdentity = {
  displayName: string;
  email: string;
  role: AdminUserRole | "local_admin";
  provider: string;
};

export type AdminLoginActivity = {
  id: string;
  intent: "admin" | "community";
  occurredAt: string;
  identity: string;
  provider: string;
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
  ["reviews", "Inbox"],
  ["builder", "Sitebuilder"],
  ["access", "Beheerders"],
  ["keys", "Secrets"],
  ["calendar", "Kalender"],
  ["integrations", "Koppelingen"],
  ["ai", "AI hulp"],
  ["analytics", "Analytics"],
  ["brand", "Branding"],
  ["automation", "Automations"],
  ["seasons", "Seizoenen"],
  ["community", "Community"],
  ["site", "Site"],
  ["sections", "Secties"],
  ["hosts", "Hosts"],
  ["documents", "Documentatie"]
] as const;

type AdminTabId = (typeof tabs)[number][0];

const tabGroups: Array<{ title: string; helper: string; ids: AdminTabId[] }> = [
  {
    title: "Overzicht",
    helper: "Status en aandachtspunten",
    ids: ["today"]
  },
  {
    title: "Community",
    helper: "Inbox en moderatie",
    ids: ["reviews", "community"]
  },
  {
    title: "Content & media",
    helper: "Podcast, site en documenten",
    ids: ["podcast", "seasons", "hosts", "builder", "sections", "site", "brand", "documents"]
  },
  {
    title: "Groei & planning",
    helper: "Planning en groei",
    ids: ["calendar", "ai", "analytics", "automation"]
  },
  {
    title: "Beheerders & rollen",
    helper: "Toegang en koppelingen",
    ids: ["access", "keys", "integrations"]
  }
];

const tabGroupIcons = {
  "Overzicht": Gauge,
  "Community": UsersRound,
  "Content & media": Captions,
  "Groei & planning": BarChart3,
  "Beheerders & rollen": ShieldCheck
} as const;

function formatAdminRole(role: AdminIdentity["role"]) {
  const labels: Record<AdminIdentity["role"], string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    editor: "Editor",
    moderator: "Moderator",
    local_admin: "Lokale beheerder"
  };
  return labels[role];
}

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
  "transcript-failed": "transcriptie mislukt",
  "episode-save": "Aflevering niet opgeslagen. Controleer titel, seizoen, afleveringnummer en media.",
  "transcript-start": "Transcriptie kon niet starten. Controleer of audio aanwezig is en Google Speech is ingesteld."
};

const integrationIcons = {
  Instagram,
  Facebook: Share2,
  TikTok: Video,
  "Google Analytics": BarChart3,
  Make: Workflow,
  Canva: Paintbrush,
  Supabase: Database
};

const roleRows = [
  { role: "Eigenaar", access: "Alles beheren", members: "1 beheerder", risk: "Hoog" },
  { role: "Redacteur", access: "Podcast, interviews, kalender", members: "2 gebruikers", risk: "Middel" },
  { role: "Moderator", access: "Reviews en community", members: "3 gebruikers", risk: "Laag" },
  { role: "Analist", access: "Alleen analytics", members: "1 gebruiker", risk: "Laag" }
];

export function AdminDashboard({
  episodes,
  seasons,
  pendingPosts,
  reports,
  pendingInterviewComments,
  pendingCommunityReplies,
  analyticsRows,
  analyticsSources,
  sectionDesign,
  siteSettings,
  missingSupabase,
  localPreview,
  savedMessage,
  errorMessage,
  initialTab,
  adminUsers = [],
  adminUsersError = null,
  legalDocuments = [],
  faqs = [],
  hosts = [],
  marketingItems = [],
  aiSettings,
  automations = [],
  adminIdentity,
  dataCheckedAt,
  loginActivity,
  loginActivityState
}: AdminDashboardProps) {
  const safeInitialTab = tabs.some(([id]) => id === initialTab) ? (initialTab as AdminTabId) : "today";
  const [activeTab, setActiveTab] = useState<AdminTabId>(safeInitialTab);
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(episodes[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const selectedEpisode = episodes.find((episode) => episode.id === selectedId) ?? emptyEpisode;
  const [draftEpisode, setDraftEpisode] = useState<PodcastEpisode>(selectedEpisode);
  const [linkCards, setLinkCards] = useState<PodcastLinkCard[]>(selectedEpisode.link_cards ?? []);
  const failedTranscripts = episodes.filter((episode) => episode.transcript_status === "failed").length;
  const missingMedia = episodes.filter((episode) => !episode.audio_file_url || !episode.image_url).length;
  const scheduledEpisodes = episodes.filter((episode) => episode.status === "scheduled").length;
  const pendingReviewCount = pendingPosts.length + pendingCommunityReplies.length + pendingInterviewComments.length + reports.length;
  const tabBadges: Partial<Record<(typeof tabs)[number][0], number>> = {
    today: pendingReviewCount + failedTranscripts + missingMedia,
    reviews: pendingReviewCount,
    community: pendingPosts.length + pendingCommunityReplies.length + reports.length,
    calendar: scheduledEpisodes,
    analytics: analyticsRows.length
  };
  const tabMap = new Map<AdminTabId, (typeof tabs)[number]>(tabs.map((tab) => [tab[0], tab]));
  const activeTabLabel = tabMap.get(activeTab)?.[1] ?? "Overzicht";
  const activeGroup = tabGroups.find((group) => group.ids.includes(activeTab)) ?? tabGroups[0];

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

  function openTab(tab: AdminTabId) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url);
  }

  function renderTabButton([id, label]: (typeof tabs)[number]) {
    const badge = tabBadges[id];
    return (
      <button
        key={id}
        type="button"
        aria-current={activeTab === id ? "page" : undefined}
        className={`${styles.moduleButton} ${activeTab === id ? styles.moduleButtonActive : ""}`}
        onClick={() => openTab(id)}
      >
        <span>{label}</span>
        {badge ? <strong>{badge}</strong> : null}
      </button>
    );
  }

  return (
    <section className={styles.adminApp}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <strong>STUK VERDRIET</strong>
          <span>ADMINPORTAAL</span>
        </div>

        <nav className={styles.primaryNavigation} aria-label="Admin onderdelen">
          {tabGroups.map((group) => {
            const GroupIcon = tabGroupIcons[group.title as keyof typeof tabGroupIcons];
            const isActiveGroup = group.ids.includes(activeTab);
            const groupBadge = group.ids.reduce((total, id) => total + (tabBadges[id] ?? 0), 0);
            return (
              <section className={styles.navigationGroup} key={group.title} aria-label={group.title}>
                <button
                  type="button"
                  className={`${styles.groupButton} ${isActiveGroup ? styles.groupButtonActive : ""}`}
                  aria-expanded={isActiveGroup}
                  onClick={() => openTab(isActiveGroup ? activeTab : group.ids[0])}
                >
                  <GroupIcon size={17} aria-hidden />
                  <span>
                    <strong>{group.title}</strong>
                    <small>{group.helper}</small>
                  </span>
                  {groupBadge ? <b>{groupBadge}</b> : null}
                </button>
                {isActiveGroup && group.ids.length > 1 ? (
                  <div className={styles.moduleNavigation}>
                    {group.ids.map((id) => tabMap.get(id)).filter((tab): tab is (typeof tabs)[number] => Boolean(tab)).map(renderTabButton)}
                  </div>
                ) : null}
              </section>
            );
          })}
        </nav>

        <div className={styles.identityBlock}>
          <strong>{adminIdentity.displayName}</strong>
          <span>{formatAdminRole(adminIdentity.role)} · {adminIdentity.provider}</span>
          <small title={adminIdentity.email}>{adminIdentity.email}</small>
          <form action={signOutAdmin}>
            <button type="submit">Uitloggen</button>
          </form>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.workspaceHeader}>
          <div>
            <p>{activeGroup.title}</p>
            <h1>{activeTabLabel}</h1>
            <span>Laatste broncontrole: {dataCheckedAt}</span>
          </div>
          <button type="button" onClick={() => router.refresh()}>
            <RefreshCw size={16} aria-hidden />
            Bronnen verversen
          </button>
        </header>

        <div className={styles.workspaceContent}>
          <div className={styles.noticeStack} aria-live="polite">
            {missingSupabase ? <p className={styles.noticeError}>Supabase is niet gekoppeld. Live opslaan, uploads en broncontrole zijn nu niet beschikbaar.</p> : null}
            {localPreview ? <p className={styles.noticeWarning}>Beveiligde lokale beheersessie actief. Acties gebruiken de server-side Supabase-koppeling.</p> : null}
            {savedMessage ? <p className={styles.noticeSuccess}>Opgeslagen: {feedbackLabels[savedMessage] ?? savedMessage}.</p> : null}
            {errorMessage ? <p className={styles.noticeError}>Niet opgeslagen: {feedbackLabels[errorMessage] ?? errorMessage}. Controleer de bronstatus en probeer opnieuw.</p> : null}
          </div>

          {activeTab === "today" ? (
        <TodayDashboard
          episodes={episodes}
          pendingPosts={pendingPosts}
          reports={reports}
          pendingInterviewComments={pendingInterviewComments}
          pendingCommunityReplies={pendingCommunityReplies}
          missingMedia={missingMedia}
          failedTranscripts={failedTranscripts}
          scheduledEpisodes={scheduledEpisodes}
          analyticsRows={analyticsRows}
          analyticsSources={analyticsSources}
          loginActivity={loginActivity}
          loginActivityState={loginActivityState}
          dataCheckedAt={dataCheckedAt}
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
                  <small>S{episode.season_number} E{episode.episode_number} - {episodeStatusLabel(episode.status)}</small>
                </button>
              ))}
              {!filteredEpisodes.length ? <p className="small-note">Geen afleveringen gevonden. Pas je zoekterm of statusfilter aan.</p> : null}
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
            <input type="hidden" name="return_tab" value="podcast" readOnly />

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
                <label className="check-row"><input name="featured_latest" type="checkbox" defaultChecked={selectedEpisode.featured_latest} /> Toon als nieuwste aflevering</label>

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
                      Status: {transcriptStatusLabel(selectedEpisode.transcript_status)}
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
                      <p className="eyebrow">Extra acties</p>
                      <h3>Luister- en linkkaarten</h3>
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
                  {!linkCards.length ? <p className="small-note">Voeg optionele kaarten toe voor boeken, donaties of luisterplatforms.</p> : null}
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
            <input type="hidden" name="return_tab" value="seasons" readOnly />
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
              {seasons.map((season) => <p key={season.id}>S{season.season_number} - {season.title} ({episodeStatusLabel(season.status)})</p>)}
            </div>
          </article>
        </div>
      ) : null}

      {activeTab === "reviews" ? <ReviewCenter pendingInterviewComments={pendingInterviewComments} pendingCommunityReplies={pendingCommunityReplies} pendingPosts={pendingPosts} reports={reports} /> : null}
      {activeTab === "builder" ? <ElementorBuilder settings={sectionDesign} onOpenSections={() => setActiveTab("sections")} /> : null}
      {activeTab === "access" ? <AccessAndRoles adminUsers={adminUsers} sourceError={adminUsersError} /> : null}
      {activeTab === "keys" ? <ApiKeyVault missingSupabase={missingSupabase} /> : null}
      {activeTab === "calendar" ? <MarketingCalendar /> : null}
      {activeTab === "integrations" ? <IntegrationCenter analyticsSources={analyticsSources} /> : null}
      {activeTab === "ai" ? <AIStudio /> : null}
      {activeTab === "analytics" ? <AnalyticsCenter rows={analyticsRows} sources={analyticsSources} /> : null}
      {activeTab === "brand" ? <BrandLibrary /> : null}
      {activeTab === "automation" ? <AutomationHub /> : null}
      {activeTab === "community" ? <CommunityModeration pendingPosts={pendingPosts} reports={reports} /> : null}
      {activeTab === "site" ? <SiteSettingsForm siteSettings={siteSettings} /> : null}
      {activeTab === "sections" ? <SectionDesignEditor initialSettings={sectionDesign} /> : null}
      {activeTab === "hosts" ? <HostAndFaqForms faqs={faqs} hosts={hosts} /> : null}
      {activeTab === "documents" ? <DocumentsManager legalDocuments={legalDocuments} /> : null}
        </div>
      </div>
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
      <input type="hidden" name="return_tab" value="sections" readOnly />
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

function ModuleReadiness({ state, detail }: { state: string; detail: string }) {
  return (
    <aside className="module-readiness" aria-label="Module status">
      <ShieldCheck size={18} aria-hidden />
      <div>
        <strong>{state}</strong>
        <p>{detail}</p>
      </div>
    </aside>
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
  pendingCommunityReplies,
  missingMedia,
  failedTranscripts,
  scheduledEpisodes,
  analyticsRows,
  analyticsSources,
  loginActivity,
  loginActivityState,
  dataCheckedAt,
  onOpenTab
}: {
  episodes: PodcastEpisode[];
  pendingPosts: AdminPost[];
  reports: AdminReport[];
  pendingInterviewComments: AdminInterviewComment[];
  pendingCommunityReplies: AdminCommunityReply[];
  missingMedia: number;
  failedTranscripts: number;
  scheduledEpisodes: number;
  analyticsRows: AdminAnalyticsRow[];
  analyticsSources: AdminAnalyticsSource[];
  loginActivity: AdminLoginActivity[];
  loginActivityState: AdminDataState;
  dataCheckedAt: string;
  onOpenTab: (tab: (typeof tabs)[number][0]) => void;
}) {
  const draftEpisodes = episodes.filter((episode) => episode.status === "draft").slice(0, 4);
  const metricNames = ["Nieuwe SNAAR-accounts", "Terugkerende logins", "Communityprofielen", "Podcastinschrijvingen", "Interviewvolgers"];
  const registrationMetrics = metricNames.map((metric) => analyticsRows.find((row) => row.metric === metric) ?? {
    metric,
    value: "—",
    detail: "Geen betrouwbare bronwaarde ontvangen",
    source: "Bron niet beschikbaar",
    state: "unknown" as const
  });
  const metricStates = registrationMetrics.map((metric) => metric.state ?? "unknown");
  const healthState: AdminDataState = metricStates.includes("error") ? "error" : metricStates.includes("unknown") ? "unknown" : "verified";
  const healthCopy = {
    verified: ["Alle kernbronnen bereikbaar", `Supabase en registratiebronnen gecontroleerd om ${dataCheckedAt}`],
    unknown: ["Een deel van de bronstatus is onbekend", "Ververs de bronnen of controleer de ontbrekende configuratie."],
    error: ["Niet alle cijfers konden worden gecontroleerd", "Cijfers met een bronfout worden niet als nul weergegeven."]
  }[healthState];
  const googleIntent = analyticsRows.find((row) => row.metric === "Google-inlogdoel");
  const openReviews = pendingPosts.length + pendingCommunityReplies.length + pendingInterviewComments.length + reports.length;

  return (
    <div className={`${styles.overview} admin-module`}>
      <section className={`${styles.sourceHealth} ${styles[`sourceHealth_${healthState}`]}`} aria-label="Status van databronnen">
        <div>
          {healthState === "verified" ? <CheckCircle2 size={19} aria-hidden /> : healthState === "error" ? <XCircle size={19} aria-hidden /> : <ShieldCheck size={19} aria-hidden />}
          <span>
            <strong>{healthCopy[0]}</strong>
            <small>{healthCopy[1]}</small>
          </span>
        </div>
        <b>{healthState === "verified" ? "GEVERIFIEERD" : healthState === "error" ? "BRONFOUT" : "ONBEKEND"}</b>
      </section>

      <section className={styles.metricGrid} aria-label="Registratiecijfers">
        {registrationMetrics.map((metric) => {
          const state = metric.state ?? "unknown";
          return (
            <article className={styles.metricCard} key={metric.metric}>
              <div>
                <span>{metric.metric}</span>
                <i className={`${styles.stateDot} ${styles[`stateDot_${state}`]}`} aria-label={state === "verified" ? "Geverifieerd" : state === "error" ? "Bronfout" : "Onbekend"} />
              </div>
              <strong>{state === "error" ? "—" : metric.value}</strong>
              <small>{state === "error" ? "Bronwaarde niet beschikbaar" : metric.detail}</small>
            </article>
          );
        })}
      </section>

      <section className={styles.activitySection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className="eyebrow">Vandaag</p>
            <h2>Recente login- en volgactiviteit</h2>
          </div>
          <span>{googleIntent?.detail ?? "Admin- en communitylogin worden afzonderlijk geregistreerd"}</span>
        </div>
        <div className={styles.activityTable} role="table" aria-label="Recente loginactiviteit">
          {loginActivity.length ? loginActivity.map((activity) => (
            <div className={styles.activityRow} role="row" key={activity.id}>
              <time dateTime={activity.occurredAt}>{formatActivityTime(activity.occurredAt)}</time>
              <strong className={activity.intent === "admin" ? styles.adminIntent : undefined}>{activity.intent === "admin" ? "Admin" : "Community"}</strong>
              <span title={activity.identity}>{activity.identity}</span>
              <small>{activity.provider}</small>
              <b>Geverifieerd</b>
            </div>
          )) : (
            <div className={styles.activityEmpty}>
              <strong>{loginActivityState === "error" ? "Loginactiviteit kon niet worden opgehaald." : "Nog geen loginactiviteit gevonden."}</strong>
              <span>
                {loginActivityState === "error"
                  ? "De bron gaf een fout terug; deze lege lijst is daarom geen bevestiging dat er geen aanmeldingen waren."
                  : loginActivityState === "verified"
                    ? "Dit is een bevestigde lege toestand; admin- en communitydoelen blijven apart geregistreerd."
                    : "De bronstatus is nog onbekend. Ververs de bronnen voordat je deze lege lijst als definitief beschouwt."}
              </span>
            </div>
          )}
        </div>
        <div className={styles.stateLegend} aria-label="Betekenis van bronstatussen">
          <span className={styles.legendVerified}>Geverifieerd</span>
          <span className={styles.legendUnknown}>Onbekend</span>
          <span className={styles.legendError}>Bronfout</span>
        </div>
      </section>

      <div className={styles.overviewLowerGrid}>
        <article className="admin-panel">
          <div className={styles.sectionHeading}>
            <div>
              <p className="eyebrow">Werkvoorraad</p>
              <h2>Aandacht vandaag</h2>
            </div>
            <span>{openReviews + missingMedia + failedTranscripts} open signalen</span>
          </div>
          <div className="workflow-list">
            <button type="button" onClick={() => onOpenTab("reviews")}><ClipboardCheck size={17} aria-hidden /> {openReviews} reacties en meldingen beoordelen</button>
            <button type="button" onClick={() => onOpenTab("podcast")}><ImagePlus size={17} aria-hidden /> {missingMedia} afleveringen missen media</button>
            <button type="button" onClick={() => onOpenTab("podcast")}><Captions size={17} aria-hidden /> {failedTranscripts} transcripties vragen aandacht</button>
            <button type="button" onClick={() => onOpenTab("calendar")}><CalendarDays size={17} aria-hidden /> {scheduledEpisodes} publicaties staan gepland</button>
          </div>
        </article>
        <article className="admin-panel">
          <div className={styles.sectionHeading}>
            <div>
              <p className="eyebrow">Bronnen</p>
              <h2>Datakoppelingen</h2>
            </div>
          </div>
          <div className={styles.sourceList}>
            {analyticsSources.slice(0, 4).map((source) => (
              <div key={source.platform}>
                <span><strong>{source.platform}</strong><small>{source.owner}</small></span>
                <b>{source.state}</b>
              </div>
            ))}
          </div>
        </article>
        <article className="admin-panel">
          <div className={styles.sectionHeading}>
            <div>
              <p className="eyebrow">Redactie</p>
              <h2>Podcastconcepten</h2>
            </div>
          </div>
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

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tijd onbekend";
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function ReviewCenter({ pendingInterviewComments, pendingCommunityReplies, pendingPosts, reports }: { pendingInterviewComments: AdminInterviewComment[]; pendingCommunityReplies: AdminCommunityReply[]; pendingPosts: AdminPost[]; reports: AdminReport[] }) {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Review inbox</p>
          <h2>Af- en goedkeuren</h2>
          <p>Moderatie voor interviewreacties, communityreacties, communityberichten en open meldingen in een veilige reviewflow.</p>
        </div>
      </div>
      <div className="review-summary" aria-label="Review samenvatting">
        <span><strong>{pendingInterviewComments.length}</strong> interviewreacties</span>
        <span><strong>{pendingCommunityReplies.length}</strong> communityreacties</span>
        <span><strong>{pendingPosts.length}</strong> communityberichten</span>
        <span><strong>{reports.length}</strong> open meldingen</span>
      </div>
      <div className="review-board">
        <article className="admin-panel review-lane">
          <h3>Communityreacties</h3>
          {pendingCommunityReplies.length ? pendingCommunityReplies.map((reply) => (
            <div className="review-card" key={reply.id}>
              <div className="review-card-top">
                <span>Wacht op review</span>
                <small>{new Date(reply.created_at).toLocaleDateString("nl-NL")}</small>
              </div>
              <strong>{reply.community_posts?.title ?? "Communitybericht"}</strong>
              <p>{reply.body}</p>
              <small>Door {reply.author_name ?? "Anoniem"} - {reply.author_display_type}</small>
              <div className="review-actions">
                <form action={moderateCommunityReply.bind(null, reply.id, "approved")}>
                  <button className="button" type="submit"><CheckCircle2 size={16} aria-hidden /> Goedkeuren</button>
                </form>
                <form action={moderateCommunityReply.bind(null, reply.id, "rejected")}>
                  <button className="text-link danger" type="submit"><XCircle size={16} aria-hidden /> Afwijzen</button>
                </form>
              </div>
            </div>
          )) : <p className="empty-state">Geen communityreacties die op review wachten.</p>}
        </article>
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
          )) : <p className="empty-state">Alles is beoordeeld. Nieuwe interviewreacties verschijnen hier.</p>}
        </article>
        <article className="admin-panel review-lane">
          <h3>Community posts</h3>
          {pendingPosts.length ? pendingPosts.map((post) => (
            <div className="review-card" key={post.id}>
              <div className="review-card-top">
                <span>Wacht op review</span>
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
          )) : <p className="empty-state">Geen communityberichten die op review wachten.</p>}
        </article>
        <article className="admin-panel review-lane">
          <h3>Meldingen</h3>
          {reports.length ? reports.map((report) => (
            <AdminReportCard report={report} key={report.id} />
          )) : <p className="empty-state">Geen open meldingen.</p>}
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
          <p className="eyebrow">Sitebeheer</p>
          <h2>Pagina builder</h2>
          <p>Bekijk de homepage-opbouw en pas styling veilig aan via Secties. De canvas is een preview, de opslaglaag zit in Secties.</p>
        </div>
        <button className="button" type="button" onClick={onOpenSections}>
          <Save size={17} aria-hidden /> Pas secties aan
        </button>
      </div>
      <ModuleReadiness state="Live preview" detail="Deze module leest de huidige sectie-instellingen. Wijzigingen opslaan doe je via Secties." />
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

function AccessAndRoles({ adminUsers = [], sourceError }: { adminUsers?: AdminUser[]; sourceError?: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<AdminUserRole>("admin");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim() || sourceError) return;
    setErrorMsg("");
    
    startTransition(async () => {
      const res = await addAdminUser(emailInput, roleInput);
      if (res.error) {
        setErrorMsg("Fout: " + res.error);
      } else {
        setEmailInput("");
        router.refresh();
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je deze beheerder wilt verwijderen?")) return;
    setErrorMsg("");
    
    startTransition(async () => {
      const res = await removeAdminUser(id);
      if (res.error) {
        setErrorMsg("Fout bij verwijderen: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  async function handleRoleChange(id: string, newRole: AdminUserRole) {
    setErrorMsg("");
    startTransition(async () => {
      const res = await updateAdminUserRole(id, newRole);
      if (res.error) {
        setErrorMsg("Fout bij bijwerken rol: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Security</p>
          <h2>Beheerders en rollen</h2>
          <p>Beheer hier live de actieve beheerders en hun specifieke machtigingen in het systeem.</p>
        </div>
        <ShieldCheck aria-hidden />
      </div>

      {errorMsg ? <p className="notice error">{errorMsg}</p> : null}
      {sourceError ? (
        <div className={styles.roleSourceError} role="alert">
          <XCircle size={20} aria-hidden />
          <span>
            <strong>Rollenbeheer is niet beschikbaar</strong>
            <small>De tabel <code>public.admin_users</code> kon niet betrouwbaar worden gelezen. Er wordt daarom geen lege beheerderslijst getoond.</small>
            <code>{sourceError}</code>
          </span>
        </div>
      ) : null}

      <div className="admin-grid wide">
        <article className="admin-panel">
          <h3>Beheerder toevoegen</h3>
          <form className="form-grid" onSubmit={handleAdd}>
            <label>
              E-mailadres
              <input 
                type="email" 
                required 
                placeholder="beheerder@stukverdriet.nl" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)} 
                disabled={isPending || Boolean(sourceError)}
              />
            </label>
            <label>
              Rol
              <select 
                value={roleInput} 
                onChange={(e) => setRoleInput(e.target.value as AdminUserRole)}
                disabled={isPending || Boolean(sourceError)}
                aria-label="Selecteer rol"
                title="Selecteer rol"
              >
                <option value="super_admin">Super Admin (Eigenaar)</option>
                <option value="admin">Admin (Redacteur)</option>
                <option value="editor">Editor (Inhoud)</option>
                <option value="moderator">Moderator (Community)</option>
              </select>
            </label>
            <button className="button" type="submit" disabled={isPending || Boolean(sourceError)}>
              {isPending ? "Bezig..." : "Toevoegen"}
            </button>
          </form>
        </article>

        <article className="admin-panel">
          <h3>Actieve Beheerders ({adminUsers.length})</h3>
          <div className="admin-table-card">
            {adminUsers.map((user) => (
              <div className="admin-table-row" key={user.id}>
                <div>
                  <strong>{user.email}</strong>
                  <p className="small-note">Toegevoegd op: {new Date(user.created_at).toLocaleDateString("nl-NL")}</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as AdminUserRole)}
                    disabled={isPending || Boolean(sourceError)}
                    aria-label="Wijzig rol"
                    title="Wijzig rol"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="moderator">Moderator</option>
                  </select>
                  <button 
                    type="button" 
                    className="text-link danger" 
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => handleDelete(user.id)}
                    disabled={isPending || Boolean(sourceError)}
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            ))}
            {!adminUsers.length && !sourceError ? (
              <p className="empty-state">De bron is gecontroleerd: er zijn nog geen databasebeheerders geconfigureerd.</p>
            ) : null}
          </div>
        </article>
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

function MarketingCalendar({ marketingItems = [] }: { marketingItems?: MarketingItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [channel, setChannel] = useState("Instagram");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<MarketingItemStatus>("draft");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!channel.trim() || !title.trim() || !date) return;
    setErrorMsg("");

    startTransition(async () => {
      const res = await saveMarketingItem(editingId, date, channel, title, status);
      if (res.error) {
        setErrorMsg("Kalender fout: " + res.error);
      } else {
        resetForm();
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je dit kalenderitem wilt verwijderen?")) return;
    setErrorMsg("");
    startTransition(async () => {
      const res = await deleteMarketingItem(id);
      if (res.error) {
        setErrorMsg("Kalender verwijderfout: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  function editItem(item: MarketingItem) {
    setEditingId(item.id);
    setDate(item.date);
    setChannel(item.channel);
    setTitle(item.title);
    setStatus(item.status);
  }

  function resetForm() {
    setEditingId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setChannel("Instagram");
    setTitle("");
    setStatus("draft");
  }

  const channelLabelColors: Record<string, string> = {
    Instagram: "var(--insta-color, #E1306C)",
    TikTok: "#000000",
    Facebook: "#1877F2",
    Nieuwsbrief: "var(--pine, #1A4D3E)",
    Website: "var(--accent, #D4AF37)"
  };

  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Marketing</p>
          <h2>Marketingkalender</h2>
          <p>Beheer hier live alle geplande campagnes, social posts en nieuwsbrieven in een interactieve planning.</p>
        </div>
      </div>

      {errorMsg ? <p className="notice error">{errorMsg}</p> : null}

      <div className="admin-grid wide">
        <article className="admin-panel">
          <h2>{editingId ? "Item bewerken" : "Item toevoegen"}</h2>
          <form className="form-grid" onSubmit={handleSave}>
            <label>Datum<input type="date" required value={date} onChange={(e) => setDate(e.target.value)} disabled={isPending} /></label>
            <label>Kanaal
              <select value={channel} onChange={(e) => setChannel(e.target.value)} disabled={isPending} aria-label="Kanaal" title="Kanaal">
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="Nieuwsbrief">Nieuwsbrief</option>
                <option value="Website">Website</option>
              </select>
            </label>
            <label>Titel / Campagne-omschrijving<input required value={title} onChange={(e) => setTitle(e.target.value)} disabled={isPending} placeholder="bijv. Quote uit interview plaatsen" /></label>
            <label>Status
              <select value={status} onChange={(e) => setStatus(e.target.value as MarketingItemStatus)} disabled={isPending} aria-label="Item status" title="Item status">
                <option value="draft">Concept</option>
                <option value="needs_text">AI tekst nodig</option>
                <option value="review">Review</option>
                <option value="scheduled">Gepland</option>
              </select>
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="button" type="submit" disabled={isPending}>Opslaan</button>
              {editingId ? <button className="button ghost" type="button" onClick={resetForm} disabled={isPending}>Annuleren</button> : null}
            </div>
          </form>
        </article>

        <article className="admin-panel">
          <h2>Geplande Marketing ({marketingItems.length})</h2>
          <div className="calendar-list" style={{ marginTop: "1rem" }}>
            {marketingItems.map((item) => (
              <article className="calendar-item" key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <time style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--light-bg)", padding: "10px", borderRadius: "8px", minWidth: "60px" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{new Date(item.date).getDate()}</span>
                    <span style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>{new Date(item.date).toLocaleDateString("nl-NL", { month: "short" })}</span>
                  </time>
                  <div>
                    <strong>{item.title}</strong>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <small style={{ color: channelLabelColors[item.channel] || "var(--pine)", fontWeight: "bold" }}>{item.channel}</small>
                      <small style={{ opacity: 0.7 }}>· Status: {item.status}</small>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="text-link" onClick={() => editItem(item)} disabled={isPending}>Bewerk</button>
                  <button type="button" className="text-link danger" onClick={() => handleDelete(item.id)} disabled={isPending}>Verwijder</button>
                </div>
              </article>
            ))}
            {!marketingItems.length ? <p className="empty-state">Geen marketingplanning in database.</p> : null}
          </div>
        </article>
      </div>
    </div>
  );
}

function IntegrationCenter({ analyticsSources }: { analyticsSources: AdminAnalyticsSource[] }) {
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
      <ModuleReadiness state="Configuratiecheck" detail="Koppelingen tonen nu de echte serverconfiguratie. Alleen bronnen met API-toegang leveren cijfers." />
      <div className="integration-grid">
        {analyticsSources.map(({ platform, state, owner, note }) => {
          const Icon = integrationIcons[platform as keyof typeof integrationIcons] ?? Network;
          return (
          <article className="integration-card" key={platform}>
            <Icon size={20} aria-hidden />
            <strong>{platform}</strong>
            <span>{state}</span>
            <small>{owner}</small>
            <p>{note}</p>
          </article>
          );
        })}
      </div>
    </div>
  );
}

function AIStudio({
  aiSettings,
  automations = []
}: {
  aiSettings?: AISettings;
  automations?: Automation[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  // AI Prompts and Tone state (initialized with database values or fallbacks)
  const [textPrompt, setTextPrompt] = useState(aiSettings?.text_prompt ?? "Schrijf een warme Instagram-caption over een nieuw interview, zonder te zwaar te worden.");
  const [imagePrompt, setImagePrompt] = useState(aiSettings?.image_prompt ?? "Maak een serene social visual met vlinder, zachte natuur en ruimte voor echte HTML tekst.");
  const [toneWarmth, setToneWarmth] = useState(aiSettings?.tone_warmth ?? 82);
  const [toneDirectness, setToneDirectness] = useState(aiSettings?.tone_directness ?? 58);
  const [toneHopeful, setToneHopeful] = useState(aiSettings?.tone_hopeful ?? 74);

  // Automation Form State
  const [triggerEvent, setTriggerEvent] = useState("Als podcast live gaat");
  const [actionType, setActionType] = useState("Maak kalender-item aan");
  const [autoDescription, setAutoDescription] = useState("");

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    startTransition(async () => {
      const res = await saveAISettings(textPrompt, imagePrompt, toneWarmth, toneDirectness, toneHopeful);
      if (res.error) {
        setErrorMsg("Fout bij opslaan AI instellingen: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  async function handleAddAutomation(e: React.FormEvent) {
    e.preventDefault();
    if (!autoDescription.trim()) return;
    setErrorMsg("");

    startTransition(async () => {
      const res = await saveAutomation(null, triggerEvent, actionType, autoDescription, true);
      if (res.error) {
        setErrorMsg("Automation fout: " + res.error);
      } else {
        setAutoDescription("");
        router.refresh();
      }
    });
  }

  async function handleToggleAutomation(automation: Automation) {
    setErrorMsg("");
    startTransition(async () => {
      const res = await saveAutomation(
        automation.id,
        automation.trigger_event,
        automation.action_type,
        automation.description,
        !automation.is_active
      );
      if (res.error) {
        setErrorMsg("Fout bij wijzigen status: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  async function handleDeleteAutomation(id: string) {
    if (!confirm("Weet je zeker dat je deze automation wilt verwijderen?")) return;
    setErrorMsg("");
    startTransition(async () => {
      const res = await deleteAutomation(id);
      if (res.error) {
        setErrorMsg("Fout bij verwijderen automation: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">AI studio</p>
          <h2>Tekst, beeld en persoonlijkheid</h2>
          <p>Pas hier live de AI prompt templates en de tone-of-voice persoonlijkheidsschuifregelaars van je merk aan.</p>
        </div>
        <Bot aria-hidden />
      </div>

      {errorMsg ? <p className="notice error">{errorMsg}</p> : null}

      <div className="admin-grid wide" style={{ marginBottom: "2rem" }}>
        {/* LEFT PANEL - PROMPT WRITING */}
        <article className="admin-panel">
          <h2>Prompt Sjablonen & Generatoren</h2>
          <form className="form-grid" onSubmit={handleSaveSettings}>
            <label>
              <h3><WandSparkles size={18} aria-hidden /> Tekstschrijver Prompt</h3>
              <p className="small-note">Stuurinstructie voor captions en teksten.</p>
              <textarea 
                value={textPrompt} 
                onChange={(e) => setTextPrompt(e.target.value)} 
                disabled={isPending}
                style={{ minHeight: "100px" }}
              />
            </label>

            <label>
              <h3><ImageIcon size={18} aria-hidden /> Nano Banana Beeld Prompt</h3>
              <p className="small-note">Instructie voor AI-beeldgeneratoren.</p>
              <textarea 
                value={imagePrompt} 
                onChange={(e) => setImagePrompt(e.target.value)} 
                disabled={isPending}
                style={{ minHeight: "100px" }}
              />
            </label>

            <h3><Brain size={18} aria-hidden /> Merk Persoonlijkheid (Fine-tuning)</h3>
            <p className="small-note">Instellingen beïnvloeden de AI-tonaliteit.</p>
            <div className="tone-grid" style={{ gap: "15px" }}>
              <label style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Warmte ({toneWarmth}%)</span>
                <input type="range" min="0" max="100" value={toneWarmth} onChange={(e) => setToneWarmth(Number(e.target.value))} disabled={isPending} />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Directheid ({toneDirectness}%)</span>
                <input type="range" min="0" max="100" value={toneDirectness} onChange={(e) => setToneDirectness(Number(e.target.value))} disabled={isPending} />
              </label>
              <label style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Hoopvol ({toneHopeful}%)</span>
                <input type="range" min="0" max="100" value={toneHopeful} onChange={(e) => setToneHopeful(Number(e.target.value))} disabled={isPending} />
              </label>
            </div>

            <button className="button" type="submit" disabled={isPending} style={{ marginTop: "1rem" }}>
              AI Instellingen Opslaan
            </button>
          </form>
        </article>

        {/* RIGHT PANEL - AUTOMATIONS & IDEAS */}
        <article className="admin-panel">
          <h2><Workflow size={18} aria-hidden /> AI Automation Builder</h2>
          <p className="small-note">Maak laagdrempelig eigen automatische AI-taken aan die reageren op website-events.</p>

          <form className="form-grid" onSubmit={handleAddAutomation} style={{ marginTop: "1rem" }}>
            <label>Als (Trigger Event)
              <select value={triggerEvent} onChange={(e) => setTriggerEvent(e.target.value)} disabled={isPending} aria-label="Trigger" title="Trigger">
                <option value="Als podcast live gaat">Als podcast live gaat</option>
                <option value="Als nieuw lid lid wordt">Als nieuw community-lid registreert</option>
                <option value="Als herinnering geplaatst wordt">Als herinnering/pulse geplaatst wordt</option>
                <option value="Als nieuwe bestelling gedaan wordt">Als nieuwe bestelling gedaan wordt</option>
              </select>
            </label>
            <label>Dan (AI Actie)
              <select value={actionType} onChange={(e) => setActionType(e.target.value)} disabled={isPending} aria-label="Actie" title="Actie">
                <option value="Maak kalender-item aan">Maak kalender-item aan</option>
                <option value="Schrijf Instagram caption">Schrijf Instagram caption</option>
                <option value="Genereer AI visual template">Genereer AI visual template</option>
                <option value="Plan nieuwsbrief concept">Plan nieuwsbrief concept</option>
              </select>
            </label>
            <label>Omschrijving / AI Instructie
              <textarea 
                required 
                placeholder="bijv: Gebruik de podcasttitel en schrijf een Instagram-caption met maximaal 3 hashtags." 
                value={autoDescription} 
                onChange={(e) => setAutoDescription(e.target.value)} 
                disabled={isPending} 
              />
            </label>
            <button className="button" type="submit" disabled={isPending}>
              Automation Activeren
            </button>
          </form>

          <h3 style={{ marginTop: "2rem" }}>Actieve AI Automations ({automations.length})</h3>
          <div className="compact-list" style={{ marginTop: "1rem" }}>
            {automations.map((auto) => (
              <div key={auto.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ maxWidth: "70%" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{auto.trigger_event} &rarr; {auto.action_type}</strong>
                  <p className="small-note" style={{ margin: "4px 0" }}>{auto.description}</p>
                  <small style={{ opacity: 0.7 }}>Status: {auto.is_active ? "Actief" : "Gepauzeerd"}</small>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="text-link" onClick={() => handleToggleAutomation(auto)} disabled={isPending}>
                    {auto.is_active ? "Pauzeer" : "Hervat"}
                  </button>
                  <button type="button" className="text-link danger" onClick={() => handleDeleteAutomation(auto.id)} disabled={isPending}>
                    Wis
                  </button>
                </div>
              </div>
            ))}
            {!automations.length ? <p className="empty-state">Geen automations geconfigureerd. Voeg er een toe om te starten.</p> : null}
          </div>
        </article>
      </div>
    </div>
  );
}

function AnalyticsCenter({ rows, sources }: { rows: AdminAnalyticsRow[]; sources: AdminAnalyticsSource[] }) {
  const liveSources = sources.filter((source) => source.state.toLowerCase().includes("live")).map((source) => source.platform);
  const missingSources = sources.filter((source) => !source.state.toLowerCase().includes("live"));

  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Analytics hub</h2>
          <p>Live cijfers uit gekoppelde bronnen. Niet-gekoppelde API&apos;s worden apart gemarkeerd en tonen geen placeholders.</p>
        </div>
        <Gauge aria-hidden />
      </div>
      <ModuleReadiness
        state={liveSources.length ? "Live data" : "Geen live databron"}
        detail={liveSources.length ? `Actieve bron: ${liveSources.join(", ")}.` : "Koppel eerst Supabase, GA4 of social API-toegang om cijfers te tonen."}
      />
      <div className="admin-kpi-grid">
        {rows.map((row) => (
          <article className="admin-kpi-card static" key={row.metric}>
            <BarChart3 size={20} aria-hidden />
            <strong>{row.value}</strong>
            <span>{row.metric}</span>
            <small>{row.detail} - {row.source}</small>
          </article>
        ))}
      </div>
      {missingSources.length ? (
        <div className="integration-grid">
          {missingSources.map((source) => {
            const Icon = integrationIcons[source.platform as keyof typeof integrationIcons] ?? Network;
            return (
              <article className="integration-card" key={source.platform}>
                <Icon size={20} aria-hidden />
                <strong>{source.platform}</strong>
                <span>{source.state}</span>
                <small>{source.owner}</small>
                <p>{source.note}</p>
              </article>
            );
          })}
        </div>
      ) : null}
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
      <ModuleReadiness state="Blueprint" detail="Automations zijn nog geen live workflows. Koppel eerst Make webhook, reviewstatus en publishing logs." />
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
        <span>{episodeStatusLabel(episode.status)}</span>
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
          <p className="empty-state">Geen berichten die op review wachten.</p>
        )}
      </article>
      <article className="admin-panel">
        <h2>Meldingen</h2>
        <div className="review-lane">
          {reports.length ? reports.map((report) => <AdminReportCard report={report} key={report.id} />) : <p>Geen open meldingen.</p>}
        </div>
      </article>
    </div>
  );
}

function AdminReportCard({ report }: { report: AdminReport }) {
  const targetType = report.target_type ?? (report.reply_id ? "reply" : "post");
  const targetId = report.target_id ?? report.reply_id ?? report.post_id;
  return (
    <div className="review-card">
      <div className="review-card-top">
        <span>{report.priority === "high" ? "Hoog" : "Open"}</span>
        <small>{new Date(report.created_at).toLocaleDateString("nl-NL")}</small>
      </div>
      <p>{report.details || report.reason}</p>
      <small>
        {report.report_category ?? "melding"} - {targetType}: {targetId ?? "onbekend"}
      </small>
      <div className="subtle-actions">
        <form action={resolveCommunityReport.bind(null, report.id)}>
          <input type="hidden" name="resolution_note" value="Afgehandeld vanuit admin portaal" readOnly />
          <button className="button" type="submit">Markeer opgelost</button>
        </form>
        {report.post_id ? (
          <form action={moderatePost.bind(null, report.post_id, "archived")}>
            <button className="text-link danger" type="submit">Verberg post</button>
          </form>
        ) : null}
        {report.reply_id ? (
          <form action={moderateCommunityReply.bind(null, report.reply_id, "archived")}>
            <button className="text-link danger" type="submit">Verberg reactie</button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function SiteSettingsForm({ siteSettings }: { siteSettings?: SiteSettings }) {
  const currentLogoUrl = siteSettings?.logo_url || "/brand/sverdriet_logo.webp";
  return (
    <AdminForm title="Site instellingen" action={saveSiteSettings}>
      <input type="hidden" name="return_tab" value="site" readOnly />
      {currentLogoUrl ? (
        <div className="admin-current-logo">
          <Image src={currentLogoUrl} alt="Huidig logo" width={64} height={64} />
        </div>
      ) : null}
      <label className="upload-field">
        <ImagePlus aria-hidden />
        <span>Logo uploaden</span>
        <input name="logo_file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
      </label>
      <label>Logo URL<input name="logo_url" defaultValue={currentLogoUrl} /></label>
      <label>Homepage intro<textarea name="homepage_intro" defaultValue={siteSettings?.homepage_intro ?? ""} placeholder="Intro voor de homepage" /></label>
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

function HostAndFaqForms({ faqs = [], hosts = [] }: { faqs?: FAQ[]; hosts?: HostProfile[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  // Host Form State
  const [editingHostId, setEditingHostId] = useState<string | null>(null);
  const [hostName, setHostName] = useState("");
  const [hostRole, setHostRole] = useState("");
  const [hostImageUrl, setHostImageUrl] = useState("");
  const [hostBio, setHostBio] = useState("");
  const [hostMotivation, setHostMotivation] = useState("");
  const [hostOrder, setHostOrder] = useState(100);
  const [hostStatus, setHostStatus] = useState<ContentStatus>("draft");

  // FAQ Form State
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("");
  const [faqOrder, setFaqOrder] = useState(100);
  const [faqStatus, setFaqStatus] = useState<ContentStatus>("draft");

  function editHost(host: HostProfile) {
    setEditingHostId(host.id);
    setHostName(host.name);
    setHostRole(host.role ?? "");
    setHostImageUrl(host.image_url ?? "");
    setHostBio(host.bio ?? "");
    setHostMotivation(host.personal_motivation ?? "");
    setHostOrder(host.display_order);
    setHostStatus((host.status as ContentStatus) ?? "draft");
  }

  function resetHostForm() {
    setEditingHostId(null);
    setHostName("");
    setHostRole("");
    setHostImageUrl("");
    setHostBio("");
    setHostMotivation("");
    setHostOrder(100);
    setHostStatus("draft");
  }

  function handleSaveHost(e: React.FormEvent) {
    e.preventDefault();
    if (!hostName.trim()) return;
    setErrorMsg("");

    startTransition(async () => {
      const res = await saveHostDb(
        editingHostId,
        hostName,
        hostRole || null,
        hostImageUrl || null,
        hostBio || null,
        hostMotivation || null,
        hostOrder,
        hostStatus
      );
      if (res.error) {
        setErrorMsg("Host fout: " + res.error);
      } else {
        resetHostForm();
        router.refresh();
      }
    });
  }

  function handleDeleteHost(id: string) {
    if (!confirm("Weet je zeker dat je deze host wilt verwijderen?")) return;
    setErrorMsg("");
    startTransition(async () => {
      const res = await deleteHostDb(id);
      if (res.error) {
        setErrorMsg("Host verwijderfout: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  function editFaq(faq: FAQ) {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category ?? "");
    setFaqOrder(faq.display_order);
    setFaqStatus((faq.status as ContentStatus) ?? "draft");
  }

  function resetFaqForm() {
    setEditingFaqId(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqCategory("");
    setFaqOrder(100);
    setFaqStatus("draft");
  }

  function handleSaveFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    setErrorMsg("");

    startTransition(async () => {
      const res = await saveFaqDb(
        editingFaqId,
        faqQuestion,
        faqAnswer,
        faqCategory || null,
        faqOrder,
        faqStatus
      );
      if (res.error) {
        setErrorMsg("FAQ fout: " + res.error);
      } else {
        resetFaqForm();
        router.refresh();
      }
    });
  }

  function handleDeleteFaq(id: string) {
    if (!confirm("Weet je zeker dat je deze FAQ wilt verwijderen?")) return;
    setErrorMsg("");
    startTransition(async () => {
      const res = await deleteFaqDb(id);
      if (res.error) {
        setErrorMsg("FAQ verwijderfout: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="admin-grid wide">
      {errorMsg ? <p className="notice error">{errorMsg}</p> : null}

      {/* HOST MANAGEMENT PANEL */}
      <article className="admin-panel">
        <h2>{editingHostId ? "Host bewerken" : "Host toevoegen"}</h2>
        <form className="form-grid" onSubmit={handleSaveHost}>
          <label>Naam<input required value={hostName} onChange={(e) => setHostName(e.target.value)} disabled={isPending} /></label>
          <label>Rol<input value={hostRole} onChange={(e) => setHostRole(e.target.value)} disabled={isPending} placeholder="bijv. Gastvrouw" /></label>
          <label>Foto URL<input value={hostImageUrl} onChange={(e) => setHostImageUrl(e.target.value)} disabled={isPending} placeholder="/img/hosts/..." /></label>
          <label>Bio<textarea value={hostBio} onChange={(e) => setHostBio(e.target.value)} disabled={isPending} /></label>
          <label>Persoonlijke motivatie<textarea value={hostMotivation} onChange={(e) => setHostMotivation(e.target.value)} disabled={isPending} /></label>
          <div className="field-row">
            <label>Volgorde<input type="number" value={hostOrder} onChange={(e) => setHostOrder(Number(e.target.value))} disabled={isPending} /></label>
            <label>Status
              <select value={hostStatus} onChange={(e) => setHostStatus(e.target.value as ContentStatus)} disabled={isPending} aria-label="Host status" title="Host status">
                <option value="draft">Concept</option>
                <option value="scheduled">Gepland</option>
                <option value="published">Gepubliceerd</option>
                <option value="archived">Gearchiveerd</option>
              </select>
            </label>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="button" type="submit" disabled={isPending}>Opslaan</button>
            {editingHostId ? <button className="button ghost" type="button" onClick={resetHostForm} disabled={isPending}>Annuleren</button> : null}
          </div>
        </form>

        <h3 style={{ marginTop: "2rem" }}>Geregistreerde Hosts ({hosts.length})</h3>
        <div className="compact-list" style={{ marginTop: "1rem" }}>
          {hosts.map((host) => (
            <div key={host.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <strong>{host.name}</strong> <small>({host.role || "geen rol"})</small>
                <p className="small-note">Volgorde: {host.display_order} · Status: {host.status}</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="text-link" onClick={() => editHost(host)} disabled={isPending}>Bewerk</button>
                <button type="button" className="text-link danger" onClick={() => handleDeleteHost(host.id)} disabled={isPending}>Verwijder</button>
              </div>
            </div>
          ))}
          {!hosts.length ? <p className="empty-state">Geen hosts in database.</p> : null}
        </div>
      </article>

      {/* FAQ MANAGEMENT PANEL */}
      <article className="admin-panel">
        <h2>{editingFaqId ? "FAQ bewerken" : "FAQ toevoegen"}</h2>
        <form className="form-grid" onSubmit={handleSaveFaq}>
          <label>Vraag<input required value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} disabled={isPending} /></label>
          <label>Antwoord<textarea required value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} disabled={isPending} /></label>
          <label>Categorie<input value={faqCategory} onChange={(e) => setFaqCategory(e.target.value)} disabled={isPending} placeholder="bijv. Algemeen" /></label>
          <div className="field-row">
            <label>Volgorde<input type="number" value={faqOrder} onChange={(e) => setFaqOrder(Number(e.target.value))} disabled={isPending} /></label>
            <label>Status
              <select value={faqStatus} onChange={(e) => setFaqStatus(e.target.value as ContentStatus)} disabled={isPending} aria-label="FAQ status" title="FAQ status">
                <option value="draft">Concept</option>
                <option value="scheduled">Gepland</option>
                <option value="published">Gepubliceerd</option>
                <option value="archived">Gearchiveerd</option>
              </select>
            </label>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="button" type="submit" disabled={isPending}>Opslaan</button>
            {editingFaqId ? <button className="button ghost" type="button" onClick={resetFaqForm} disabled={isPending}>Annuleren</button> : null}
          </div>
        </form>

        <h3 style={{ marginTop: "2rem" }}>Geregistreerde FAQ&apos;s ({faqs.length})</h3>
        <div className="compact-list" style={{ marginTop: "1rem" }}>
          {faqs.map((faq) => (
            <div key={faq.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ maxWidth: "70%" }}>
                <strong>{faq.question}</strong>
                <p className="small-note">Categorie: {faq.category || "Algemeen"} · Volgorde: {faq.display_order}</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="text-link" onClick={() => editFaq(faq)} disabled={isPending}>Bewerk</button>
                <button type="button" className="text-link danger" onClick={() => handleDeleteFaq(faq.id)} disabled={isPending}>Verwijder</button>
              </div>
            </div>
          ))}
          {!faqs.length ? <p className="empty-state">Geen FAQ&apos;s in database.</p> : null}
        </div>
      </article>
    </div>
  );
}

function DocumentsManager({ legalDocuments = [] }: { legalDocuments?: LegalDocument[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  function editDoc(doc: LegalDocument) {
    setEditingId(doc.id);
    setTitle(doc.title);
    setSlug(doc.slug);
    setContent(doc.content);
    setIsVisible(doc.is_visible);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setIsVisible(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) return;
    setErrorMsg("");

    startTransition(async () => {
      const res = await saveLegalDocument(editingId, title, slug, content, isVisible);
      if (res.error) {
        setErrorMsg("Fout bij opslaan document: " + res.error);
      } else {
        resetForm();
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je dit document wilt verwijderen?")) return;
    setErrorMsg("");
    startTransition(async () => {
      const res = await deleteLegalDocument(id);
      if (res.error) {
        setErrorMsg("Fout bij verwijderen document: " + res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Sitebeheer</p>
          <h2>Documentatie & juridische documenten</h2>
          <p>Beheer hier live de Algemene Voorwaarden, Privacyverklaring en andere teksten voor de website.</p>
        </div>
      </div>

      {errorMsg ? <p className="notice error">{errorMsg}</p> : null}

      <div className="admin-grid wide">
        <article className="admin-panel">
          <h2>{editingId ? "Document bewerken" : "Document toevoegen"}</h2>
          <form className="form-grid" onSubmit={handleSave}>
            <label>Titel<input required value={title} onChange={(e) => setTitle(e.target.value)} disabled={isPending} placeholder="bijv. Algemene Voorwaarden" /></label>
            <label>Slug<input required value={slug} onChange={(e) => setSlug(e.target.value)} disabled={isPending} placeholder="bijv. algemene-voorwaarden" /></label>
            <label>Inhoud (Markdown / Tekst)<textarea style={{ minHeight: "250px" }} required value={content} onChange={(e) => setContent(e.target.value)} disabled={isPending} /></label>
            <label className="check-row">
              <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} disabled={isPending} />
              Document zichtbaar op de site
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="button" type="submit" disabled={isPending}>Opslaan</button>
              {editingId ? <button className="button ghost" type="button" onClick={resetForm} disabled={isPending}>Annuleren</button> : null}
            </div>
          </form>
        </article>

        <article className="admin-panel">
          <h2>Bestaande Documenten ({legalDocuments.length})</h2>
          <div className="compact-list" style={{ marginTop: "1rem" }}>
            {legalDocuments.map((doc) => (
              <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <strong>{doc.title}</strong>
                  <p className="small-note">Slug: /{doc.slug} · Status: {doc.is_visible ? "Zichtbaar" : "Onzichtbaar"}</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="text-link" onClick={() => editDoc(doc)} disabled={isPending}>Bewerk</button>
                  <button type="button" className="text-link danger" onClick={() => handleDelete(doc.id)} disabled={isPending}>Verwijder</button>
                </div>
              </div>
            ))}
            {!legalDocuments.length ? <p className="empty-state">Geen documenten in database.</p> : null}
          </div>
        </article>
      </div>
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
      <option value="draft">Concept</option>
      <option value="scheduled">Gepland</option>
      <option value="published">Gepubliceerd</option>
      <option value="archived">Gearchiveerd</option>
    </select>
  );
}

function episodeStatusLabel(value: string) {
  const labels: Record<string, string> = {
    archived: "Gearchiveerd",
    draft: "Concept",
    published: "Gepubliceerd",
    scheduled: "Gepland"
  };
  return labels[value] ?? value;
}

function transcriptStatusLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    failed: "Mislukt",
    missing: "Ontbreekt",
    processing: "Wordt verwerkt",
    ready: "Klaar"
  };
  return labels[value ?? ""] ?? "Onbekend";
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
