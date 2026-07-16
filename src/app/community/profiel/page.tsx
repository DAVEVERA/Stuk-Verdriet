import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Camera,
  ImagePlus,
  MapPin,
  MoreHorizontal,
  UserPlus,
  Users
} from "lucide-react";
import {
  addCommunityProfilePhoto,
  createCommunityProfileEvent,
  respondToCommunityFriendRequest,
  sendCommunityFriendRequest,
  signOut,
  updateCommunityProfileInfo,
  updateCommunityProfileMedia
} from "@/lib/actions";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";
import type {
  CommunityFriendship,
  CommunityProfile,
  CommunityProfileEvent,
  CommunityProfilePhoto
} from "@/types/content";

export const dynamic = "force-dynamic";

type ProfileTab = "all" | "info" | "reels" | "photos" | "events" | "friends";
type FriendsTab = "friends" | "requests" | "birthdays" | "hometown" | "followers" | "following";

type CommunityProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    profile?: string;
    tab?: string;
    friends?: string;
    events?: string;
  }>;
};

const profileMessages: Record<string, string> = {
  avatar: "Kies een jpg, png of webp van maximaal 3 MB.",
  cover: "Kies een jpg, png of webp van maximaal 5 MB.",
  photo: "Kies een geldige foto van maximaal 4 MB.",
  event: "Vul voor het evenement minimaal een titel en datum in.",
  friend: "Dit vriendschapsverzoek kon niet worden verwerkt.",
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
  "event-saved": "Het evenement is toegevoegd.",
  "friend-requested": "Vriendschapsverzoek verstuurd.",
  "friend-accepted": "Jullie zijn nu vrienden.",
  "friend-declined": "Het verzoek is verwijderd."
};

const profileTabs: Array<{ id: ProfileTab; label: string }> = [
  { id: "all", label: "Alles" },
  { id: "info", label: "Info" },
  { id: "reels", label: "Reels" },
  { id: "photos", label: "Foto's" },
  { id: "events", label: "Evenementen" },
  { id: "friends", label: "Vrienden" }
];

const friendsTabs: Array<{ id: FriendsTab; label: string }> = [
  { id: "friends", label: "Vrienden" },
  { id: "requests", label: "Verzoeken" },
  { id: "birthdays", label: "Verjaardagen" },
  { id: "hometown", label: "Geboorteplaats" },
  { id: "followers", label: "Volgers" },
  { id: "following", label: "Volgend" }
];

function isProfileTab(value: string | undefined): value is ProfileTab {
  return profileTabs.some((tab) => tab.id === value);
}

function isFriendsTab(value: string | undefined): value is FriendsTab {
  return friendsTabs.some((tab) => tab.id === value);
}

function profileHref(tab: ProfileTab, extra?: string) {
  const query = new URLSearchParams({ tab });
  if (extra) {
    const [key, value] = extra.split("=");
    if (key && value) query.set(key, value);
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

function PersonRow({ profile, action }: { profile: CommunityProfile; action?: React.ReactNode }) {
  return (
    <div className="community-profile-person">
      <ProfilePicture profile={profile} displayName={profile.display_name} size="small" />
      <div>
        <strong>{profile.display_name}</strong>
        <span>{profile.profile_details?.hometown || profile.bio || "Lid van SNAAR"}</span>
      </div>
      {action ?? <button className="community-icon-button" type="button" aria-label={`Meer opties voor ${profile.display_name}`}><MoreHorizontal size={20} /></button>}
    </div>
  );
}

function ProfilePhotosSection({ photos, profile, displayName, compact = false }: {
  photos: CommunityProfilePhoto[];
  profile: CommunityProfile | null;
  displayName: string;
  compact?: boolean;
}) {
  const media = [
    ...(profile?.avatar_url ? [{ id: "avatar", image_url: profile.avatar_url, caption: "Profielfoto" }] : []),
    ...(profile?.cover_url ? [{ id: "cover", image_url: profile.cover_url, caption: "Omslagfoto" }] : []),
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
            <button className="community-panel-button" type="submit">Foto plaatsen</button>
          </form>
        </details>
      </header>
      <nav className="community-profile-subnav" aria-label="Foto onderdelen">
        <Link className="active" href={profileHref("photos")}>Jouw foto&apos;s</Link>
        <span>Albums</span>
      </nav>
      {visibleMedia.length ? (
        <div className="community-profile-photo-grid">
          {visibleMedia.map((photo) => (
            <figure key={photo.id}>
              <Image src={photo.image_url} alt={photo.caption || `Foto van ${displayName}`} fill sizes="(max-width: 520px) 50vw, (max-width: 900px) 33vw, 220px" />
              {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
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

function ProfileEventsSection({ events, filter, compact = false }: { events: CommunityProfileEvent[]; filter: "upcoming" | "past"; compact?: boolean }) {
  // This dynamic Server Component intentionally evaluates event state at request time.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const filtered = events
    .filter((event) => filter === "past" ? Date.parse(event.starts_at) < now : Date.parse(event.starts_at) >= now)
    .slice(0, compact ? 2 : 12);
  const formatter = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <section className="community-profile-section" id="evenementen">
      <header className="community-profile-section-header">
        <div><p className="eyebrow">Agenda</p><h2>Evenementen</h2></div>
        <details className="community-profile-action-menu">
          <summary><CalendarDays size={18} /> Evenement maken</summary>
          <form action={createCommunityProfileEvent} encType="multipart/form-data">
            <input type="hidden" name="return_to" value={profileHref("events", `events=${filter}`)} readOnly />
            <label>Titel<input name="title" maxLength={120} required /></label>
            <label>Datum en tijd<input name="starts_at" type="datetime-local" required /></label>
            <label>Locatie<input name="location" maxLength={140} /></label>
            <label>Beschrijving<textarea name="description" maxLength={1000} rows={3} /></label>
            <label>Afbeelding<input name="event_image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
            <button className="community-panel-button" type="submit">Evenement opslaan</button>
          </form>
        </details>
      </header>
      <nav className="community-profile-subnav" aria-label="Evenement filters">
        <Link className={filter === "upcoming" ? "active" : ""} href={profileHref("events", "events=upcoming")}>Aankomend</Link>
        <Link className={filter === "past" ? "active" : ""} href={profileHref("events", "events=past")}>Afgelopen</Link>
      </nav>
      {filtered.length ? (
        <div className="community-profile-event-grid">
          {filtered.map((event) => (
            <article key={event.id}>
              {event.image_url ? <span className="community-profile-event-image"><Image src={event.image_url} alt="" fill sizes="120px" /></span> : <span className="community-profile-event-date"><strong>{new Date(event.starts_at).getDate()}</strong><small>{new Date(event.starts_at).toLocaleDateString("nl-NL", { month: "short" })}</small></span>}
              <div>
                <time dateTime={event.starts_at}>{formatter.format(new Date(event.starts_at))}</time>
                <h3>{event.title}</h3>
                {event.location ? <p><MapPin size={15} /> {event.location}</p> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="community-profile-empty"><CalendarDays size={26} /><strong>Geen {filter === "past" ? "afgelopen" : "aankomende"} evenementen</strong><span>Maak een evenement om samen iets betekenisvols te plannen.</span></div>
      )}
    </section>
  );
}

function ProfileFriendsSection({
  activeTab,
  friends,
  incoming,
  outgoingIds,
  suggestions,
  profilesById,
  compact = false
}: {
  activeTab: FriendsTab;
  friends: CommunityProfile[];
  incoming: CommunityFriendship[];
  outgoingIds: Set<string>;
  suggestions: CommunityProfile[];
  profilesById: Map<string, CommunityProfile>;
  compact?: boolean;
}) {
  const birthdayProfiles = friends.filter((friend) => friend.profile_details?.birthday);
  const hometownProfiles = friends.filter((friend) => friend.profile_details?.hometown);
  const list = activeTab === "birthdays" ? birthdayProfiles : activeTab === "hometown" ? hometownProfiles : friends;
  return (
    <section className="community-profile-section" id="vrienden">
      <header className="community-profile-section-header">
        <div><p className="eyebrow">Jouw netwerk</p><h2>Vrienden</h2><span>{friends.length} {friends.length === 1 ? "vriend" : "vrienden"}</span></div>
        <Link className="community-profile-header-link" href={profileHref("friends", "friends=requests")}>Vriendschapsverzoeken{incoming.length ? ` (${incoming.length})` : ""}</Link>
      </header>
      <nav className="community-profile-subnav is-scrollable" aria-label="Vrienden onderdelen">
        {friendsTabs.map((tab) => <Link key={tab.id} className={activeTab === tab.id ? "active" : ""} href={profileHref("friends", `friends=${tab.id}`)}>{tab.label}</Link>)}
      </nav>

      {activeTab === "requests" ? (
        <div className="community-profile-people-grid">
          {incoming.map((request) => {
            const person = profilesById.get(request.requester_id);
            if (!person) return null;
            return <PersonRow key={request.id} profile={person} action={
              <form className="community-friend-response" action={respondToCommunityFriendRequest}>
                <input type="hidden" name="return_to" value={profileHref("friends", "friends=requests")} readOnly />
                <input type="hidden" name="friendship_id" value={request.id} readOnly />
                <button name="response" value="accepted" type="submit">Accepteren</button>
                <button className="text-link" name="response" value="declined" type="submit">Verwijderen</button>
              </form>
            } />;
          })}
          {!incoming.length ? <div className="community-profile-empty"><UserPlus size={26} /><strong>Geen openstaande verzoeken</strong><span>Nieuwe verzoeken verschijnen hier.</span></div> : null}
        </div>
      ) : activeTab === "followers" || activeTab === "following" ? (
        <div className="community-profile-empty"><Users size={26} /><strong>{activeTab === "followers" ? "Nog geen volgers" : "Je volgt nog niemand"}</strong><span>Deze lijst groeit wanneer je meer mensen binnen SNAAR ontmoet.</span></div>
      ) : (
        <div className="community-profile-people-grid">
          {list.slice(0, compact ? 6 : 24).map((friend) => <PersonRow key={friend.user_id} profile={friend} />)}
          {!list.length ? <div className="community-profile-empty"><Users size={26} /><strong>Nog niets om te tonen</strong><span>Vrienden met deze informatie verschijnen hier.</span></div> : null}
        </div>
      )}

      {!compact && activeTab === "friends" && suggestions.length ? (
        <div className="community-profile-suggestions">
          <h3>Mensen die je kunt kennen</h3>
          <div className="community-profile-people-grid">
            {suggestions.slice(0, 6).map((person) => (
              <PersonRow key={person.user_id} profile={person} action={
                <form action={sendCommunityFriendRequest}>
                  <input type="hidden" name="return_to" value={profileHref("friends")} readOnly />
                  <input type="hidden" name="addressee_id" value={person.user_id} readOnly />
                  <button className="community-friend-button" type="submit" disabled={outgoingIds.has(person.user_id)}>
                    <UserPlus size={17} /> {outgoingIds.has(person.user_id) ? "Verstuurd" : "Toevoegen"}
                  </button>
                </form>
              } />
            ))}
          </div>
        </div>
      ) : null}
      {compact && friends.length > 6 ? <Link className="community-profile-more" href={profileHref("friends")}>Alle vrienden bekijken</Link> : null}
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
            <label>Geboortedatum<input name="birthday" type="date" defaultValue={details.birthday ?? ""} /></label>
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
        <fieldset id="info-privacy"><legend>Privacy</legend><label className="community-checkbox-row"><input name="is_discoverable" type="checkbox" defaultChecked={profile?.is_discoverable ?? false} />Anderen binnen SNAAR mogen mijn profiel vinden en mij een bericht of vriendschapsverzoek sturen.</label></fieldset>
        <fieldset id="info-namen"><legend>Namen</legend><label>Weergavenaam<input name="display_name" maxLength={80} required defaultValue={displayName} /></label></fieldset>
        <div className="community-profile-savebar"><p>Je bepaalt zelf wat je invult. Lege velden worden niet op je profiel getoond.</p><button className="community-panel-button" type="submit">Informatie opslaan</button></div>
      </form>
    </section>
  );
}

export default async function CommunityProfilePage({ searchParams }: CommunityProfilePageProps) {
  const params = (await searchParams) ?? {};
  const activeTab: ProfileTab = isProfileTab(params.tab) ? params.tab : "all";
  const friendsTab: FriendsTab = isFriendsTab(params.friends) ? params.friends : "friends";
  const eventFilter = params.events === "past" ? "past" : "upcoming";
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?next=%2Fcommunity%2Fprofiel");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fcommunity%2Fprofiel");

  const dataClient = createSupabaseAdminClient() ?? supabase;
  const [profileResult, photosResult, eventsResult, friendshipsResult, discoverableResult] = await Promise.all([
    dataClient.from("community_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    dataClient.from("community_profile_photos").select("*").eq("user_id", user.id).order("display_order").order("created_at", { ascending: false }).limit(30),
    dataClient.from("community_profile_events").select("*").eq("user_id", user.id).order("starts_at", { ascending: false }).limit(30),
    dataClient.from("community_friendships").select("*").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).order("updated_at", { ascending: false }),
    dataClient.from("community_profiles").select("*").eq("is_discoverable", true).neq("user_id", user.id).limit(24)
  ]);

  const profile = profileResult.error ? null : profileResult.data as CommunityProfile | null;
  const photos = photosResult.error ? [] : (photosResult.data as CommunityProfilePhoto[] | null) ?? [];
  const events = eventsResult.error ? [] : (eventsResult.data as CommunityProfileEvent[] | null) ?? [];
  const friendships = friendshipsResult.error ? [] : (friendshipsResult.data as CommunityFriendship[] | null) ?? [];
  const discoverable = discoverableResult.error ? [] : (discoverableResult.data as CommunityProfile[] | null) ?? [];
  const fallbackName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "SNAAR gebruiker";
  const displayName = profile?.display_name ?? fallbackName;
  if (profileResult.error) console.error("[community-profile] profile read failed", { code: profileResult.error.code });

  const connectedIds = new Set(friendships.filter((item) => item.status === "accepted").map((item) => item.requester_id === user.id ? item.addressee_id : item.requester_id));
  const incoming = friendships.filter((item) => item.status === "pending" && item.addressee_id === user.id);
  const outgoingIds = new Set(friendships.filter((item) => item.status === "pending" && item.requester_id === user.id).map((item) => item.addressee_id));
  const profileIds = new Set([...connectedIds, ...incoming.map((item) => item.requester_id)]);
  const missingProfileIds = [...profileIds].filter((id) => !discoverable.some((person) => person.user_id === id));
  let extraProfiles: CommunityProfile[] = [];
  if (missingProfileIds.length) {
    const result = await dataClient.from("community_profiles").select("*").in("user_id", missingProfileIds);
    if (!result.error) extraProfiles = (result.data as CommunityProfile[] | null) ?? [];
  }
  const profilesById = new Map([...discoverable, ...extraProfiles].map((person) => [person.user_id, person]));
  const friends = [...connectedIds].map((id) => profilesById.get(id)).filter((person): person is CommunityProfile => Boolean(person));
  const suggestions = discoverable.filter((person) => !connectedIds.has(person.user_id) && !outgoingIds.has(person.user_id));

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
            <p>{friends.length} {friends.length === 1 ? "vriend" : "vrienden"} · {profile?.is_discoverable ? "Vindbaar binnen SNAAR" : "Niet vindbaar"}</p>
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
        {activeTab === "all" || activeTab === "photos" ? <ProfilePhotosSection photos={photos} profile={profile} displayName={displayName} compact={activeTab === "all"} /> : null}
        {activeTab === "all" || activeTab === "events" ? <ProfileEventsSection events={events} filter={eventFilter} compact={activeTab === "all"} /> : null}
        {activeTab === "all" || activeTab === "friends" ? <ProfileFriendsSection activeTab={activeTab === "all" ? "friends" : friendsTab} friends={friends} incoming={incoming} outgoingIds={outgoingIds} suggestions={suggestions} profilesById={profilesById} compact={activeTab === "all"} /> : null}
        {activeTab === "info" ? <ProfileInfoSection profile={profile} displayName={displayName} /> : null}
        {activeTab === "reels" ? <section className="community-profile-section"><div className="community-profile-empty"><Camera size={28} /><strong>Reels komen later</strong><span>Je foto&apos;s, evenementen en profielinformatie zijn nu al volledig te beheren.</span></div></section> : null}
      </div>
    </main>
  );
}
