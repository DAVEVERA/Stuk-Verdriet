import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Camera,
  ImagePlus,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Newspaper,
  UserPlus,
  Users
} from "lucide-react";
import {
  addCommunityProfilePhoto,
  createCommunityProfileAlbum,
  createCommunityProfileEvent,
  deleteCommunityConnection,
  deleteCommunityProfilePhoto,
  deleteCommunityProfileEvent,
  deleteCommunityPulseMoment,
  respondToCommunityFriendRequest,
  sendCommunityFriendRequest,
  signOut,
  updateCommunityProfileInfo,
  updateCommunityProfileMedia,
  updateCommunityProfilePhoto,
  updateCommunityProfileEvent
} from "@/lib/actions";
import { CommunityInviteTools } from "@/components/CommunityInviteTools";
import { PulseMomentDesigner } from "@/components/PulseMomentDesigner";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";
import type {
  CommunityFriendship,
  CommunityPost,
  CommunityProfile,
  CommunityProfileAlbum,
  CommunityProfileEvent,
  CommunityProfilePhoto,
  CommunityPulseMoment,
  CommunityReply
} from "@/types/content";

export const dynamic = "force-dynamic";

type ProfileTab = "all" | "info" | "activity" | "pulse" | "photos" | "events" | "friends";
type ConnectionsTab = "connections" | "requests" | "moments" | "find";

type CommunityProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    profile?: string;
    tab?: string;
    friends?: string;
    connections?: string;
    q?: string;
    events?: string;
  }>;
};

const profileMessages: Record<string, string> = {
  avatar: "Kies een jpg, png of webp van maximaal 3 MB.",
  cover: "Kies een jpg, png of webp van maximaal 5 MB.",
  photo: "Kies een geldige foto van maximaal 4 MB.",
  album: "Dit album kon niet worden opgeslagen of gevonden.",
  event: "Vul voor het moment minimaal een titel en datum in.",
  friend: "Dit verbindingsverzoek kon niet worden verwerkt.",
  connection: "Dit verbindingsverzoek kon niet worden verwerkt.",
  pulse: "Dit Aan de Pols moment kon niet worden opgeslagen.",
  invalid: "Je sessie kon niet veilig worden gecontroleerd. Vernieuw de pagina en probeer opnieuw.",
  "profile-email": "Vul een geldig e-mailadres in.",
  "profile-media-empty": "Kies eerst een foto om te uploaden.",
  "profile-storage": "Opslaan lukt nu niet. Probeer het straks opnieuw.",
  "profile-name": "Vul een naam in van maximaal 80 tekens.",
  "community-avatars": "De profielfoto kon niet worden opgeslagen.",
  "community-profile-media": "De foto kon niet worden opgeslagen."
};

const successMessages: Record<string, string> = {
  saved: "Je profiel is opgeslagen.",
  "media-saved": "Je profielafbeelding is bijgewerkt.",
  "info-saved": "Je profielinformatie is opgeslagen.",
  "photo-saved": "De foto staat nu in je profiel.",
  "photo-updated": "De foto is bijgewerkt.",
  "photo-deleted": "De foto is verwijderd.",
  "album-saved": "Het album is aangemaakt.",
  "event-saved": "Het moment is toegevoegd.",
  "moment-saved": "Het moment is toegevoegd.",
  "moment-updated": "Het moment is bijgewerkt.",
  "moment-deleted": "Moment verwijderd.",
  "friend-requested": "Verbindingsverzoek verstuurd.",
  "friend-accepted": "Jullie hebben elkaar gevonden.",
  "friend-declined": "Het verzoek is verwijderd.",
  "connection-requested": "Verbindingsverzoek verstuurd.",
  "connection-accepted": "Jullie hebben elkaar gevonden.",
  "connection-declined": "Het verzoek is verwijderd.",
  "connection-removed": "Verbinding verbroken.",
  "pulse-saved": "Er is een nieuw moment gedeeld.",
  "pulse-ai-requested": "Je ontwerpaanvraag is bewaard.",
  "pulse-deleted": "Moment verwijderd.",
  "pulse-reacted": "Dit raakte mij is opgeslagen.",
  "pulse-saved-bookmark": "Moment bewaard."
};

const profileTabs: Array<{ id: ProfileTab; label: string }> = [
  { id: "all", label: "Alles" },
  { id: "info", label: "Info" },
  { id: "activity", label: "Bijdragen" },
  { id: "pulse", label: "Aan de Pols" },
  { id: "photos", label: "Foto's" },
  { id: "events", label: "Momenten" },
  { id: "friends", label: "Verbindingen" }
];

const connectionsTabs: Array<{ id: ConnectionsTab; label: string }> = [
  { id: "connections", label: "Verbindingen" },
  { id: "requests", label: "Verbindingsverzoeken" },
  { id: "moments", label: "Momenten" },
  { id: "find", label: "Vind mensen" }
];

type CommunityProfileReply = CommunityReply & {
  community_posts?: { title: string; slug: string } | Array<{ title: string; slug: string }> | null;
};

const communityStatusLabels = {
  pending: "Wordt op richtlijnen gecontroleerd",
  rejected: "Niet gepubliceerd",
  archived: "Niet gepubliceerd",
  approved: "Goedgekeurd en geplaatst"
} as const;

function isProfileTab(value: string | undefined): value is ProfileTab {
  return profileTabs.some((tab) => tab.id === value);
}

function normalizeProfileTab(value: string | undefined): ProfileTab {
  if (value === "reels") return "pulse";
  return isProfileTab(value) ? value : "all";
}

function normalizeConnectionsTab(value: string | undefined): ConnectionsTab {
  if (value === "friends") return "connections";
  if (value === "birthdays") return "moments";
  return connectionsTabs.some((tab) => tab.id === value) ? value as ConnectionsTab : "connections";
}

function profileHref(tab: ProfileTab, extra?: string | Record<string, string | undefined>) {
  const query = new URLSearchParams({ tab });
  if (typeof extra === "string") {
    const [key, value] = extra.split("=");
    if (key && value) query.set(key, value);
  } else if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
  }
  return `/community/profiel?${query.toString()}`;
}

function ProfilePicture({ profile, displayName, size = "large" }: { profile: CommunityProfile | null; displayName: string; size?: "large" | "small" }) {
  const avatarUrl = profile?.avatar_url ?? null;
  const initials = displayName.slice(0, 1).toUpperCase();
  return (
    <span className={`community-profile-photo ${size === "small" ? "is-small" : ""}`}>
      {avatarUrl ? (
        <Image src={avatarUrl} alt={`Profielfoto van ${displayName}`} fill sizes={size === "small" ? "72px" : "(max-width: 520px) 112px, 156px"} />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}

function PersonRow({ profile, action, description }: { profile: CommunityProfile; action?: React.ReactNode; description?: string }) {
  return (
    <div className="community-profile-person">
      <ProfilePicture profile={profile} displayName={profile.display_name} size="small" />
      <div>
        <strong>{profile.display_name}</strong>
        <span>{description || profile.bio || profile.profile_details?.category || "Lid van SNAAR"}</span>
      </div>
      {action ?? <button className="community-icon-button" type="button" aria-label={`Meer opties voor ${profile.display_name}`}><MoreHorizontal size={20} /></button>}
    </div>
  );
}

function ProfilePhotosSection({ photos, albums, profile, displayName, compact = false }: {
  photos: CommunityProfilePhoto[];
  albums: CommunityProfileAlbum[];
  profile: CommunityProfile | null;
  displayName: string;
  compact?: boolean;
}) {
  const albumById = new Map(albums.map((album) => [album.id, album]));
  type ProfileMediaItem = CommunityProfilePhoto & { system?: boolean };
  const media: ProfileMediaItem[] = [
    ...(profile?.avatar_url ? [{ id: "avatar", user_id: profile.user_id, image_url: profile.avatar_url, caption: "Profielfoto", alt_text: `Profielfoto van ${displayName}`, album_id: null, visibility: "community" as const, status: "active" as const, display_order: -2, created_at: profile.updated_at ?? new Date(0).toISOString(), system: true }] : []),
    ...(profile?.cover_url ? [{ id: "cover", user_id: profile.user_id, image_url: profile.cover_url, caption: "Omslagfoto", alt_text: `Omslagfoto van ${displayName}`, album_id: null, visibility: "community" as const, status: "active" as const, display_order: -1, created_at: profile.updated_at ?? new Date(0).toISOString(), system: true }] : []),
    ...photos
  ];
  const visibleMedia = compact ? media.slice(0, 6) : media;
  return (
    <section className="community-profile-section" id="fotos">
      <header className="community-profile-section-header">
        <div>
          <p className="eyebrow">Jouw profiel</p>
          <h2>Foto&apos;s</h2>
        </div>
        <details className="community-profile-action-menu">
          <summary><ImagePlus size={18} /> Foto toevoegen</summary>
          <form action={addCommunityProfilePhoto} encType="multipart/form-data">
            <input type="hidden" name="return_to" value={profileHref("photos")} readOnly />
            <label>Foto<input name="photo_file" type="file" accept="image/png,image/jpeg,image/webp" required /></label>
            <label>Bijschrift<input name="caption" maxLength={180} placeholder={`Vertel iets over deze foto van ${displayName}`} /></label>
            <label>Alt-tekst<input name="alt_text" maxLength={180} placeholder="Beschrijf wat op de foto staat" /></label>
            <label>Album<select name="album_id" defaultValue=""><option value="">Geen album</option>{albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}</select></label>
            <label>Zichtbaarheid<select name="visibility" defaultValue="connections"><option value="private">Alleen ik</option><option value="connections">Alleen verbindingen</option><option value="community">Hele community</option></select></label>
            <button className="community-panel-button" type="submit">Foto plaatsen</button>
          </form>
        </details>
      </header>
      <nav className="community-profile-subnav" aria-label="Foto onderdelen">
        <Link className="active" href={profileHref("photos")}>Jouw foto&apos;s</Link>
        <a href="#foto-albums">Albums</a>
        <a href="#foto-beheer">Beheer</a>
      </nav>
      <div className="community-profile-album-create" id="foto-albums">
        <div>
          <h3>Albums</h3>
          <span>Bundel foto&apos;s per herinnering, periode of onderwerp.</span>
        </div>
        <details className="community-profile-action-menu">
          <summary>Album aanmaken</summary>
          <form action={createCommunityProfileAlbum}>
            <input type="hidden" name="return_to" value={profileHref("photos")} readOnly />
            <label>Albumnaam<input name="title" maxLength={80} required placeholder="Bijvoorbeeld herinneringen thuis" /></label>
            <label>Omschrijving<textarea name="description" maxLength={300} rows={3} /></label>
            <label>Zichtbaarheid<select name="visibility" defaultValue="connections"><option value="private">Alleen ik</option><option value="connections">Alleen verbindingen</option><option value="community">Hele community</option></select></label>
            <button className="community-panel-button" type="submit">Album opslaan</button>
          </form>
        </details>
      </div>
      {albums.length ? (
        <div className="community-profile-album-grid">
          {albums.map((album) => {
            const count = photos.filter((photo) => photo.album_id === album.id).length;
            return (
              <article key={album.id}>
                <strong>{album.title}</strong>
                <span>{count} {count === 1 ? "foto" : "foto's"} · {visibilityLabel(album.visibility)}</span>
                {album.description ? <p>{album.description}</p> : null}
              </article>
            );
          })}
        </div>
      ) : null}
      {visibleMedia.length ? (
        <div className="community-profile-photo-grid" id="foto-beheer">
          {visibleMedia.map((photo) => (
            <figure key={photo.id}>
              <span className="community-profile-photo-frame">
                <Image src={photo.image_url} alt={photo.alt_text || photo.caption || `Foto van ${displayName}`} fill sizes="(max-width: 520px) 50vw, (max-width: 900px) 33vw, 220px" />
              </span>
              <figcaption>
                <strong>{photo.caption || "Foto zonder bijschrift"}</strong>
                <span>{albumById.get(photo.album_id ?? "")?.title ?? "Geen album"} · {visibilityLabel(photo.visibility ?? "connections")}</span>
              </figcaption>
              {"system" in photo && photo.system ? null : (
                <details className="community-profile-photo-edit">
                  <summary>Bewerken</summary>
                  <form action={updateCommunityProfilePhoto}>
                    <input type="hidden" name="return_to" value={profileHref("photos")} readOnly />
                    <input type="hidden" name="photo_id" value={photo.id} readOnly />
                    <label>Bijschrift<input name="caption" maxLength={180} defaultValue={photo.caption ?? ""} /></label>
                    <label>Alt-tekst<input name="alt_text" maxLength={180} defaultValue={photo.alt_text ?? ""} /></label>
                    <label>Album<select name="album_id" defaultValue={photo.album_id ?? ""}><option value="">Geen album</option>{albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}</select></label>
                    <label>Zichtbaarheid<select name="visibility" defaultValue={photo.visibility ?? "connections"}><option value="private">Alleen ik</option><option value="connections">Alleen verbindingen</option><option value="community">Hele community</option></select></label>
                    <label>Status<select name="status" defaultValue={photo.status ?? "active"}><option value="active">Zichtbaar</option><option value="hidden">Verborgen</option><option value="archived">Gearchiveerd</option></select></label>
                    <button className="community-panel-button" type="submit">Foto opslaan</button>
                  </form>
                  <form action={deleteCommunityProfilePhoto}>
                    <input type="hidden" name="return_to" value={profileHref("photos")} readOnly />
                    <input type="hidden" name="photo_id" value={photo.id} readOnly />
                    <button className="text-link" type="submit">Foto verwijderen</button>
                  </form>
                </details>
              )}
            </figure>
          ))}
        </div>
      ) : (
        <div className="community-profile-empty"><ImagePlus size={26} /><strong>Nog geen foto&apos;s</strong><span>Voeg je eerste foto toe aan je profiel.</span></div>
      )}
      {compact && media.length > visibleMedia.length ? <Link className="community-profile-more" href={profileHref("photos")}>Alle foto&apos;s bekijken</Link> : null}
    </section>
  );
}

function visibilityLabel(value: string) {
  if (value === "private") return "Alleen ik";
  if (value === "community") return "Community";
  return "Verbindingen";
}

type ProfileMoment = CommunityProfileEvent & {
  owner?: CommunityProfile | null;
};

function ProfileEventsSection({ events, filter, compact = false }: { events: ProfileMoment[]; filter: "upcoming" | "past"; compact?: boolean }) {
  // This dynamic Server Component intentionally evaluates event state at request time.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const filtered = events
    .filter((event) => filter === "past" ? Date.parse(event.starts_at) < now : Date.parse(event.starts_at) >= now)
    .slice(0, compact ? 2 : 12);
  const formatter = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <section className="community-profile-section" id="momenten">
      <header className="community-profile-section-header">
        <div>
          <p className="eyebrow">Mijn momenten</p>
          <h2>Momenten</h2>
          <span>{events.length} {events.length === 1 ? "moment" : "momenten"}</span>
          <span>Sommige dagen blijven bij je. Leg hier de momenten vast die je wilt herinneren, op jouw manier en om jouw reden.</span>
        </div>
        <details className="community-profile-action-menu">
          <summary><CalendarDays size={18} /> Moment toevoegen</summary>
          <form action={createCommunityProfileEvent} encType="multipart/form-data">
            <input type="hidden" name="return_to" value={profileHref("events", `events=${filter}`)} readOnly />
            <label>Moment<input name="title" maxLength={120} placeholder="Bijvoorbeeld: Eva's dag" required /></label>
            <label>Welke datum wil je onthouden?<input name="starts_at" type="datetime-local" required /></label>
            <label>Eindmoment, als dat relevant is<input name="ends_at" type="datetime-local" /></label>
            <label>Plek of context<input name="location" maxLength={140} /></label>
            <label>Bewaar dagen die voor jou betekenis hebben<textarea name="description" maxLength={1000} rows={3} /></label>
            <label>Afbeelding<input name="event_image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
            <label>Zichtbaarheid<select name="visibility" defaultValue="connections"><option value="private">Alleen ik</option><option value="connections">Alleen verbindingen</option><option value="community">Hele community</option></select></label>
            <label className="community-checkbox-row"><input name="remind_me" type="checkbox" defaultChecked />Herinner mij aan dit moment</label>
            <label>Herinneringsnotitie<textarea name="reminder_note" maxLength={300} rows={2} placeholder="Wat wil je op die dag niet vergeten?" /></label>
            <button className="community-panel-button" type="submit">Moment toevoegen</button>
          </form>
        </details>
      </header>
      <nav className="community-profile-subnav" aria-label="Moment filters">
        <Link className={filter === "upcoming" ? "active" : ""} href={profileHref("events", "events=upcoming")}>Aankomend</Link>
        <Link className={filter === "past" ? "active" : ""} href={profileHref("events", "events=past")}>Eerder</Link>
      </nav>
      {filtered.length ? (
        <div className="community-profile-event-grid">
          {filtered.map((event) => (
            <article key={event.id}>
              {event.image_url ? <span className="community-profile-event-image"><Image src={event.image_url} alt="" fill sizes="120px" /></span> : <span className="community-profile-event-date"><strong>{new Date(event.starts_at).getDate()}</strong><small>{new Date(event.starts_at).toLocaleDateString("nl-NL", { month: "short" })}</small></span>}
              <div>
                <time dateTime={event.starts_at}>{formatter.format(new Date(event.starts_at))}</time>
                <h3>{event.title}</h3>
                {event.owner ? <p><Users size={15} /> {event.owner.display_name}</p> : null}
                {event.location ? <p><MapPin size={15} /> {event.location}</p> : null}
                <p>{visibilityLabel(event.visibility ?? "connections")}{event.reminder_enabled ? " · herinnering aan" : ""}</p>
                {event.reminder_note ? <p>{event.reminder_note}</p> : null}
              </div>
              {!event.owner ? (
                <details className="community-profile-event-edit">
                  <summary>Moment bewerken</summary>
                  <form action={updateCommunityProfileEvent} encType="multipart/form-data">
                    <input type="hidden" name="return_to" value={profileHref("events", `events=${filter}`)} readOnly />
                    <input type="hidden" name="event_id" value={event.id} readOnly />
                    <input type="hidden" name="existing_image_url" value={event.image_url ?? ""} readOnly />
                    <label>Moment<input name="title" maxLength={120} defaultValue={event.title} required /></label>
                    <label>Start<input name="starts_at" type="datetime-local" defaultValue={toDateTimeLocal(event.starts_at)} required /></label>
                    <label>Einde<input name="ends_at" type="datetime-local" defaultValue={event.ends_at ? toDateTimeLocal(event.ends_at) : ""} /></label>
                    <label>Plek of context<input name="location" maxLength={140} defaultValue={event.location ?? ""} /></label>
                    <label>Betekenis<textarea name="description" maxLength={1000} rows={3} defaultValue={event.description ?? ""} /></label>
                    <label>Nieuwe afbeelding<input name="event_image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
                    <label>Zichtbaarheid<select name="visibility" defaultValue={event.visibility ?? "connections"}><option value="private">Alleen ik</option><option value="connections">Alleen verbindingen</option><option value="community">Hele community</option></select></label>
                    <label>Status<select name="status" defaultValue={event.status ?? "active"}><option value="active">Actief</option><option value="archived">Archiveren</option></select></label>
                    <label className="community-checkbox-row"><input name="remind_me" type="checkbox" defaultChecked={event.reminder_enabled ?? false} />Herinner mij aan dit moment</label>
                    <label>Herinneringsnotitie<textarea name="reminder_note" maxLength={300} rows={2} defaultValue={event.reminder_note ?? ""} /></label>
                    <button className="community-panel-button" type="submit">Moment opslaan</button>
                  </form>
                  <form action={deleteCommunityProfileEvent}>
                    <input type="hidden" name="return_to" value={profileHref("events", `events=${filter}`)} readOnly />
                    <input type="hidden" name="event_id" value={event.id} readOnly />
                    <button className="text-link" type="submit">Moment verwijderen</button>
                  </form>
                </details>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="community-profile-empty"><CalendarDays size={26} /><strong>Je hebt nog geen momenten toegevoegd</strong><span>Er komt een bijzonder moment aan zodra jij of een verbinding een datum vastlegt.</span></div>
      )}
    </section>
  );
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function ProfileConnectionsSection({
  activeTab,
  connections,
  incoming,
  acceptedConnections,
  outgoingIds,
  suggestions,
  connectionMoments,
  searchQuery,
  profilesById,
  compact = false
}: {
  activeTab: ConnectionsTab;
  connections: CommunityProfile[];
  incoming: CommunityFriendship[];
  acceptedConnections: CommunityFriendship[];
  outgoingIds: Set<string>;
  suggestions: CommunityProfile[];
  connectionMoments: ProfileMoment[];
  searchQuery: string;
  profilesById: Map<string, CommunityProfile>;
  compact?: boolean;
}) {
  const connectionByProfileId = new Map<string, CommunityFriendship>();
  acceptedConnections.forEach((item) => {
    connectionByProfileId.set(item.requester_id, item);
    connectionByProfileId.set(item.addressee_id, item);
  });
  const query = searchQuery.trim();
  const visibleSuggestions = query
    ? suggestions.filter((person) => {
        const haystack = [
          person.display_name,
          person.bio,
          person.profile_details?.current_city,
          person.profile_details?.category
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : suggestions.slice(0, 6);
  return (
    <section className="community-profile-section" id="verbindingen">
      <header className="community-profile-section-header">
        <div><p className="eyebrow">Jouw netwerk</p><h2>Verbindingen</h2><span>{connections.length} {connections.length === 1 ? "verbinding" : "verbindingen"}</span></div>
        <Link className="community-profile-header-link" href={profileHref("friends", { connections: "requests" })}>Verbindingsverzoeken{incoming.length ? ` (${incoming.length})` : ""}</Link>
      </header>
      <nav className="community-profile-subnav is-scrollable" aria-label="Verbindingen onderdelen">
        {connectionsTabs.map((tab) => <Link key={tab.id} className={activeTab === tab.id ? "active" : ""} href={profileHref("friends", { connections: tab.id })}>{tab.label}</Link>)}
      </nav>

      {activeTab === "requests" ? (
        <div className="community-profile-people-grid">
          {incoming.map((request) => {
            const person = profilesById.get(request.requester_id);
            if (!person) return null;
            return <PersonRow key={request.id} profile={person} description={`${person.display_name} wil verbinding met je maken`} action={
              <form className="community-friend-response" action={respondToCommunityFriendRequest}>
                <input type="hidden" name="return_to" value={profileHref("friends", { connections: "requests" })} readOnly />
                <input type="hidden" name="friendship_id" value={request.id} readOnly />
                <button name="response" value="accepted" type="submit">Verbinding accepteren</button>
                <button className="text-link" name="response" value="declined" type="submit">Verzoek verwijderen</button>
              </form>
            } />;
          })}
          {!incoming.length ? <div className="community-profile-empty"><UserPlus size={26} /><strong>Geen openstaande verbindingsverzoeken</strong><span>Nieuwe verzoeken verschijnen hier.</span></div> : null}
        </div>
      ) : activeTab === "find" ? (
        <div className="community-profile-suggestions">
          <CommunityInviteTools />
          <form className="community-profile-search" action="/community/profiel">
            <input type="hidden" name="tab" value="friends" readOnly />
            <input type="hidden" name="connections" value="find" readOnly />
            <label>Vind mensen<input name="q" defaultValue={query} placeholder="Zoek op naam, plaats of woorden in het profiel" /></label>
            <button className="community-panel-button" type="submit">Zoeken</button>
          </form>
          <div className="community-profile-people-grid">
            {visibleSuggestions.map((person) => (
              <PersonRow key={person.user_id} profile={person} action={
                <form action={sendCommunityFriendRequest}>
                  <input type="hidden" name="return_to" value={profileHref("friends", { connections: "find", q: query })} readOnly />
                  <input type="hidden" name="addressee_id" value={person.user_id} readOnly />
                  <button className="community-friend-button" type="submit" disabled={outgoingIds.has(person.user_id)}>
                    <UserPlus size={17} /> {outgoingIds.has(person.user_id) ? "Verbindingsverzoek verstuurd" : "Verbinding maken"}
                  </button>
                </form>
              } />
            ))}
            {!visibleSuggestions.length ? <div className="community-profile-empty"><Users size={26} /><strong>Geen mensen gevonden</strong><span>Probeer een andere naam, plaats of profieltekst.</span></div> : null}
          </div>
        </div>
      ) : activeTab === "moments" ? (
        connectionMoments.length ? (
          <div className="community-profile-event-grid">
            {connectionMoments.slice(0, 24).map((moment) => (
              <article key={moment.id}>
                <span className="community-profile-event-date"><strong>{new Date(moment.starts_at).getDate()}</strong><small>{new Date(moment.starts_at).toLocaleDateString("nl-NL", { month: "short" })}</small></span>
                <div>
                  <time dateTime={moment.starts_at}>{new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(moment.starts_at))}</time>
                  <h3>{moment.title}</h3>
                  {moment.owner ? <p><Users size={15} /> {moment.owner.display_name}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="community-profile-empty"><CalendarDays size={26} /><strong>Geen momenten van verbindingen</strong><span>Bijzondere dagen van je verbindingen verschijnen hier zodra zij die hebben vastgelegd.</span></div>
        )
      ) : (
        <div className="community-profile-people-grid">
          {connections.slice(0, compact ? 6 : 24).map((connection) => {
            const friendship = connectionByProfileId.get(connection.user_id);
            return <PersonRow key={connection.user_id} profile={connection} action={friendship && !compact ? (
              <form action={deleteCommunityConnection}>
                <input type="hidden" name="return_to" value={profileHref("friends")} readOnly />
                <input type="hidden" name="friendship_id" value={friendship.id} readOnly />
                <button className="text-link" type="submit">Verbinding verbreken</button>
              </form>
            ) : undefined} />;
          })}
          {!connections.length ? <div className="community-profile-empty"><Users size={26} /><strong>Nog niets om te tonen</strong><span>Verbindingen verschijnen hier.</span></div> : null}
        </div>
      )}

      {!compact && activeTab === "connections" && suggestions.length ? (
        <div className="community-profile-suggestions">
          <h3>Vind mensen</h3>
          <CommunityInviteTools />
          <div className="community-profile-people-grid">
            {suggestions.slice(0, 6).map((person) => (
              <PersonRow key={person.user_id} profile={person} action={
                <form action={sendCommunityFriendRequest}>
                  <input type="hidden" name="return_to" value={profileHref("friends")} readOnly />
                  <input type="hidden" name="addressee_id" value={person.user_id} readOnly />
                  <button className="community-friend-button" type="submit" disabled={outgoingIds.has(person.user_id)}>
                    <UserPlus size={17} /> {outgoingIds.has(person.user_id) ? "Verbindingsverzoek verstuurd" : "Verbinding maken"}
                  </button>
                </form>
              } />
            ))}
          </div>
        </div>
      ) : null}
      {compact && connections.length > 6 ? <Link className="community-profile-more" href={profileHref("friends")}>Alle verbindingen bekijken</Link> : null}
    </section>
  );
}

function ProfileActivitySection({
  posts,
  replies,
  compact = false
}: {
  posts: CommunityPost[];
  replies: CommunityProfileReply[];
  compact?: boolean;
}) {
  const normalizedReplies = replies.map((reply) => ({
    ...reply,
    community_posts: Array.isArray(reply.community_posts) ? (reply.community_posts[0] ?? null) : (reply.community_posts ?? null)
  }));
  const activity = [
    ...posts.map((post) => ({
      id: `post-${post.id}`,
      type: "post" as const,
      title: post.title,
      body: post.body,
      createdAt: post.created_at,
      status: post.status,
      href: post.status === "approved" ? `/community/${post.slug}` : null
    })),
    ...normalizedReplies.map((reply) => ({
      id: `reply-${reply.id}`,
      type: "reply" as const,
      title: reply.community_posts?.title ? `Reactie op ${reply.community_posts.title}` : "Jouw reactie",
      body: reply.body,
      createdAt: reply.created_at,
      status: reply.status,
      href: reply.status === "approved" && reply.community_posts?.slug ? `/community/${reply.community_posts.slug}` : null
    }))
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, compact ? 6 : 50);

  return (
    <section className="community-profile-section" id="bijdragen">
      <header className="community-profile-section-header">
        <div>
          <p className="eyebrow">Jouw activiteit</p>
          <h2>Berichten en reacties</h2>
          <span>Hier zie je ook bijdragen die nog worden gecontroleerd of niet zijn gepubliceerd.</span>
        </div>
      </header>
      {activity.length ? (
        <div className="community-profile-activity-list">
          {activity.map((item) => (
            <article className="community-profile-activity-item" key={item.id}>
              <span className="community-profile-activity-icon" aria-hidden>
                {item.type === "post" ? <Newspaper size={20} /> : <MessageCircle size={20} />}
              </span>
              <div>
                <p>{item.type === "post" ? "Bericht" : "Reactie"} · {formatProfileDate(item.createdAt)}</p>
                <h3>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h3>
                <span>{item.body}</span>
              </div>
              <strong className={`community-profile-status status-${item.status}`}>
                {communityStatusLabels[item.status]}
              </strong>
            </article>
          ))}
        </div>
      ) : (
        <div className="community-profile-empty">
          <Newspaper size={28} />
          <strong>Nog geen bijdragen</strong>
          <span>Berichten en reacties die je vanuit de feed plaatst, verschijnen hier met hun actuele status.</span>
        </div>
      )}
      {compact && activity.length >= 6 ? (
        <Link className="community-profile-more" href={profileHref("activity")}>Alle bijdragen bekijken</Link>
      ) : null}
    </section>
  );
}

function formatProfileDate(value: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function ProfilePulseSection({ moments, displayName }: { moments: CommunityPulseMoment[]; displayName: string }) {
  return (
    <section className="community-profile-section" id="aan-de-pols">
      <header className="community-profile-section-header">
        <div>
          <p className="eyebrow">Aan de Pols</p>
          <h2>Aan de Pols</h2>
          <span>Even stilstaan bij wat er vanbinnen speelt. Deel een kort moment, een gedachte of iets dat je niet alleen wilt dragen.</span>
        </div>
      </header>
      <PulseMomentDesigner moments={moments} displayName={displayName} />
      <div className="pulse-profile-overview">
        <h3>Momenten van {displayName}</h3>
        {moments.length ? (
          <div className="pulse-profile-list">
            {moments.map((moment) => (
              <article key={moment.id}>
                <span className={`pulse-profile-thumb animation-${moment.animation}`} style={{ backgroundColor: moment.background_color }}>
                  {moment.image_url ? <Image src={moment.image_url} alt="" fill sizes="88px" /> : null}
                </span>
                <div>
                  <strong>{moment.title}</strong>
                  <span>{moment.status === "draft" ? "Concept" : "Gedeeld"} · {moment.visibility === "community" ? "Community" : moment.visibility === "connections" ? "Verbindingen" : "Alleen ik"}</span>
                  {moment.ai_generation_status === "requested" ? <span>Ontwerpaanvraag staat klaar · EUR {(moment.ai_estimated_price_cents / 100).toFixed(2).replace(".", ",")}</span> : null}
                </div>
                <form action={deleteCommunityPulseMoment}>
                  <input type="hidden" name="return_to" value={profileHref("pulse")} readOnly />
                  <input type="hidden" name="moment_id" value={moment.id} readOnly />
                  <button className="text-link" type="submit">Moment verwijderen</button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <div className="community-profile-empty"><Camera size={28} /><strong>Hier zijn nog geen momenten gedeeld</strong><span>Nieuw moment plaatsen kan hierboven.</span></div>
        )}
      </div>
    </section>
  );
}

function ProfileInfoSection({ profile, displayName }: { profile: CommunityProfile | null; displayName: string }) {
  const details = profile?.profile_details ?? {};
  return (
    <section className="community-profile-section community-profile-info" id="info">
      <aside aria-label="Info onderdelen">
        <h2>Info</h2>
        {[
          ["intro", "Intro"], ["persoonlijk", "Persoonlijke gegevens"], ["werk", "Werk"], ["onderwijs", "Onderwijs"],
          ["hobbys", "Hobby's en interesses"], ["reizen", "Reizen"], ["links", "Links"], ["contact", "Contactgegevens"],
          ["privacy", "Privacy"], ["namen", "Namen"]
        ].map(([id, label], index) => <a key={id} className={index === 0 ? "active" : ""} href={`#info-${id}`}>{label}</a>)}
      </aside>
      <form className="community-profile-info-form" action={updateCommunityProfileInfo}>
        <input type="hidden" name="return_to" value={profileHref("info")} readOnly />
        <fieldset id="info-intro">
          <legend>Intro</legend>
          <label>Bio<textarea name="bio" rows={4} maxLength={500} defaultValue={profile?.bio ?? ""} placeholder="Vertel in je eigen woorden iets over jezelf." /></label>
          <div className="community-profile-field-grid">
            <label>Categorie<input name="category" maxLength={80} defaultValue={details.category ?? ""} placeholder="Bijvoorbeeld ervaringsdeskundige" /></label>
            <label>Voornaamwoorden<input name="pronouns" maxLength={40} defaultValue={details.pronouns ?? ""} /></label>
          </div>
        </fieldset>
        <fieldset id="info-persoonlijk">
          <legend>Persoonlijke gegevens</legend>
          <div className="community-profile-field-grid">
            <label>Geboorteplaats<input name="hometown" maxLength={100} defaultValue={details.hometown ?? ""} /></label>
            <label>Woonplaats<input name="current_city" maxLength={100} defaultValue={details.current_city ?? ""} /></label>
            <label>Relatiestatus<input name="relationship_status" maxLength={60} defaultValue={details.relationship_status ?? ""} /></label>
          </div>
        </fieldset>
        <fieldset id="info-werk">
          <legend>Werk</legend>
          <div className="community-profile-field-grid">
            <label>Functie<input name="job_title" maxLength={100} defaultValue={details.job_title ?? ""} /></label>
            <label>Organisatie<input name="employer" maxLength={100} defaultValue={details.employer ?? ""} /></label>
          </div>
        </fieldset>
        <fieldset id="info-onderwijs"><legend>Onderwijs</legend><label>Opleiding<input name="education" maxLength={160} defaultValue={details.education ?? ""} /></label></fieldset>
        <fieldset id="info-hobbys">
          <legend>Hobby&apos;s en interesses</legend>
          <div className="community-profile-field-grid">
            <label>Hobby&apos;s<textarea name="hobbies" rows={3} maxLength={500} defaultValue={details.hobbies ?? ""} /></label>
            <label>Interesses<textarea name="interests" rows={3} maxLength={500} defaultValue={details.interests ?? ""} /></label>
          </div>
        </fieldset>
        <fieldset id="info-reizen"><legend>Reizen</legend><label>Plaatsen die belangrijk voor je zijn<textarea name="places" rows={3} maxLength={500} defaultValue={details.places ?? ""} /></label></fieldset>
        <fieldset id="info-links">
          <legend>Links</legend>
          <div className="community-profile-field-grid">
            <label>Website<input name="website" type="url" defaultValue={details.website ?? ""} placeholder="https://" /></label>
            <label>Instagram<input name="instagram" maxLength={100} defaultValue={details.instagram ?? ""} /></label>
            <label>Facebook<input name="facebook" maxLength={160} defaultValue={details.facebook ?? ""} /></label>
            <label>TikTok<input name="tiktok" maxLength={100} defaultValue={details.tiktok ?? ""} /></label>
          </div>
        </fieldset>
        <fieldset id="info-contact">
          <legend>Contactgegevens</legend>
          <div className="community-profile-field-grid">
            <label>E-mail<input name="contact_email" type="email" maxLength={254} defaultValue={details.contact_email ?? ""} /></label>
            <label>Telefoon<input name="phone" type="tel" maxLength={40} defaultValue={details.phone ?? ""} /></label>
          </div>
        </fieldset>
        <fieldset id="info-privacy"><legend>Privacy</legend><label className="community-checkbox-row"><input name="is_discoverable" type="checkbox" defaultChecked={profile?.is_discoverable ?? false} />Anderen binnen SNAAR mogen mijn profiel vinden en mij een bericht of verbindingsverzoek sturen.</label></fieldset>
        <fieldset id="info-namen"><legend>Namen</legend><label>Weergavenaam<input name="display_name" maxLength={80} required defaultValue={displayName} /></label></fieldset>
        <div className="community-profile-savebar"><p>Je bepaalt zelf wat je invult. Lege velden worden niet op je profiel getoond.</p><button className="community-panel-button" type="submit">Informatie opslaan</button></div>
      </form>
    </section>
  );
}

export default async function CommunityProfilePage({ searchParams }: CommunityProfilePageProps) {
  const params = (await searchParams) ?? {};
  const activeTab = normalizeProfileTab(params.tab);
  const connectionsTab = normalizeConnectionsTab(params.connections ?? params.friends);
  const searchQuery = String(params.q ?? "").trim().slice(0, 80);
  const eventFilter = params.events === "past" ? "past" : "upcoming";
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?next=%2Fcommunity%2Fprofiel");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fcommunity%2Fprofiel");

  const dataClient = createSupabaseAdminClient() ?? supabase;
  const [
    profileResult,
    albumsResult,
    photosResult,
    eventsResult,
    pulseMomentsResult,
    friendshipsResult,
    discoverableResult,
    ownPostsResult,
    ownRepliesResult
  ] = await Promise.all([
    dataClient.from("community_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    dataClient.from("community_profile_albums").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(40),
    dataClient.from("community_profile_photos").select("*,community_profile_albums(*)").eq("user_id", user.id).neq("status", "archived").order("display_order").order("created_at", { ascending: false }).limit(60),
    dataClient.from("community_profile_events").select("*").eq("user_id", user.id).order("starts_at", { ascending: false }).limit(30),
    dataClient.from("community_pulse_moments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    dataClient.from("community_friendships").select("*").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).order("updated_at", { ascending: false }),
    dataClient.from("community_profiles").select("*").eq("is_discoverable", true).neq("user_id", user.id).limit(80),
    dataClient.from("community_posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    dataClient
      .from("community_replies")
      .select("*,community_posts(title,slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  const profile = profileResult.error ? null : profileResult.data as CommunityProfile | null;
  const albums = albumsResult.error ? [] : (albumsResult.data as CommunityProfileAlbum[] | null) ?? [];
  const photos = photosResult.error ? [] : (photosResult.data as CommunityProfilePhoto[] | null) ?? [];
  const ownEvents = eventsResult.error ? [] : (eventsResult.data as CommunityProfileEvent[] | null) ?? [];
  const pulseReady = !pulseMomentsResult.error;
  const pulseMoments = pulseMomentsResult.error ? [] : (pulseMomentsResult.data as CommunityPulseMoment[] | null) ?? [];
  const friendships = friendshipsResult.error ? [] : (friendshipsResult.data as CommunityFriendship[] | null) ?? [];
  const discoverable = discoverableResult.error ? [] : (discoverableResult.data as CommunityProfile[] | null) ?? [];
  const ownPosts = ownPostsResult.error ? [] : (ownPostsResult.data as CommunityPost[] | null) ?? [];
  const ownReplies = ownRepliesResult.error ? [] : (ownRepliesResult.data as CommunityProfileReply[] | null) ?? [];
  const fallbackName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "SNAAR gebruiker";
  const displayName = profile?.display_name ?? fallbackName;
  if (profileResult.error) console.error("[community-profile] profile read failed", { code: profileResult.error.code });

  const acceptedConnections = friendships.filter((item) => item.status === "accepted");
  const connectedIds = new Set(acceptedConnections.map((item) => item.requester_id === user.id ? item.addressee_id : item.requester_id));
  const incoming = friendships.filter((item) => item.status === "pending" && item.addressee_id === user.id);
  const outgoingIds = new Set(friendships.filter((item) => item.status === "pending" && item.requester_id === user.id).map((item) => item.addressee_id));
  const pendingIds = new Set([...incoming.map((item) => item.requester_id), ...outgoingIds]);
  const profileIds = new Set([...connectedIds, ...incoming.map((item) => item.requester_id)]);
  const missingProfileIds = [...profileIds].filter((id) => !discoverable.some((person) => person.user_id === id));
  let extraProfiles: CommunityProfile[] = [];
  if (missingProfileIds.length) {
    const result = await dataClient.from("community_profiles").select("*").in("user_id", missingProfileIds);
    if (!result.error) extraProfiles = (result.data as CommunityProfile[] | null) ?? [];
  }
  const profilesById = new Map([...discoverable, ...extraProfiles].map((person) => [person.user_id, person]));
  const connections = [...connectedIds].map((id) => profilesById.get(id)).filter((person): person is CommunityProfile => Boolean(person));
  const suggestions = discoverable.filter((person) => !connectedIds.has(person.user_id) && !pendingIds.has(person.user_id));
  let connectionEvents: ProfileMoment[] = [];
  if (connectedIds.size) {
    const result = await dataClient
      .from("community_profile_events")
      .select("*")
      .in("user_id", [...connectedIds])
      .order("starts_at", { ascending: true })
      .limit(60);
    if (!result.error) {
      connectionEvents = ((result.data as CommunityProfileEvent[] | null) ?? []).map((event) => ({
        ...event,
        owner: profilesById.get(event.user_id) ?? null
      }));
    }
  }
  const events: ProfileMoment[] = [...ownEvents, ...connectionEvents];

  return (
    <main className="community-profile-page">
      <section className="community-profile-cover" aria-label="Mijn SNAAR profiel">
        <div className="community-profile-cover-art">
          {profile?.cover_url ? <Image src={profile.cover_url} alt={`Omslagfoto van ${displayName}`} fill priority sizes="(max-width: 1100px) 100vw, 1040px" /> : null}
          <details className="community-profile-media-control is-cover">
            <summary><Camera size={18} /> Omslagfoto wijzigen</summary>
            <form action={updateCommunityProfileMedia} encType="multipart/form-data">
              <input type="hidden" name="return_to" value={profileHref(activeTab)} readOnly />
              <input name="cover_file" type="file" accept="image/png,image/jpeg,image/webp" required />
              <button type="submit">Opslaan</button>
            </form>
          </details>
        </div>
        <div className="community-profile-identity">
          <div className="community-profile-photo-wrap">
            <ProfilePicture profile={profile} displayName={displayName} />
            <details className="community-profile-media-control is-avatar">
              <summary aria-label="Profielfoto wijzigen"><Camera size={18} /></summary>
              <form action={updateCommunityProfileMedia} encType="multipart/form-data">
                <input type="hidden" name="return_to" value={profileHref(activeTab)} readOnly />
                <input name="avatar_file" type="file" accept="image/png,image/jpeg,image/webp" required />
                <button type="submit">Opslaan</button>
              </form>
            </details>
          </div>
          <div className="community-profile-name">
            <p className="eyebrow">Mijn profiel</p>
            <h1>{displayName}</h1>
            <p>{connections.length} {connections.length === 1 ? "verbinding" : "verbindingen"} · {profile?.is_discoverable ? "Vindbaar binnen SNAAR" : "Niet vindbaar"}</p>
          </div>
          <div className="community-profile-actions">
            <Link className="button" href="/community">Terug naar SNAAR</Link>
            <form action={signOut}><input type="hidden" name="next" value="/community" readOnly /><button className="text-link" type="submit">Uitloggen</button></form>
          </div>
        </div>
        <nav className="community-profile-main-nav" aria-label="Profiel onderdelen">
          {profileTabs.map((tab) => <Link key={tab.id} className={activeTab === tab.id ? "active" : ""} href={profileHref(tab.id)}>{tab.label}</Link>)}
        </nav>
      </section>

      {params.error ? <p className="notice community-profile-notice" role="alert">{profileMessages[params.error] ?? "Profiel opslaan lukte niet."}</p> : null}
      {profileResult.error ? <p className="notice community-profile-notice" role="alert">Je profielgegevens konden niet volledig worden geladen. Probeer de pagina opnieuw.</p> : null}
      {params.profile ? <p className="notice community-profile-notice" role="status">{successMessages[params.profile] ?? "Je wijziging is opgeslagen."}</p> : null}

      <div className="community-profile-content">
        {activeTab === "all" || activeTab === "photos" ? <ProfilePhotosSection photos={photos} albums={albums} profile={profile} displayName={displayName} compact={activeTab === "all"} /> : null}
        {activeTab === "all" || activeTab === "events" ? <ProfileEventsSection events={events} filter={eventFilter} compact={activeTab === "all"} /> : null}
        {activeTab === "all" || activeTab === "friends" ? <ProfileConnectionsSection activeTab={activeTab === "all" ? "connections" : connectionsTab} connections={connections} incoming={incoming} acceptedConnections={acceptedConnections} outgoingIds={outgoingIds} suggestions={suggestions} connectionMoments={connectionEvents} searchQuery={searchQuery} profilesById={profilesById} compact={activeTab === "all"} /> : null}
        {activeTab === "all" || activeTab === "activity" ? <ProfileActivitySection posts={ownPosts} replies={ownReplies} compact={activeTab === "all"} /> : null}
        {activeTab === "info" ? <ProfileInfoSection profile={profile} displayName={displayName} /> : null}
        {activeTab === "pulse" ? (
          pulseReady ? (
            <ProfilePulseSection moments={pulseMoments} displayName={displayName} />
          ) : (
            <section className="community-profile-section">
              <div className="community-profile-empty"><Camera size={28} /><strong>Aan de Pols wordt klaargezet</strong><span>De ontwerpmodule is tijdelijk nog niet beschikbaar.</span></div>
            </section>
          )
        ) : null}
      </div>
    </main>
  );
}
