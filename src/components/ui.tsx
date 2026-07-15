"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  Calendar,
  ChevronDown,
  Download,
  Edit3,
  Grid3X3,
  Headphones,
  Heart,
  Instagram,
  Leaf,
  Mail,
  MessageCircle,
  Music2,
  Search,
  Send,
  Pause,
  Play,
  Shield,
  Star,
  User,
  Users,
  Volume2,
  Youtube,
} from "lucide-react";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { ConsentScript } from "@/components/ConsentScript";
import { DanielaStoryPopout } from "@/components/DanielaStoryPopout";
import { FamilyStoryPopout } from "@/components/FamilyStoryPopout";
import { HeroSlider } from "@/components/HeroSlider";
import { SusanStoryPopout } from "@/components/SusanStoryPopout";
import { SocialFollowTrigger } from "@/components/SocialFollowTrigger";
import { createCommunityPost, sendCommunityMessage, signOut, startCommunityConversation, supportPost, subscribeEpisodeSignup, updateCommunityProfile } from "@/lib/actions";
import { navigation, site } from "@/lib/site";
import type { CommunityCategory, CommunityConversation, CommunityPost, CommunityProfile, HostProfile, PodcastEpisode, PodcastSeason, SocialLinks } from "@/types/content";

const podcastPlaceholderAudioUrl = "/audio/podcast-placeholder.wav";
const podcastInstagramProfileUrl = "https://www.instagram.com/stukverdrietdepodcast/";
const podcastTikTokProfileUrl = "https://www.tiktok.com/@stuk.verdriet";
const tychoSupportUrl = "https://radboudoncologiefonds.voorradboudfonds.nl/project/tycho";
const gofundmeCampaignUrl = "https://www.gofundme.com/f/help-ons-stichting-stuk-verdriet-werkelijkheid-maken";
const gofundmeGoalBarUrl =
  "https://www.gofundme.com/f/help-ons-stichting-stuk-verdriet-werkelijkheid-maken/stream-goal-bar?locale=nl-NL&utm_campaign=fp_sharesheet&utm_medium=customer&utm_source=streaming_widget&attribution_id=sl%3A97015f3d-044e-4a74-9b31-eeef61482df3";
const gofundmeQrCodeUrl =
  "https://www.gofundme.com/f/help-ons-stichting-stuk-verdriet-werkelijkheid-maken/stream-qr-code?locale=nl-NL&utm_campaign=fp_sharesheet&utm_medium=customer&utm_source=streaming_widget&attribution_id=sl%3A97015f3d-044e-4a74-9b31-eeef61482df3";

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M16.6 5.82c1.18.84 2.36 1.31 3.72 1.41v3.08a8.76 8.76 0 0 1-3.7-.82v5.67c0 3.18-2.58 5.76-5.76 5.76a5.76 5.76 0 0 1-2.2-11.08 5.8 5.8 0 0 1 2.2-.43c.33 0 .65.03.96.09v3.22a2.58 2.58 0 1 0 1.95 2.5V3.08h2.83v2.74Z" />
    </svg>
  );
}

export function Footer({ socialLinks: _socialLinks }: { socialLinks: SocialLinks }) {
  const pathname = usePathname();
  const isCommunityPage = pathname === "/community";
  const footerLogo = isCommunityPage ? "/brand/snaar-logo.png" : site.logo;
  const footerFeatures = [
    {
      title: "Longeneeslijk",
      name: "Eva Hermans-Kroot",
      text: "Het boek van Eva Kroot over leven met kanker, pech en geluk.",
      href: "https://www.thema.nl/boek-longeneeslijk/",
      image: "/footer/longeneeslijk.jpg",
      imageAlt: "Boekomslag Longeneeslijk van Eva Hermans-Kroot",
      qr: "/qr/longeneeslijk-thema.png",
      qrAlt: "QR-code naar het boek Longeneeslijk bij Thema"
    },
    {
      title: "Onvergetelijk",
      name: "Matthijs Hermans",
      text: "Een jaar later, over Eva, gemis en het fijne van herinneren.",
      href: "https://www.thema.nl/boek-onvergetelijk/",
      image: "/footer/onvergetelijk.jpg",
      imageAlt: "Boekomslag Onvergetelijk van Matthijs Hermans en Hanneke Mijnster",
      qr: "/qr/onvergetelijk-thema.png",
      qrAlt: "QR-code naar het boek Onvergetelijk bij Thema"
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-brand">
        <Image src={footerLogo} alt="" width={76} height={76} />
        <h2>{site.name}</h2>
        <p className="slogan-text">{site.tagline}</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigatie">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
        <Link href="/privacy">Privacyverklaring</Link>
        <Link href="/communityrichtlijnen">Communityrichtlijnen</Link>
        <Link href="/cookies">Cookieverklaring</Link>
      </nav>
      <div className="footer-contact">
        <a className="quiet-link" href={`mailto:${site.email}`}>
          <Mail size={18} aria-hidden /> {site.email}
        </a>
        <Link className="quiet-link footer-optout-link" href="/afmelden">
          Afmelden of gegevens verwijderen
        </Link>
        <a className="footer-aya-link" href="https://ayafonds.nl/" target="_blank" rel="noopener noreferrer" aria-label="Bezoek AYA Fonds">
          <Image src="/img/AYAFonds/Embleem_logo_paars.svg" alt="AYA Fonds" width={148} height={125} />
        </a>
      </div>
      <div className="footer-feature-grid" aria-label="Aanbevolen links">
        {footerFeatures.map((item) => (
          <article className="footer-feature" key={item.href}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.title} openen`}>
              <Image src={item.image} alt={item.imageAlt} width={220} height={160} />
            </a>
            <div>
              <p className="eyebrow">{item.name}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
            <a className="footer-qr" href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.title} openen via QR-link`}>
              <Image src={item.qr} alt={item.qrAlt} width={112} height={112} />
            </a>
          </article>
        ))}
      </div>
      <p className="copyright">
        <span>
          &copy; {new Date().getFullYear()} Stuk Verdriet - Met liefde gebouwd door{" "}
          <a href="https://mnrv.nl" target="_blank" rel="noopener noreferrer">
            MNRV
          </a>
        </span>
        <a
          className="copyright-qr"
          href={gofundmeCampaignUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open de GoFundMe van Stuk Verdriet"
        >
          <Image src="/img/QRCODE_GFM.png" alt="QR-code voor de GoFundMe van Stuk Verdriet" width={92} height={92} />
        </a>
      </p>
    </footer>
  );
}

type CommunityAccountDockProps = {
  isLoggedIn: boolean;
  email?: string | null;
  currentUserId?: string | null;
  currentProfile?: CommunityProfile | null;
  discoverableProfiles?: CommunityProfile[];
  conversations?: CommunityConversation[];
  posts: CommunityPost[];
  hasSupabaseEnv: boolean;
};

type CommunityDockPanel = "menu" | "chats" | "notifications" | "account";

export function CommunityAccountDock({
  isLoggedIn,
  email,
  currentUserId,
  currentProfile,
  discoverableProfiles = [],
  conversations = [],
  posts,
  hasSupabaseEnv
}: CommunityAccountDockProps) {
  const [activePanel, setActivePanel] = useState<CommunityDockPanel>("account");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversations[0]?.id ?? null);
  const people = getCommunityPeople(posts, discoverableProfiles);
  const displayName = currentProfile?.display_name ?? email?.split("@")[0] ?? "Gast";
  const initials = authorInitial(displayName);
  const avatarUrl = currentProfile?.avatar_url ?? null;
  const loginHref = "/login?next=%2Fcommunity";
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0] ?? null;
  const activeParticipant = activeConversation ? getConversationPeer(activeConversation, currentUserId) : null;
  const activeMessages = [...(activeConversation?.community_messages ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(-6);

  function openPanel(panel: CommunityDockPanel) {
    setActivePanel((current) => (current === panel ? current : panel));
  }

  return (
    <aside className="community-account-dock" aria-label="Community account">
      <div className="community-dock-actions" aria-label="Community snelmenu">
        <button className={activePanel === "menu" ? "active" : undefined} type="button" onClick={() => openPanel("menu")} aria-label="Menu" aria-pressed={activePanel === "menu"}>
          <Grid3X3 size={21} aria-hidden />
        </button>
        <button className={activePanel === "chats" ? "active" : undefined} type="button" onClick={() => openPanel("chats")} aria-label="Berichten" aria-pressed={activePanel === "chats"}>
          <Image src="/img/icons_SNAAR/chat_icon/icons8-chat-48.png" alt="" width={22} height={22} />
        </button>
        <button className={activePanel === "notifications" ? "active" : undefined} type="button" onClick={() => openPanel("notifications")} aria-label="Meldingen" aria-pressed={activePanel === "notifications"}>
          <Image src="/img/icons_SNAAR/Bell_alerts/icons8-bell-50.png" alt="" width={22} height={22} />
        </button>
        <button className={activePanel === "account" ? "active profile" : "profile"} type="button" onClick={() => openPanel("account")} aria-label="Mijn profiel" aria-pressed={activePanel === "account"}>
          <ProfileAvatar name={displayName} avatarUrl={avatarUrl} />
          <ChevronDown size={14} aria-hidden />
        </button>
      </div>

      <div className="community-dock-panel">
        {activePanel === "menu" ? (
          <div className="community-panel-section">
            <div className="community-panel-heading">
              <h2>Menu</h2>
              <span>Community</span>
            </div>
            <Link className="community-panel-row primary" href={loginHref}>
              <User size={20} aria-hidden />
              <span>{isLoggedIn ? "Mijn profiel bekijken" : "Inloggen"}</span>
            </Link>
            <Link className="community-panel-row" href="#verhalen">
              <Grid3X3 size={20} aria-hidden />
              <span>Jouw Feed</span>
            </Link>
            <Link className="community-panel-row" href="#community-links">
              <Heart size={20} aria-hidden />
              <span>Handvatten</span>
            </Link>
          </div>
        ) : null}

        {activePanel === "chats" ? (
          <div className="community-panel-section community-chat-panel">
            <div className="community-panel-heading">
              <h2>Berichten</h2>
              <button type="button" aria-label="Nieuwe chat">
                <Edit3 size={18} aria-hidden />
              </button>
            </div>
            <label className="community-chat-search">
              <span className="sr-only">Zoeken in SNAAR berichten</span>
              <Search size={18} aria-hidden />
              <input type="search" placeholder="Zoeken in SNAAR" />
            </label>
            <div className="community-chat-list">
              {isLoggedIn && conversations.map((conversation) => {
                const peer = getConversationPeer(conversation, currentUserId);
                return (
                  <button className={activeConversation?.id === conversation.id ? "community-chat-person active" : "community-chat-person"} type="button" key={conversation.id} onClick={() => setActiveConversationId(conversation.id)}>
                    <ProfileAvatar name={peer?.display_name ?? "SNAAR"} avatarUrl={peer?.avatar_url ?? null} />
                    <span>
                      <strong>{peer?.display_name ?? "SNAAR gesprek"}</strong>
                      <small>{conversation.community_messages?.at(-1)?.body ?? "Nog geen berichten"}</small>
                    </span>
                  </button>
                );
              })}
              {isLoggedIn && !conversations.length ? <p className="community-panel-empty">Nog geen berichten. Start een gesprek met iemand uit de community.</p> : null}
              {people.map((person) => (
                <form action={startCommunityConversation} key={person.userId ?? person.name}>
                  <input type="hidden" name="return_to" value="/community" readOnly />
                  {person.userId ? <input type="hidden" name="participant_user_id" value={person.userId} readOnly /> : null}
                  <button className="community-chat-person" type="submit" disabled={!isLoggedIn || !person.userId}>
                    <ProfileAvatar name={person.name} avatarUrl={person.avatarUrl ?? null} />
                    <span>
                      <strong>{person.name}</strong>
                      <small>{isLoggedIn ? person.context : "Log in om prive te praten"}</small>
                    </span>
                  </button>
                </form>
              ))}
            </div>
            {isLoggedIn && activeConversation ? (
              <div className="community-message-thread" aria-label={`Gesprek met ${activeParticipant?.display_name ?? "communitylid"}`}>
                {activeMessages.length ? activeMessages.map((message) => (
                  <p className={message.sender_id === currentUserId ? "own" : undefined} key={message.id}>{message.body}</p>
                )) : <p>Nog geen berichten. Stuur de eerste rustige groet.</p>}
              </div>
            ) : null}
            <form className="community-chat-compose" action={activeConversation ? sendCommunityMessage.bind(null, activeConversation.id) : undefined}>
              <input type="hidden" name="return_to" value="/community" readOnly />
              <input name="body" placeholder={isLoggedIn && activeConversation ? "Schrijf een privebericht..." : "Log in om prive te chatten"} disabled={!isLoggedIn || !activeConversation} />
              {isLoggedIn && activeConversation ? (
                <button type="submit" aria-label="Verstuur bericht">
                  <Send size={17} aria-hidden />
                </button>
              ) : (
                <Link href={loginHref}>Inloggen</Link>
              )}
            </form>
          </div>
        ) : null}

        {activePanel === "notifications" ? (
          <div className="community-panel-section">
            <div className="community-panel-heading">
              <h2>Meldingen</h2>
              <span>Rustig overzicht</span>
            </div>
            <div className="community-notification-list">
              {isLoggedIn ? (
                <>
                  <p><strong>Nog geen nieuwe meldingen</strong><span>Als iemand reageert, steun geeft of jou een bericht stuurt, zie je dat hier.</span></p>
                  <p><strong>Profieltip</strong><span>Maak je profiel vindbaar als je openstaat voor rustig contact.</span></p>
                </>
              ) : (
                <p><strong>Meldingen na inloggen</strong><span>Log in om reacties, steun en priveberichten op een plek te volgen.</span></p>
              )}
            </div>
          </div>
        ) : null}

        {activePanel === "account" ? (
          <div className="community-panel-section">
            <div className="community-panel-heading">
              <h2>Mijn profiel</h2>
              <span>{isLoggedIn ? "Ingelogd" : "Gast"}</span>
            </div>
            <div className="community-account-summary">
              <ProfileAvatar name={displayName} avatarUrl={avatarUrl} large />
              <div>
                <strong>{isLoggedIn ? displayName : "Log in als je wilt reageren of delen."}</strong>
                <p>{isLoggedIn ? "Bepaal hoe je zichtbaar bent in de community. Je kunt je naam, profielfoto en vindbaarheid aanpassen." : "Je kunt rustig meelezen zonder account. Log in als je wilt reageren, steun geven of zelf iets delen."}</p>
              </div>
            </div>
            {isLoggedIn ? (
              <>
                <form className="community-profile-form" action={updateCommunityProfile}>
                  <input type="hidden" name="return_to" value="/community" readOnly />
                  <label>
                    Naam
                    <input name="display_name" defaultValue={displayName} maxLength={80} required />
                  </label>
                  <label>
                    Profielfoto
                    <input name="avatar_file" type="file" accept="image/png,image/jpeg,image/webp" />
                  </label>
                  <label className="community-checkbox-row">
                    <input name="is_discoverable" type="checkbox" defaultChecked={currentProfile?.is_discoverable ?? false} />
                    Vindbaar voor priveberichten
                  </label>
                  <button className="community-panel-button" type="submit">Profiel opslaan</button>
                </form>
                <form action={signOut}>
                  <input type="hidden" name="next" value="/community" readOnly />
                  <button className="community-panel-button secondary" type="submit">Uitloggen</button>
                </form>
              </>
            ) : (
              <Link className="community-panel-button" href={loginHref}>Inloggen om mee te doen</Link>
            )}
            {!hasSupabaseEnv ? <p className="small-note">Supabase env vars ontbreken nog.</p> : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function ProfileAvatar({ name, avatarUrl, large = false }: { name: string; avatarUrl?: string | null; large?: boolean }) {
  const className = large ? "community-profile-avatar large" : "community-profile-avatar";
  if (avatarUrl) return <Image className={className} src={avatarUrl} alt="" width={large ? 52 : 34} height={large ? 52 : 34} />;
  return <span className={className} aria-hidden>{authorInitial(name)}</span>;
}

function getConversationPeer(conversation: CommunityConversation, currentUserId?: string | null) {
  return conversation.community_conversation_participants
    ?.find((participant) => participant.user_id !== currentUserId)
    ?.community_profiles ?? null;
}

function getCommunityPeople(posts: CommunityPost[], profiles: CommunityProfile[]) {
  const people = new Map<string, { userId?: string; name: string; context: string; avatarUrl?: string | null }>();
  profiles.forEach((profile) => {
    people.set(profile.user_id, {
      userId: profile.user_id,
      name: profile.display_name,
      context: "Beschikbaar voor rustig contact",
      avatarUrl: profile.avatar_url
    });
  });
  posts.forEach((post) => {
    const name = displayAuthor(post.author_name, post.author_display_type);
    if (!people.has(name)) {
      people.set(name, {
        name,
        context: `${postTypeLabels[post.post_type ?? "story"]} over ${post.category}`
      });
    }
  });
  const collected = Array.from(people.values()).slice(0, 6);
  if (collected.length) return collected;
  return [
    { name: "SNAAR community", context: "Maak contact met lotgenoten" },
    { name: "Stuk Verdriet", context: "Vragen over reageren en delen" },
    { name: "Nieuwe gebruiker", context: "Log in om jezelf vindbaar te maken" }
  ];
}

export function GoFundMeSupportSection() {
  return (
    <section className="gofundme-support-section" id="gofundme" aria-label="Steun het gezin van Tycho">
      <div className="gofundme-support-inner">
        <div className="gofundme-widget-card gofundme-widget-card--goal">
          <div className="gofundme-widget-goal-frame">
            <iframe
              src={gofundmeGoalBarUrl}
              title="Doelbalk inzamelingsactie"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <iframe
            className="gofundme-widget-qr-inline"
            src={gofundmeQrCodeUrl}
            title="QR-code om te doneren"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

export function SocialLinksList({ links }: { links: SocialLinks }) {
  const entries = [
    { label: "Instagram", href: links.instagram_url, className: "social-instagram", icon: <Instagram size={18} aria-hidden /> },
    { label: "Spotify", href: links.spotify_url, className: "social-spotify", icon: <Music2 size={18} aria-hidden /> },
    { label: "Mail", href: `mailto:${site.email}`, className: "social-mail", icon: <Mail size={18} aria-hidden /> },
    { label: "TikTok", href: links.tiktok_url, className: "social-tiktok", icon: <TikTokIcon /> },
    { label: "YouTube Music", href: links.youtube_music_url, className: "social-youtube-music", icon: <Youtube size={19} aria-hidden /> }
  ].flatMap((entry): { className: string; href: string; icon: ReactNode; label: string }[] =>
    entry.href ? [{ ...entry, href: entry.href }] : []
  );

  if (!entries.length) return null;
  return (
    <div className="social-links brand-social-links" aria-label="Social media">
      {entries.map(({ className, href, icon, label }) => (
        <a className={`brand-social-link ${className}`} key={label} href={href} rel="noopener noreferrer" target={href.startsWith("mailto:") ? undefined : "_blank"} aria-label={label}>
          {icon}
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
}

export function Hero({ latest, episodes }: { latest: PodcastEpisode | null; episodes: PodcastEpisode[] }) {
  return <HeroSlider siteName={site.name} latest={latest} episodes={episodes} />;
}

export function EpisodeSignupSection({ status }: { status?: string | null }) {
  const feedback: Record<string, string> = {
    error: "Aanmelden lukte niet. Probeer het nog eens.",
    invalid: "Vul je naam en een geldig e-mailadres in.",
    "rate-limited": "Er zijn te veel aanmeldpogingen. Probeer het later opnieuw.",
    storage: "Aanmelden is nog niet gekoppeld aan Supabase.",
    subscribed: "Je staat op de lijst. We laten je weten wanneer aflevering 1 klaarstaat."
  };

  return (
    <section className="episode-signup-section" id="aanmelden" aria-labelledby="episode-signup-title">
      <div className="episode-signup-copy">
        <p className="eyebrow">Aflevering 1</p>
        <h2 id="episode-signup-title">Mis het niet!</h2>
        <p>Meld je aan en wees een van de eersten die aflevering 1 kan luisteren.</p>
      </div>
      <form className="episode-signup-form" action={subscribeEpisodeSignup}>
        <input type="hidden" name="source" value="homepage_episode_1" readOnly />
        <label>
          Naam
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          E-mailadres
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <button className="button" type="submit">Meld mij aan</button>
        {status ? <p className="signup-feedback">{feedback[status] ?? feedback.error}</p> : null}
      </form>
    </section>
  );
}

export function PodcastOnePagerSection({
  latest,
  seasons,
  episodes
}: {
  latest: PodcastEpisode | null;
  seasons: PodcastSeason[];
  episodes: PodcastEpisode[];
}) {
  const featured = latest ?? episodes[0] ?? null;

  if (!featured) return null;

  return (
    <section className="podcast-module" id="podcast" aria-labelledby="podcast-title">
      <h2 className="sr-only" id="podcast-title">Podcast</h2>
      <div className="podcast-shell">
        <div className="podcast-app">
          <div className="podcast-now">
            <div className="podcast-player-panel">
              <p className="eyebrow">Nieuwste aflevering</p>
              <h3>{featured.title}</h3>
              <EpisodeMeta episode={featured} />
              {featured.short_intro ? <p>{featured.short_intro}</p> : null}
              <ModernAudioPlayer episode={featured} showPlaceholderNote={false} />
              <PlatformLinks episode={featured} />
              <EpisodeLinkCards episode={featured} />
            </div>
          </div>
        </div>

        <div className="episode-queue">
          <div className="queue-header">
            <h3>Afleveringen</h3>
            <span>{seasons.length} seizoen</span>
          </div>
          <div className="episode-stack">
            {episodes.map((episode) => (
              <EpisodeQueueItem key={episode.id} episode={episode} active={episode.id === featured.id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SocialEmbedSection() {
  return (
    <section className="social-embed-section" aria-labelledby="social-embed-title">
      <div className="social-embed-inner">
        <div className="social-embed-heading">
          <p className="eyebrow">Volg mee</p>
          <h2 id="social-embed-title">Stuk Verdriet op Instagram en TikTok</h2>
        </div>

        <div className="social-embed-grid">
          <article className="social-embed-card">
            <div className="social-embed-card-header">
              <div>
                <p className="eyebrow">Instagram</p>
                <h3>@stukverdrietdepodcast</h3>
              </div>
              <SocialFollowTrigger platform="Instagram" href={podcastInstagramProfileUrl} />
            </div>
            <div className="social-embed-frame" aria-label="Instagram profiel van Stuk Verdriet">
              <blockquote
                className="instagram-media social-instagram-embed"
                data-instgrm-permalink={podcastInstagramProfileUrl}
                data-instgrm-version="14"
              >
                <a href={podcastInstagramProfileUrl} target="_blank" rel="noopener noreferrer">
                  Bekijk Stuk Verdriet op Instagram
                </a>
              </blockquote>
            </div>
          </article>

          <article className="social-embed-card">
            <div className="social-embed-card-header">
              <div>
                <p className="eyebrow">TikTok</p>
                <h3>@stuk.verdriet</h3>
              </div>
              <SocialFollowTrigger platform="TikTok" href={podcastTikTokProfileUrl} />
            </div>
            <div className="social-embed-frame" aria-label="TikTok profiel van Stuk Verdriet">
              <blockquote
                className="tiktok-embed social-tiktok-embed"
                cite={podcastTikTokProfileUrl}
                data-unique-id="stuk.verdriet"
                data-embed-type="creator"
              >
                <section>
                  <a target="_blank" href={`${podcastTikTokProfileUrl}?refer=creator_embed`} rel="noopener noreferrer">
                    @stuk.verdriet
                  </a>
                </section>
              </blockquote>
            </div>
          </article>
        </div>
      </div>
      <ConsentScript id="instagram-embed" src="https://www.instagram.com/embed.js" />
      <ConsentScript id="tiktok-embed" src="https://www.tiktok.com/embed.js" />
    </section>
  );
}

export function StickySpotifyPlayer({ episode }: { episode: PodcastEpisode | null }) {
  const spotifyEmbedUrl = episode?.spotify_url ? getSpotifyEmbedUrl(episode.spotify_url) : null;

  if (!episode || !spotifyEmbedUrl) return null;

  return (
    <aside className="sticky-spotify-player" aria-label={`Spotify-player voor ${episode.title}`}>
      <div>
        <p className="eyebrow">Speelt op Spotify</p>
        <h2>{episode.title}</h2>
      </div>
      <iframe
        title={`Spotify-player: ${episode.title}`}
        src={spotifyEmbedUrl}
        width="100%"
        height="80"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </aside>
  );
}

export function LatestEpisodeCard({ episode, compact = false }: { episode: PodcastEpisode; compact?: boolean }) {
  const audioUrl = getEpisodeAudioUrl(episode);

  return (
    <article className={compact ? "latest-card floating" : "latest-card"}>
      <div className="icon-disc">
        <Headphones aria-hidden />
      </div>
      <div>
        <p className="eyebrow">Nieuwste aflevering</p>
        <h2>{episode.title}</h2>
        <EpisodeMeta episode={episode} />
        {episode.short_intro ? <p>{episode.short_intro}</p> : null}
        <PlatformLinks episode={episode} />
        <EpisodeLinkCards episode={episode} />
      </div>
      <audio controls preload="metadata" src={audioUrl} />
      <Link className="text-link" href={`/podcast/${episode.slug}`}>
        Lees meer
      </Link>
    </article>
  );
}

export function ModernAudioPlayer({ episode, showPlaceholderNote = true }: { episode: PodcastEpisode; showPlaceholderNote?: boolean }) {
  const audioUrl = getEpisodeAudioUrl(episode);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(e.target.value);
    setVolume(nextVolume);
    if (audioRef.current) {
      audioRef.current.volume = nextVolume / 100;
    }
  };

  return (
    <div className="modern-player">
      <audio ref={audioRef} preload="metadata" src={audioUrl} />
      <div className="player-controls">
        <button onClick={togglePlay} aria-label={isPlaying ? "Pauzeer" : "Speel af"}>
          {isPlaying ? <Pause size={20} aria-hidden /> : <Play size={20} aria-hidden />}
        </button>
        <div className="player-progress" onClick={handleProgressClick}>
          <div className="progress-bar" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
        </div>
        <div className="player-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} aria-label="Volume" className="player-volume" />
      </div>
      {showPlaceholderNote && !episode.audio_file_url ? <p className="player-note">Testaudio: vervang deze placeholder zodra de echte aflevering klaarstaat.</p> : null}
    </div>
  );
}

function EpisodeQueueItem({ episode, active }: { episode: PodcastEpisode; active?: boolean }) {
  return (
    <article className={`queue-item${active ? " active" : ""}`}>
      <div className="queue-play">
        {getEpisodeAudioUrl(episode) ? <Play aria-hidden /> : <Headphones aria-hidden />}
      </div>
      <div>
        <p className="eyebrow">S{episode.season_number} - E{episode.episode_number}</p>
        <h3>{episode.title}</h3>
        <EpisodeMeta episode={episode} />
      </div>
      <div className="queue-actions">
        {getEpisodeAudioUrl(episode) ? <Download aria-hidden /> : null}
        {episode.next_episode_date ? <span>{formatDate(episode.next_episode_date)}</span> : null}
      </div>
    </article>
  );
}

export function EpisodeMeta({ episode }: { episode: PodcastEpisode }) {
  return (
    <p className="meta">
      Seizoen {episode.season_number}, aflevering {episode.episode_number}
      {episode.publication_date ? ` - ${formatDate(episode.publication_date)}` : ""}
      {episode.duration ? ` - ${episode.duration}` : ""}
    </p>
  );
}

export function PlatformLinks({ episode }: { episode: PodcastEpisode }) {
  const links = [
    ["Spotify", episode.spotify_url],
    ["Podimo", episode.podimo_url],
    ["Apple Podcasts", episode.apple_podcast_url]
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  if (!links.length) return null;
  return (
    <div className="platform-links">
      {links.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ))}
    </div>
  );
}

export function EpisodeLinkCards({ episode }: { episode: PodcastEpisode }) {
  const cards = episode.link_cards?.filter((card) => isMeaningfulLinkCard(card)) ?? [];
  if (!cards.length) return null;
  return (
    <div className="episode-link-card-grid">
      {cards.map((card, index) => (
        <a key={`${card.url}-${index}`} href={card.url} target="_blank" rel="noopener noreferrer">
          <span>{card.type}</span>
          <strong>{card.label}</strong>
          {card.description ? <small>{card.description}</small> : null}
        </a>
      ))}
    </div>
  );
}

function isMeaningfulLinkCard(card: PodcastEpisode["link_cards"][number]) {
  const label = card.label.trim().toLowerCase();
  const url = card.url.trim();
  if (!label || !url) return false;
  return !(label === "luister binnenkort" && (url === "#podcast" || url === "/podcast"));
}

export function EpisodeList({ seasons, episodes }: { seasons: PodcastSeason[]; episodes: PodcastEpisode[] }) {
  return (
    <div className="season-list">
      {seasons.map((season) => {
        const seasonEpisodes = episodes.filter((episode) => episode.season_number === season.season_number);
        if (!seasonEpisodes.length) return null;
        return (
          <section key={season.id} className="content-band">
            <div className="section-heading">
              <p className="eyebrow">Podcast</p>
              <h2>{season.title}</h2>
              {season.description ? <p>{season.description}</p> : null}
            </div>
            <div className="episode-grid">
              {seasonEpisodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function EpisodeCard({ episode }: { episode: PodcastEpisode }) {
  const audioUrl = getEpisodeAudioUrl(episode);

  return (
    <article className="episode-card">
      {episode.image_url ? <Image src={episode.image_url} alt="" width={720} height={540} /> : null}
      <div>
        <p className="eyebrow">Aflevering {episode.episode_number}</p>
        <h3>{episode.title}</h3>
        <EpisodeMeta episode={episode} />
        {episode.short_intro ? <p>{episode.short_intro}</p> : null}
        {episode.next_episode_date ? (
          <p className="small-note">
            <Calendar size={16} aria-hidden /> Volgende aflevering beschikbaar op {formatDate(episode.next_episode_date)}
          </p>
        ) : null}
        <audio controls preload="metadata" src={audioUrl} />
        {!episode.audio_file_url ? <p className="small-note">Testaudio: totdat de echte aflevering beschikbaar is.</p> : null}
        <PlatformLinks episode={episode} />
        <EpisodeLinkCards episode={episode} />
        <Link className="text-link" href={`/podcast/${episode.slug}`}>
          Lees meer
        </Link>
      </div>
    </article>
  );
}

export function CommunityCategoryGrid({ categories }: { categories: CommunityCategory[] }) {
  return <CategoryCarousel categories={categories} />;
}

const postTypeLabels: Record<NonNullable<CommunityPost["post_type"]>, string> = {
  story: "Verhaal",
  question: "Vraag",
  tip: "Tip",
  link: "Handige link"
};

const snaarIcons = {
  favoriteBefore: "/img/icons_SNAAR/favorite_before_click/icons8-favorite-48.png",
  favoriteAfter: "/img/icons_SNAAR/heart_taped/icons8-mending-heart-48.png",
  comment: "/img/icons_SNAAR/comment/icons8-comment-48.png",
  share: "/img/icons_SNAAR/share_arrow/icons8-forward-arrow-48.png"
};

export function CommunityPostCard({ post, showActions = false }: { post: CommunityPost; showActions?: boolean }) {
  const postType = post.post_type ?? "story";
  const authorName = displayAuthor(post.author_name, post.author_display_type);
  const postUrl = `/community/${post.slug}`;
  return (
    <article className="post-card community-post-card">
      <header className="community-post-author">
        <span className="community-avatar" aria-hidden>{authorInitial(authorName)}</span>
        <div>
          <strong>{authorName}</strong>
          <p>{postTypeLabels[postType]} - {post.category} - {formatDate(post.created_at)}</p>
        </div>
      </header>
      {post.image_url ? (
        <Image className="post-card-image" src={post.image_url} alt={`Afbeelding bij ${post.title}`} width={720} height={420} />
      ) : null}
      <h3>
        <Link href={`/community/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="community-post-body">{post.body}</p>
      {post.resource_url ? (
        <a className="community-resource-link" href={post.resource_url} target="_blank" rel="noopener noreferrer">
          {post.resource_label ?? "Bekijk gedeelde link"}
        </a>
      ) : null}
      {post.tags?.length ? (
        <div className="community-tag-list" aria-label="Tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <div className="post-meta community-engagement-row">
        <span><Image src={snaarIcons.favoriteAfter} alt="" width={16} height={16} /> {post.support_count} steun</span>
        <span>{post.reply_count} reacties</span>
      </div>
      <div className="community-card-actions" role="group" aria-label="Berichtacties">
        {showActions ? (
          <form action={supportPost.bind(null, post.id)}>
            <button className="community-post-action" type="submit">
              <Image src={snaarIcons.favoriteBefore} alt="" width={21} height={21} />
              Steun
            </button>
          </form>
        ) : (
          <Link className="community-post-action" href={`/login?next=${encodeURIComponent(postUrl)}`}>
            <Image src={snaarIcons.favoriteBefore} alt="" width={21} height={21} />
            Steun
          </Link>
        )}
        <Link className="community-post-action" href={postUrl}>
          <Image src={snaarIcons.comment} alt="" width={21} height={21} />
          Reageer
        </Link>
        <SharePostButton postUrl={postUrl} title={post.title} />
      </div>
      <div className="community-inline-comment">
        <span className="community-avatar community-avatar-small" aria-hidden>{showActions ? "J" : "S"}</span>
        {showActions ? (
          <Link href={postUrl}>Schrijf een reactie...</Link>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(postUrl)}`}>Log in om te reageren...</Link>
        )}
      </div>
    </article>
  );
}

export function CommunityFeedback({ submitted, error }: { submitted?: boolean; error?: string | null }) {
  if (submitted) return <p className="notice" role="status" aria-live="polite">Je verhaal is ontvangen en staat klaar voor moderatie.</p>;
  if (!error) return null;
  const messages: Record<string, string> = {
    "community-images": "Uploaden van de afbeelding is niet gelukt. Probeer een kleiner bestand of plaats je bericht zonder afbeelding.",
    image: "De afbeelding moet JPG, JPEG, PNG of WEBP zijn en maximaal 4 MB groot zijn.",
    "missing-fields": "Controleer of titel, categorie en bericht zijn ingevuld.",
    storage: "Afbeeldingen uploaden is nog niet goed gekoppeld. Controleer de Supabase Storage bucket.",
    supabase: "Community plaatsen vereist Supabase-configuratie."
  };
  return <p className="notice" role="alert">{messages[error] ?? "Controleer de invoer en probeer het opnieuw."}</p>;
}

export function CommunityStoryForm({
  categories,
  isLoggedIn,
  returnTo = "/community"
}: {
  categories: CommunityCategory[];
  isLoggedIn: boolean;
  returnTo?: "/community" | "/bijsluiter";
}) {
  if (!isLoggedIn) {
    return (
      <div className="story-form login-required-panel">
        <p>
          Stuk Verdriet is een plek voor verhalen en vragen over rouw, verlies, ziekte, gemis en verder leven. Lees voor
          je meedoet de <Link href="/communityrichtlijnen">communityrichtlijnen</Link>.
        </p>
        <Link className="button" href={`/login?next=${encodeURIComponent(returnTo)}`}>
          Log in om te posten
        </Link>
      </div>
    );
  }

  return (
    <form className="form-grid story-form" action={createCommunityPost} encType="multipart/form-data">
      <input type="hidden" name="return_to" value={returnTo} readOnly />
      <label>
        Wat wil je delen?
        <select name="post_type" defaultValue="story">
          <option value="story">Mijn verhaal</option>
          <option value="question">Een vraag</option>
          <option value="tip">Tip of handvat</option>
          <option value="link">Handige link</option>
        </select>
      </label>
      <label>
        Titel
        <input name="title" required />
      </label>
      <label>
        Categorie
        <select name="category" required>
          {categories.map((category) => (
            <option key={category.id}>{category.title}</option>
          ))}
        </select>
      </label>
      <label>
        Zichtbare naam
        <select name="author_display_type" defaultValue="first_name">
          <option value="first_name">Voornaam</option>
          <option value="real_name">Volledige naam</option>
          <option value="anonymous">Anoniem</option>
        </select>
      </label>
      <label>
        Voor wie is dit vooral?
        <select name="target_group" defaultValue="">
          <option value="">Iedereen</option>
          <option value="ouders">Ouders</option>
          <option value="ayas">AYA&apos;s en jonge mensen</option>
          <option value="naasten">Naasten en familie</option>
          <option value="vrienden">Vrienden en omgeving</option>
        </select>
      </label>
      <label>
        Handige link
        <input name="resource_url" type="url" placeholder="https://..." />
        <small>Optioneel. Deel bijvoorbeeld een hulporganisatie, artikel, boek of praktische bron.</small>
      </label>
      <label>
        Linktekst
        <input name="resource_label" placeholder="Bijvoorbeeld: Rouwzorg Nederland" />
      </label>
      <label>
        Tags
        <input name="tags" placeholder="rouw, praktische hulp, herkenning" />
        <small>Optioneel. Scheid tags met komma&apos;s.</small>
      </label>
      <label>
        Afbeelding
        <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" />
        <small>Optioneel. Maximaal 4 MB. JPG, JPEG, PNG of WEBP.</small>
      </label>
      <label>
        Bericht
        <textarea name="body" required />
      </label>
      <CommunitySubmitButton />
    </form>
  );
}

function SharePostButton({ postUrl, title }: { postUrl: string; title: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const sharePost = async () => {
    const url = new URL(postUrl, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setFeedback("Gedeeld");
        return;
      }
      await navigator.clipboard.writeText(url);
      setFeedback("Link gekopieerd");
    } catch {
      setFeedback(null);
    }
  };

  return (
    <button className="community-post-action" type="button" onClick={sharePost} aria-label={`Deel ${title}`}>
      <Image src={snaarIcons.share} alt="" width={21} height={21} />
      <span>{feedback ?? "Deel"}</span>
    </button>
  );
}

function CommunitySubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Wordt verstuurd..." : "Verstuur ter goedkeuring"}
    </button>
  );
}

export function HostCard({ host }: { host: HostProfile }) {
  const hostName = host.name.toLowerCase();
  const isSusan = hostName.includes("susan");
  const isDaniela = hostName.includes("daniela");
  const familyCard = isSusan
    ? {
        deck: "Eva, dochter van Susan, blijft aanwezig in haar verhaal, humor en manier van leven.",
        image: "/img/EVA_PORTRET.jpg",
        imageAlt: "Portret van Eva",
        name: "Eva",
        relation: "Dochter van Susan",
        storyKey: "eva" as const
      }
    : isDaniela
      ? {
          deck: "Tycho, zoon van Daniela, leeft voort in liefde, herinneringen en alles wat hij in beweging bracht.",
          image: "/img/TYCHO_PORTRET.jpg",
          imageAlt: "Portret van Tycho",
          name: "Tycho",
          relation: "Zoon van Daniela",
          storyKey: "tycho" as const
        }
      : null;
  const imageUrl = hostName.includes("susan")
    ? "/img/portretsuus.png"
    : hostName.includes("daniela")
      ? "/img/Portret_Daniela.jpeg"
      : host.image_url || null;

  return (
    <article className="host-card">
      {imageUrl ? <Image src={imageUrl} alt={host.name} width={720} height={540} /> : <div className="host-placeholder" aria-hidden />}
      <div>
        <p className="eyebrow">{host.role ?? "Team"}</p>
        <h3>{host.name}</h3>
        {host.bio ? <p>{host.bio}</p> : null}
        {host.personal_motivation ? <p>{host.personal_motivation}</p> : null}
        {isSusan ? <SusanStoryPopout /> : null}
        {isDaniela ? <DanielaStoryPopout /> : null}
      </div>
      {familyCard ? (
        <div className="host-family-card">
          <Image src={familyCard.image} alt={familyCard.imageAlt} width={360} height={360} />
          <div>
            <p className="eyebrow">{familyCard.relation}</p>
            <h3>{familyCard.name}</h3>
            <p>{familyCard.deck}</p>
            <div className="host-family-card-actions">
              <FamilyStoryPopout storyKey={familyCard.storyKey} />
              {familyCard.storyKey === "tycho" ? (
                <a className="button" href={tychoSupportUrl} target="_blank" rel="noopener noreferrer">
                  Steun Tycho&apos;s inzamelingsactie
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function Icon({ name }: { name: CommunityCategory["icon"] }) {
  const props = { size: 28, "aria-hidden": true };
  const icon = {
    heart: <Heart {...props} />,
    users: <Users {...props} />,
    user: <User {...props} />,
    leaf: <Leaf {...props} />,
    message: <MessageCircle {...props} />,
    star: <Star {...props} />,
    shield: <Shield {...props} />
  }[name];
  return <div className="line-icon">{icon}</div>;
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children}
    </section>
  );
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function displayAuthor(name: string | null, type: string) {
  if (type === "anonymous") return "Anoniem";
  if (type === "first_name" && name) return name.split(" ")[0];
  return name ?? "Communitylid";
}

function authorInitial(name: string) {
  return (name.trim()[0] ?? "S").toUpperCase();
}

function getSpotifyEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname !== "open.spotify.com") return value;
    if (!url.pathname.startsWith("/embed/")) {
      url.pathname = `/embed${url.pathname}`;
    }
    url.search = "";
    return url.toString();
  } catch {
    return value;
  }
}

function getEpisodeAudioUrl(episode: PodcastEpisode) {
  return episode.audio_file_url || podcastPlaceholderAudioUrl;
}
