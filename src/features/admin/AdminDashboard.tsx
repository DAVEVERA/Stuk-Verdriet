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
  Package,
  ReceiptText,
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
import { archiveEpisode, archiveShopProduct, moderateCommunityReply, moderateInterviewComment, moderatePost, refreshEpisodeTranscript, resolveCommunityReport, saveEpisode, saveSeason, saveSectionDesignSettings, saveShopProduct, saveShopSettings, saveSiteSettings, startEpisodeTranscript } from "@/lib/actions";
import { addAdminUser, removeAdminUser, updateAdminUserRole, saveLegalDocument, deleteLegalDocument, saveFaq as saveFaqDb, deleteFaq as deleteFaqDb, saveHost as saveHostDb, deleteHost as deleteHostDb } from "@/lib/admin-operations";
import { encodeSiteDesignSettings, mergeSectionDesign, sectionDesignSections } from "@/lib/section-design";
import type {
  AdminCustomer,
  AdminLogisticsEvent,
  AdminOrder,
  AdminReturn,
  AdminReview,
  AdminServiceQuestion,
  PodcastEpisode,
  PodcastLinkCard,
  PodcastSeason,
  SectionDesignKey,
  SectionDesignSettings,
  ShopOrder,
  ShopProduct,
  ShopSettings,
  SiteDesignSettings,
  AdminUser,
  LegalDocument,
  FAQ,
  HostProfile,
  AdminUserRole,
  ContentStatus
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

type AdminDashboardProps = {
  episodes: PodcastEpisode[];
  seasons: PodcastSeason[];
  pendingPosts: AdminPost[];
  reports: AdminReport[];
  pendingInterviewComments: AdminInterviewComment[];
  analyticsRows: AdminAnalyticsRow[];
  analyticsSources: AdminAnalyticsSource[];
  shopProducts: ShopProduct[];
  shopOrders: ShopOrder[];
  shopSettings: ShopSettings;
  customers: AdminCustomer[];
  orders: AdminOrder[];
  returns: AdminReturn[];
  reviews: AdminReview[];
  logisticsEvents: AdminLogisticsEvent[];
  serviceQuestions: AdminServiceQuestion[];
  stripeConfigured: boolean;
  sectionDesign: SiteDesignSettings;
  missingSupabase?: boolean;
  localPreview?: boolean;
  savedMessage?: string | null;
  errorMessage?: string | null;
  initialTab?: string | null;
  adminUsers?: AdminUser[];
  legalDocuments?: LegalDocument[];
  faqs?: FAQ[];
  hosts?: HostProfile[];
};

export type AdminAnalyticsRow = {
  metric: string;
  value: string;
  detail: string;
  source: string;
};

export type AdminAnalyticsSource = {
  platform: string;
  state: string;
  owner: string;
  note: string;
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
  ["customers", "Klanten"],
  ["orders", "Orders"],
  ["returns", "Retouren"],
  ["logistics", "Logistiek"],
  ["service", "Service"],
  ["podcast", "Podcast"],
  ["reviews", "Inbox"],
  ["builder", "Sitebuilder"],
  ["access", "Beheerders"],
  ["keys", "Secrets"],
  ["calendar", "Kalender"],
  ["integrations", "Koppelingen"],
  ["ai", "AI hulp"],
  ["analytics", "Analytics"],
  ["shop", "Shop"],
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
    title: "Inbox",
    helper: "Aandacht en moderatie",
    ids: ["today", "reviews", "community"]
  },
  {
    title: "Operaties",
    helper: "Klanten, orders, retouren en service",
    ids: ["customers", "orders", "returns", "reviews", "logistics", "service"]
  },
  {
    title: "Podcast",
    helper: "Afleveringen en redactie",
    ids: ["podcast", "seasons", "hosts"]
  },
  {
    title: "Site",
    helper: "Pagina's en uitstraling",
    ids: ["builder", "sections", "site", "brand", "documents"]
  },
  {
    title: "Marketing",
    helper: "Planning en groei",
    ids: ["calendar", "ai", "analytics", "automation", "shop"]
  },
  {
    title: "Instellingen",
    helper: "Toegang en koppelingen",
    ids: ["access", "keys", "integrations"]
  }
];

const cardTypes: PodcastLinkCard["type"][] = ["link", "spotify", "podimo", "apple", "book", "donation"];

const feedbackLabels: Record<string, string> = {
  archived: "aflevering gearchiveerd",
  episode: "aflevering",
  faq: "FAQ",
  host: "host",
  season: "seizoen",
  "section-design": "sectie ontwerp",
  "section-design-save": "sectie ontwerp",
  "shop-product": "shop product",
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

const marketingItems = [
  { date: "2026-07-12", channel: "Instagram", title: "Quote uit interview omzetten naar carousel", status: "Concept" },
  { date: "2026-07-15", channel: "TikTok", title: "Korte podcastclip met ondertiteling", status: "AI tekst nodig" },
  { date: "2026-07-18", channel: "Facebook", title: "Communityvraag rond herinneren", status: "Review" },
  { date: "2026-07-22", channel: "Nieuwsbrief", title: "Nieuwe aflevering + steunbronnen", status: "Gepland" }
];

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
  analyticsRows,
  analyticsSources,
  shopProducts,
  shopOrders,
  shopSettings,
  customers,
  orders,
  returns,
  reviews,
  logisticsEvents,
  serviceQuestions,
  stripeConfigured,
  sectionDesign,
  missingSupabase,
  localPreview,
  savedMessage,
  errorMessage,
  initialTab,
  adminUsers = [],
  legalDocuments = [],
  faqs = [],
  hosts = []
}: AdminDashboardProps) {
  const safeInitialTab = tabs.some(([id]) => id === initialTab) ? (initialTab as AdminTabId) : "today";
  const [activeTab, setActiveTab] = useState<AdminTabId>(safeInitialTab);
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
    analytics: analyticsRows.length,
    shop: shopOrders.filter((order) => order.status === "pending").length
  };
  const tabMap = new Map<AdminTabId, (typeof tabs)[number]>(tabs.map((tab) => [tab[0], tab]));

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

      <AdminOperationsHeader
        episodes={episodes}
        missingSupabase={missingSupabase}
        localPreview={localPreview}
        pendingReviewCount={pendingReviewCount}
        missingMedia={missingMedia}
        failedTranscripts={failedTranscripts}
        scheduledEpisodes={scheduledEpisodes}
        onOpenTab={openTab}
      />

      <nav className="admin-navigation" aria-label="Admin onderdelen">
        {tabGroups.map((group) => (
          <section className="admin-nav-group" key={group.title} aria-label={group.title}>
            <div className="admin-nav-group-copy">
              <strong>{group.title}</strong>
              <small>{group.helper}</small>
            </div>
            <div className="admin-tabs" role="group" aria-label={group.title}>
              {group.ids.map((id) => tabMap.get(id)).filter((tab): tab is (typeof tabs)[number] => Boolean(tab)).map(renderTabButton)}
            </div>
          </section>
        ))}
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

      {activeTab === "reviews" ? <ReviewCenter pendingInterviewComments={pendingInterviewComments} pendingPosts={pendingPosts} reports={reports} operationsReviews={reviews} /> : null}
      {activeTab === "customers" ? <OperationsCenter title="Klanten" subtitle="Beheer klantprofielen, contactgegevens en volgorde van bestellingen" items={customers} type="customers" /> : null}
      {activeTab === "orders" ? <OperationsCenter title="Orders" subtitle="Volg open bestellingen, statuswijzigingen en betalingsfase" items={orders} type="orders" /> : null}
      {activeTab === "returns" ? <OperationsCenter title="Retouren" subtitle="Bekijk retourverzoeken en volg de afhandeling" items={returns} type="returns" /> : null}
      {activeTab === "logistics" ? <OperationsCenter title="Logistiek" subtitle="Beheer verzending, tracking en fulfilmentnotities" items={logisticsEvents} type="logistics" /> : null}
      {activeTab === "service" ? <OperationsCenter title="Service en klantvragen" subtitle="Volg vragen, meldingen en klantcontact" items={serviceQuestions} type="service" /> : null}
      {activeTab === "builder" ? <ElementorBuilder settings={sectionDesign} onOpenSections={() => setActiveTab("sections")} /> : null}
      {activeTab === "access" ? <AccessAndRoles adminUsers={adminUsers} /> : null}
      {activeTab === "keys" ? <ApiKeyVault missingSupabase={missingSupabase} /> : null}
      {activeTab === "calendar" ? <MarketingCalendar /> : null}
      {activeTab === "integrations" ? <IntegrationCenter analyticsSources={analyticsSources} /> : null}
      {activeTab === "ai" ? <AIStudio /> : null}
      {activeTab === "analytics" ? <AnalyticsCenter rows={analyticsRows} sources={analyticsSources} /> : null}
      {activeTab === "shop" ? <ShopCommerceCenter products={shopProducts} orders={shopOrders} settings={shopSettings} stripeConfigured={stripeConfigured} /> : null}
      {activeTab === "brand" ? <BrandLibrary /> : null}
      {activeTab === "automation" ? <AutomationHub /> : null}
      {activeTab === "community" ? <CommunityModeration pendingPosts={pendingPosts} reports={reports} /> : null}
      {activeTab === "site" ? <SiteSettingsForm /> : null}
      {activeTab === "sections" ? <SectionDesignEditor initialSettings={sectionDesign} /> : null}
      {activeTab === "hosts" ? <HostAndFaqForms faqs={faqs} hosts={hosts} /> : null}
      {activeTab === "documents" ? <DocumentsManager legalDocuments={legalDocuments} /> : null}
    </section>
  );
}

function AdminOperationsHeader({
  episodes,
  missingSupabase,
  localPreview,
  pendingReviewCount,
  missingMedia,
  failedTranscripts,
  scheduledEpisodes,
  onOpenTab
}: {
  episodes: PodcastEpisode[];
  missingSupabase?: boolean;
  localPreview?: boolean;
  pendingReviewCount: number;
  missingMedia: number;
  failedTranscripts: number;
  scheduledEpisodes: number;
  onOpenTab: (tab: AdminTabId) => void;
}) {
  const publishedEpisodes = episodes.filter((episode) => episode.status === "published").length;
  const draftEpisodes = episodes.filter((episode) => episode.status === "draft").length;
  const environmentLabel = missingSupabase ? "Demo data" : localPreview ? "Lokale preview" : "Live beheer";
  const environmentTone = missingSupabase || localPreview ? "warning" : "ready";

  return (
    <header className="admin-ops-header">
      <div className="admin-ops-copy">
        <p className="eyebrow">Beheercentrum</p>
        <h1>Wat moet er nu gebeuren?</h1>
        <p>
          Werk vanuit taken: publiceer podcastcontent, keur reacties goed en controleer of de live site klaarstaat.
          Setup-modules tonen voortaan duidelijk wat nog koppeling nodig heeft.
        </p>
      </div>
      <div className="admin-ops-status" aria-label="Beheerstatus">
        <span className={`admin-health-pill ${environmentTone}`}>
          {environmentTone === "ready" ? <CheckCircle2 size={16} aria-hidden /> : <ShieldCheck size={16} aria-hidden />}
          {environmentLabel}
        </span>
        <span>{publishedEpisodes} gepubliceerd</span>
        <span>{draftEpisodes} concepten</span>
        <span>{scheduledEpisodes} gepland</span>
      </div>
      <div className="admin-ops-actions" aria-label="Snelle acties">
        <button type="button" onClick={() => onOpenTab("reviews")}>
          <ClipboardCheck size={18} aria-hidden />
          <span>{pendingReviewCount}</span>
          Review inbox
        </button>
        <button type="button" onClick={() => onOpenTab("podcast")}>
          <ImagePlus size={18} aria-hidden />
          <span>{missingMedia}</span>
          Media aanvullen
        </button>
        <button type="button" onClick={() => onOpenTab("podcast")}>
          <Captions size={18} aria-hidden />
          <span>{failedTranscripts}</span>
          Transcripties
        </button>
      </div>
    </header>
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

function OperationsCenter({
  title,
  subtitle,
  items,
  type
}: {
  title: string;
  subtitle: string;
  items: unknown[];
  type: "customers" | "orders" | "returns" | "reviews" | "logistics" | "service";
}) {
  const rows = items.slice(0, 8);

  const renderItem = (item: unknown, index: number) => {
    if (type === "customers") {
      const customer = item as AdminCustomer;
      return (
        <div className="review-card" key={customer.id ?? index}>
          <div className="review-card-top">
            <span>{customer.status === "vip" ? "VIP" : customer.status === "needs_follow_up" ? "Volgen" : "Actief"}</span>
            <small>{customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString("nl-NL") : "Geen order"}</small>
          </div>
          <strong>{customer.name ?? customer.email ?? "Onbekende klant"}</strong>
          <p>{customer.email ?? "Geen e-mailadres"}</p>
          <small>{customer.order_count} order(s) · €{(customer.total_spent_cents / 100).toFixed(2)}</small>
        </div>
      );
    }

    if (type === "orders") {
      const order = item as AdminOrder;
      return (
        <div className="review-card" key={order.id ?? index}>
          <div className="review-card-top">
            <span>{order.status}</span>
            <small>{new Date(order.created_at).toLocaleDateString("nl-NL")}</small>
          </div>
          <strong>{order.id}</strong>
          <p>{order.customer_email ?? "Geen klant e-mailadres"}</p>
          <small>{order.total_cents / 100} {order.currency.toUpperCase()}</small>
        </div>
      );
    }

    if (type === "returns") {
      const returnItem = item as AdminReturn;
      return (
        <div className="review-card" key={returnItem.id ?? index}>
          <div className="review-card-top">
            <span>{returnItem.status}</span>
            <small>{new Date(returnItem.created_at).toLocaleDateString("nl-NL")}</small>
          </div>
          <strong>{returnItem.order_id}</strong>
          <p>{returnItem.reason ?? "Geen reden opgegeven"}</p>
          <small>{returnItem.customer_email ?? returnItem.customer_name ?? "Klant"}</small>
        </div>
      );
    }

    if (type === "reviews") {
      const review = item as AdminReview;
      return (
        <div className="review-card" key={review.id ?? index}>
          <div className="review-card-top">
            <span>{review.status}</span>
            <small>{new Date(review.created_at).toLocaleDateString("nl-NL")}</small>
          </div>
          <strong>{review.title ?? "Bekijk review"}</strong>
          <p>{review.body ?? "Geen tekst beschikbaar"}</p>
          <small>{review.customer_name ?? review.customer_email ?? "Klant"} · {review.rating}/5</small>
        </div>
      );
    }

    if (type === "logistics") {
      const event = item as AdminLogisticsEvent;
      return (
        <div className="review-card" key={event.id ?? index}>
          <div className="review-card-top">
            <span>{event.event_type}</span>
            <small>{new Date(event.created_at).toLocaleDateString("nl-NL")}</small>
          </div>
          <strong>{event.order_id}</strong>
          <p>{event.message ?? "Geen details beschikbaar"}</p>
          <small>{event.carrier ?? "Logistiek"} · {event.tracking_code ?? "Geen tracking"}</small>
        </div>
      );
    }

    const question = item as AdminServiceQuestion;
    return (
      <div className="review-card" key={question.id ?? index}>
        <div className="review-card-top">
          <span>{question.status}</span>
          <small>{new Date(question.created_at).toLocaleDateString("nl-NL")}</small>
        </div>
        <strong>{question.subject ?? "Klantenvraag"}</strong>
        <p>{question.message ?? "Geen details beschikbaar"}</p>
        <small>{question.customer_name ?? question.customer_email ?? "Klant"}</small>
      </div>
    );
  };

  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Operations</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="admin-grid wide">
        <article className="admin-panel">
          <h3>Live overzicht</h3>
          {rows.length ? <div className="review-board">{rows.map((item, index) => renderItem(item, index))}</div> : <p className="empty-state">Geen data beschikbaar voor deze module.</p>}
        </article>
        <article className="admin-panel">
          <h3>Workflow</h3>
          <div className="compact-list">
            <p>Gebruik deze module om klantencontact, orderafhandeling, retouren, reviews en servicevragen centraal te volgen.</p>
            <p>Alle data wordt uit de bestaande admincontext geladen; zodra de relevante Supabase-tabellen gevuld zijn, verschijnen ze automatisch hier.</p>
          </div>
        </article>
      </div>
    </div>
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
        <button className="button" type="button" onClick={() => onOpenTab(pendingPosts.length + pendingInterviewComments.length + reports.length ? "reviews" : "podcast")}>
          <ClipboardCheck size={17} aria-hidden /> Start met open taken
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
            <button type="button" onClick={() => onOpenTab("reviews")}><CheckCircle2 size={17} aria-hidden /> Beoordeel reacties en meldingen</button>
            <button type="button" onClick={() => onOpenTab("podcast")}><ImagePlus size={17} aria-hidden /> Vul audio, cover of transcriptie aan</button>
            <button type="button" onClick={() => onOpenTab("sections")}><LayoutTemplate size={17} aria-hidden /> Pas homepage-secties aan</button>
            <button type="button" onClick={() => onOpenTab("calendar")}><CalendarDays size={17} aria-hidden /> Bekijk marketingplanning</button>
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

function ReviewCenter({ pendingInterviewComments, pendingPosts, reports, operationsReviews }: { pendingInterviewComments: AdminInterviewComment[]; pendingPosts: AdminPost[]; reports: AdminReport[]; operationsReviews: AdminReview[] }) {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Review inbox</p>
          <h2>Af- en goedkeuren</h2>
          <p>Moderatie voor interviewcomments, community posts en open meldingen in een veilige reviewflow.</p>
        </div>
      </div>
      <div className="review-summary" aria-label="Review samenvatting">
        <span><strong>{pendingInterviewComments.length}</strong> interviewreacties</span>
        <span><strong>{pendingPosts.length}</strong> communityberichten</span>
        <span><strong>{reports.length}</strong> open meldingen</span>
      </div>
      <div className="review-board">
        <article className="admin-panel review-lane">
          <h3>Productreviews</h3>
          {operationsReviews.length ? operationsReviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-card-top">
                <span>{review.status}</span>
                <small>{new Date(review.created_at).toLocaleDateString("nl-NL")}</small>
              </div>
              <strong>{review.title ?? "Review"}</strong>
              <p>{review.body ?? "Geen tekst beschikbaar"}</p>
              <small>{review.customer_name ?? review.customer_email ?? "Klant"} · {review.rating}/5</small>
            </div>
          )) : <p className="empty-state">Geen productreviews beschikbaar.</p>}
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

function AccessAndRoles({ adminUsers = [] }: { adminUsers?: AdminUser[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<AdminUserRole>("admin");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;
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
                disabled={isPending}
              />
            </label>
            <label>
              Rol
              <select 
                value={roleInput} 
                onChange={(e) => setRoleInput(e.target.value as AdminUserRole)}
                disabled={isPending}
                aria-label="Selecteer rol"
                title="Selecteer rol"
              >
                <option value="super_admin">Super Admin (Eigenaar)</option>
                <option value="admin">Admin (Redacteur)</option>
                <option value="editor">Editor (Inhoud)</option>
                <option value="moderator">Moderator (Community)</option>
              </select>
            </label>
            <button className="button" type="submit" disabled={isPending}>
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
                    disabled={isPending}
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
                    disabled={isPending}
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            ))}
            {!adminUsers.length ? (
              <p className="empty-state">Geen database beheerders geconfigureerd.</p>
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

function MarketingCalendar() {
  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Marketing</p>
          <h2>Marketingkalender</h2>
          <p>Plan campagnes per kanaal, laat AI captions schrijven en routeer goedgekeurde items naar Make.</p>
        </div>
        <button className="button ghost" type="button" disabled><Plus size={17} aria-hidden /> Planning volgt</button>
      </div>
      <ModuleReadiness state="Roadmap" detail="Deze kalender is een planningsoverzicht. Live toevoegen vereist nog een marketing_items tabel en server action." />
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
      <ModuleReadiness state="Roadmap" detail="AI-acties zijn nog niet gekoppeld aan server-side generatie. Gebruik dit als prompt- en tone-of-voice ontwerp." />
      <div className="ai-workbench">
        <article className="admin-panel">
          <h3><WandSparkles size={18} aria-hidden /> Tekstschrijver</h3>
          <textarea defaultValue="Schrijf een warme Instagram-caption over een nieuw interview, zonder te zwaar te worden." />
          <button className="button ghost" type="button" disabled><Sparkles size={17} aria-hidden /> Nog niet gekoppeld</button>
        </article>
        <article className="admin-panel">
          <h3><ImageIcon size={18} aria-hidden /> Nano Banana beelden</h3>
          <textarea defaultValue="Maak een serene social visual met vlinder, zachte natuur en ruimte voor echte HTML tekst." />
          <button className="button ghost" type="button" disabled><ImagePlus size={17} aria-hidden /> Nog niet gekoppeld</button>
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

function ShopCommerceCenter({ products, orders, settings, stripeConfigured }: { products: ShopProduct[]; orders: ShopOrder[]; settings: ShopSettings; stripeConfigured: boolean }) {
  const publishedProducts = products.filter((product) => product.status === "published").length;
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const paidOrders = orders.filter((order) => order.status === "paid" || order.status === "fulfilled").length;

  return (
    <div className="admin-module">
      <div className="admin-module-hero">
        <div>
          <p className="eyebrow">Ecommerce</p>
          <h2>Shop beheer</h2>
          <p>Producten, voorraad, Stripe-koppeling en orders voor de Stuk Verdriet shop.</p>
        </div>
        <Package aria-hidden />
      </div>
      <ModuleReadiness
        state={stripeConfigured ? "Stripe secret aanwezig" : "Stripe setup nodig"}
        detail="Checkout gebruikt server-side STRIPE_SECRET_KEY. Webhook-afhandeling voor betaalstatussen is de volgende productieslice."
      />

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card static">
          <Package size={20} aria-hidden />
          <strong>{products.length}</strong>
          <span>Producten</span>
          <small>{publishedProducts} gepubliceerd</small>
        </article>
        <article className="admin-kpi-card static">
          <ReceiptText size={20} aria-hidden />
          <strong>{orders.length}</strong>
          <span>Orders</span>
          <small>{pendingOrders} pending, {paidOrders} betaald/afgerond</small>
        </article>
      </div>

      <div className="admin-grid wide">
        <AdminForm title="Shoptekst en servicepunten" action={saveShopSettings}>
          <input type="hidden" name="return_tab" value="shop" readOnly />
          <label>Eyebrow<input name="eyebrow" defaultValue={settings.eyebrow} /></label>
          <label>Titel<input name="title" required defaultValue={settings.title} /></label>
          <label>Intro<textarea name="intro" required defaultValue={settings.intro} /></label>
          <label>Servicepunten<textarea name="service_points" defaultValue={settings.service_points.join("\n")} /></label>
          <label>Checkout-notitie<textarea name="checkout_note" defaultValue={settings.checkout_note ?? ""} /></label>
          <button className="button" type="submit"><Save size={17} aria-hidden /> Shoptekst opslaan</button>
        </AdminForm>

        <AdminForm title="Nieuw product" action={saveShopProduct}>
          <input type="hidden" name="return_tab" value="shop" readOnly />
          <label>Titel<input name="title" required /></label>
          <label>Slug<input name="slug" placeholder="wordt automatisch gemaakt als leeg" /></label>
          <label>Korte omschrijving<input name="short_description" /></label>
          <label>Omschrijving<textarea name="description" /></label>
          <div className="field-row">
            <label>Prijs<input name="price" inputMode="decimal" required placeholder="14,95" /></label>
            <label>Valuta<input name="currency" defaultValue="eur" maxLength={3} /></label>
          </div>
          <div className="field-row">
            <label>Voorraad<input name="inventory_count" type="number" min="0" /></label>
            <label>Volgorde<input name="sort_order" type="number" defaultValue="100" /></label>
          </div>
          <label>Afbeelding URL<input name="image_url" /></label>
          <label className="upload-field">
            <ImagePlus aria-hidden />
            <span>Productafbeelding uploaden</span>
            <input name="image_file" type="file" accept="image/*" />
          </label>
          <label>Stripe Price ID<input name="stripe_price_id" placeholder="price_..." /></label>
          <label>Stripe Product ID<input name="stripe_product_id" placeholder="prod_..." /></label>
          <div className="field-row">
            <label>Status<ShopStatusSelect defaultValue="draft" /></label>
            <label className="check-row"><input name="featured" type="checkbox" /> Uitgelicht</label>
          </div>
          <button className="button" type="submit"><Save size={17} aria-hidden /> Product opslaan</button>
        </AdminForm>
      </div>

      <article className="admin-panel">
        <h2>Producten bewerken</h2>
        <div className="shop-admin-product-list">
          {products.map((product) => <ShopProductAdminForm product={product} key={product.id} />)}
          {!products.length ? <p className="empty-state">Nog geen shopproducten.</p> : null}
        </div>
      </article>

      <article className="admin-panel">
        <h2>Recente orders</h2>
        <div className="admin-table-card">
          {orders.map((order) => (
            <div className="admin-table-row" key={order.id}>
              <strong>{formatAdminPrice(order.total_cents, order.currency)}</strong>
              <span>{order.status}</span>
              <span>{order.customer_email ?? "Geen e-mail"}</span>
              <small>{new Date(order.created_at).toLocaleString("nl-NL")}</small>
            </div>
          ))}
          {!orders.length ? <p className="empty-state">Nog geen orders. Zodra checkout actief is verschijnen ze hier.</p> : null}
        </div>
      </article>
    </div>
  );
}

function ShopProductAdminForm({ product }: { product: ShopProduct }) {
  return (
    <form className="shop-admin-product-form" action={saveShopProduct}>
      <input type="hidden" name="id" defaultValue={product.id} />
      <input type="hidden" name="return_tab" value="shop" readOnly />
      <div className="shop-admin-product-form-head">
        <div>
          <strong>{product.title}</strong>
          <small>{formatAdminPrice(product.price_cents, product.currency)} - {product.status}</small>
        </div>
        {product.status !== "archived" ? (
          <button className="text-link danger" type="submit" formAction={archiveShopProduct.bind(null, product.id)}>Archiveer</button>
        ) : null}
      </div>
      <div className="form-grid">
        <label>Titel<input name="title" required defaultValue={product.title} /></label>
        <label>Slug<input name="slug" defaultValue={product.slug} /></label>
        <label>Korte omschrijving<input name="short_description" defaultValue={product.short_description ?? ""} /></label>
        <label>Omschrijving<textarea name="description" defaultValue={product.description ?? ""} /></label>
        <div className="field-row">
          <label>Prijs<input name="price" inputMode="decimal" required defaultValue={String(product.price_cents / 100).replace(".", ",")} /></label>
          <label>Valuta<input name="currency" defaultValue={product.currency} maxLength={3} /></label>
        </div>
        <div className="field-row">
          <label>Voorraad<input name="inventory_count" type="number" min="0" defaultValue={product.inventory_count ?? ""} /></label>
          <label>Volgorde<input name="sort_order" type="number" defaultValue={product.sort_order} /></label>
        </div>
        <label>Afbeelding URL<input name="image_url" defaultValue={product.image_url ?? ""} /></label>
        <label>Stripe Price ID<input name="stripe_price_id" defaultValue={product.stripe_price_id ?? ""} /></label>
        <label>Stripe Product ID<input name="stripe_product_id" defaultValue={product.stripe_product_id ?? ""} /></label>
        <div className="field-row">
          <label>Status<ShopStatusSelect defaultValue={product.status} /></label>
          <label className="check-row"><input name="featured" type="checkbox" defaultChecked={product.featured} /> Uitgelicht</label>
        </div>
        <button className="button" type="submit"><Save size={17} aria-hidden /> Wijzigingen opslaan</button>
      </div>
    </form>
  );
}

function formatAdminPrice(priceCents: number, currency = "eur") {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(priceCents / 100);
}

function ShopStatusSelect({ defaultValue = "draft" }: { defaultValue?: string }) {
  return (
    <select name="status" defaultValue={defaultValue} aria-label="Shop productstatus" title="Shop productstatus">
      <option value="draft">Concept</option>
      <option value="published">Gepubliceerd</option>
      <option value="archived">Gearchiveerd</option>
    </select>
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

function SiteSettingsForm() {
  return (
    <AdminForm title="Site instellingen" action={saveSiteSettings}>
      <input type="hidden" name="return_tab" value="site" readOnly />
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
