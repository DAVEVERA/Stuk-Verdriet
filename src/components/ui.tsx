'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useRef, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Download,
  Edit3,
  Grid3X3,
  Headphones,
  Heart,
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
} from 'lucide-react';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { ConsentScript } from '@/components/ConsentScript';
import { DanielaStoryPopout } from '@/components/DanielaStoryPopout';
import { FamilyStoryPopout } from '@/components/FamilyStoryPopout';
import { HeroSlider } from '@/components/HeroSlider';
import { SusanStoryPopout } from '@/components/SusanStoryPopout';
import { SocialFollowTrigger } from '@/components/SocialFollowTrigger';
import { useSectionContrast } from '@/hooks/useSectionContrast';
import {
  createCommunityReply,
  reportCommunityContent,
  sendCommunityMessage,
  signOut,
  startCommunityConversation,
  supportPost,
  subscribeEpisodeSignup,
  updateCommunityProfile,
} from '@/lib/actions';
import { navigation, site } from '@/lib/site';
import type {
  CommunityCategory,
  CommunityConversation,
  CommunityPost,
  CommunityProfile,
  CommunityReply,
  HostProfile,
  PodcastEpisode,
  PodcastSeason,
  SocialLinks,
} from '@/types/content';

const podcastPlaceholderAudioUrl = '/audio/podcast-placeholder.wav';
const podcastInstagramProfileUrl = 'https://www.instagram.com/stukverdrietdepodcast/';
const podcastTikTokProfileUrl = 'https://www.tiktok.com/@stuk.verdriet';
const tychoSupportUrl = 'https://radboudoncologiefonds.voorradboudfonds.nl/project/tycho';
const gofundmeCampaignUrl =
  'https://www.gofundme.com/f/help-ons-stichting-stuk-verdriet-werkelijkheid-maken';
const gofundmeGoalBarUrl =
  'https://www.gofundme.com/f/help-ons-stichting-stuk-verdriet-werkelijkheid-maken/stream-goal-bar?locale=nl-NL&utm_campaign=fp_sharesheet&utm_medium=customer&utm_source=streaming_widget&attribution_id=sl%3A97015f3d-044e-4a74-9b31-eeef61482df3';
const gofundmeQrCodeUrl =
  'https://www.gofundme.com/f/help-ons-stichting-stuk-verdriet-werkelijkheid-maken/stream-qr-code?locale=nl-NL&utm_campaign=fp_sharesheet&utm_medium=customer&utm_source=streaming_widget&attribution_id=sl%3A97015f3d-044e-4a74-9b31-eeef61482df3';

export function Footer({ socialLinks: _socialLinks, logoUrl }: { socialLinks: SocialLinks; logoUrl?: string }) {
  const pathname = usePathname();
  const isCommunityPage = pathname === '/community';
  const footerLogo = isCommunityPage ? '/img/icons_SNAAR/snaar_cirkel.png' : logoUrl || site.logo;
  const footerNavigation = isCommunityPage
    ? navigation.filter((item) => item.href !== '/podcast' && item.href !== '/community')
    : navigation;
  const footerFeatures = [
    {
      title: 'Longeneeslijk',
      name: 'Eva Hermans-Kroot',
      text: 'Het boek van Eva Kroot over leven met kanker, pech en geluk.',
      href: 'https://www.thema.nl/boek-longeneeslijk/',
      image: '/footer/longeneeslijk.jpg',
      imageAlt: 'Boekomslag Longeneeslijk van Eva Hermans-Kroot',
      qr: '/qr/longeneeslijk-thema.png',
      qrAlt: 'QR-code naar het boek Longeneeslijk bij Thema',
    },
    {
      title: 'Onvergetelijk',
      name: 'Matthijs Hermans',
      text: 'Een jaar later, over Eva, gemis en het fijne van herinneren.',
      href: 'https://www.thema.nl/boek-onvergetelijk/',
      image: '/footer/onvergetelijk.jpg',
      imageAlt: 'Boekomslag Onvergetelijk van Matthijs Hermans en Hanneke Mijnster',
      qr: '/qr/onvergetelijk-thema.png',
      qrAlt: 'QR-code naar het boek Onvergetelijk bij Thema',
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-brand">
        <Image src={footerLogo} alt="" width={76} height={76} />
        <h2>{site.name}</h2>
        <p className="slogan-text">{site.tagline}</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigatie">
        {footerNavigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
        <Link href="/bedrijfsgegevens">Bedrijfsgegevens</Link>
        <Link href="/retourbeleid">Retourbeleid</Link>
        <Link href="/herroepingsformulier">Herroepingsformulier</Link>
        <Link href="/herroepen">Aankoop herroepen</Link>
        <Link href="/levering-betaling">Levering en betaling</Link>
        <Link href="/garantie-klachten">Garantie en klachten</Link>
        <Link href="/privacy">Privacyverklaring</Link>
        <Link href="/verwerkers">Verwerkers</Link>
        <Link href="/bewaartermijnen">Bewaartermijnen</Link>
        <Link href="/communityrichtlijnen">Communityrichtlijnen</Link>
        <Link href="/cookies">Cookieverklaring</Link>
        <Link href="/webshop-faq">Webshop FAQ</Link>
      </nav>
      <div className="footer-contact">
        <a className="quiet-link" href={`mailto:${site.email}`}>
          <Mail size={18} aria-hidden /> {site.email}
        </a>
        <Link className="quiet-link footer-optout-link" href="/afmelden">
          Afmelden of gegevens verwijderen
        </Link>
        <a
          className="footer-aya-link"
          href="https://ayafonds.nl/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bezoek AYA Fonds"
        >
          <Image
            src="/img/AYAFonds/Embleem_logo_paars.svg"
            alt="AYA Fonds"
            width={148}
            height={125}
          />
        </a>
      </div>
      <div className="footer-feature-grid" aria-label="Aanbevolen links">
        {footerFeatures.map((item) => (
          <article className="footer-feature" key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.title} openen`}
            >
              <Image src={item.image} alt={item.imageAlt} width={220} height={160} />
            </a>
            <div>
              <p className="eyebrow">{item.name}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
            <a
              className="footer-qr"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.title} openen via QR-link`}
            >
              <Image src={item.qr} alt={item.qrAlt} width={112} height={112} />
            </a>
          </article>
        ))}
      </div>
      <p className="copyright">
        <span>
          &copy; {new Date().getFullYear()} Stuk Verdriet - Developer{' '}
          <a href="https://mnrv.nl" target="_blank" rel="noopener noreferrer">
            MNRV
          </a>
          {' · Tailored by DV'}
        </span>
        {isCommunityPage ? null : (
          <a
            className="copyright-qr"
            href={gofundmeCampaignUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open de GoFundMe van Stuk Verdriet"
          >
            <Image
              src="/img/QRCODE_GFM.png"
              alt="QR-code voor de GoFundMe van Stuk Verdriet"
              width={92}
              height={92}
            />
          </a>
        )}
      </p>
    </footer>
  );
}

type CommunityAccountDockProps = {
  isLoggedIn: boolean;
  email?: string | null;
  currentUserId?: string | null;
  currentProfile?: CommunityProfile | null;
  hasSupabaseEnv: boolean;
};

type CommunityDockPanel = 'menu' | 'chats' | 'notifications' | 'account';

const communityChatErrors: Record<string, string> = {
  'chat-target': 'Kies een vindbaar communityprofiel om een gesprek te starten.',
  'chat-service': 'De berichtenservice is tijdelijk niet beschikbaar.',
  'chat-create': 'Het gesprek kon niet worden aangemaakt. Probeer het opnieuw.',
  message: 'Schrijf een bericht van maximaal 2000 tekens.',
  'message-send':
    'Het bericht kon niet worden verzonden. Controleer of je nog deelnemer bent aan dit gesprek.',
};

export function CommunityAccountDock({
  isLoggedIn,
  email,
  currentUserId,
  currentProfile,
  hasSupabaseEnv,
}: CommunityAccountDockProps) {
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('conversation');
  const chatError = searchParams.get('error');
  const [activePanel, setActivePanel] = useState<CommunityDockPanel | null>(
    selectedConversationId ? 'chats' : null
  );
  const [collapsed, setCollapsed] = useState(false);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const isOnLight = useSectionContrast(dockRef);
  const [liveConversations, setLiveConversations] = useState<CommunityConversation[]>([]);
  const [liveDiscoverableProfiles, setLiveDiscoverableProfiles] = useState<CommunityProfile[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    selectedConversationId ?? null
  );
  const [chatSearch, setChatSearch] = useState('');
  const displayName = currentProfile?.display_name ?? email?.split('@')[0] ?? 'Gast';
  const initials = authorInitial(displayName);
  const avatarUrl = currentProfile?.avatar_url ?? null;
  const loginHref = '/login?next=%2Fcommunity';
  const activeConversation = activeConversationId
    ? (liveConversations.find((conversation) => conversation.id === activeConversationId) ?? null)
    : null;
  const activeParticipant = activeConversation
    ? getConversationPeer(activeConversation, currentUserId)
    : null;
  const activeMessages = [...(activeConversation?.community_messages ?? [])]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-50);
  const chatErrorMessage = chatError ? communityChatErrors[chatError] : null;
  const normalizedChatSearch = chatSearch.trim().toLocaleLowerCase('nl-NL');
  const conversationPeers = new Set(
    liveConversations
      .map((conversation) => getConversationPeer(conversation, currentUserId)?.user_id)
      .filter((value): value is string => Boolean(value))
  );
  const visibleConversations = liveConversations.filter((conversation) => {
    if (!normalizedChatSearch) return true;
    const peer = getConversationPeer(conversation, currentUserId);
    const lastMessage = conversation.community_messages?.at(-1)?.body ?? '';
    return `${peer?.display_name ?? ''} ${lastMessage}`
      .toLocaleLowerCase('nl-NL')
      .includes(normalizedChatSearch);
  });
  const visibleProfiles = liveDiscoverableProfiles.filter((profile) => {
    if (conversationPeers.has(profile.user_id)) return false;
    if (!normalizedChatSearch) return true;
    return profile.display_name.toLocaleLowerCase('nl-NL').includes(normalizedChatSearch);
  });

  async function fetchDockData() {
    if (!isLoggedIn) return;
    try {
      const response = await fetch('/api/community/dock-data');
      if (!response.ok) return;
      const data = (await response.json()) as {
        discoverableProfiles?: CommunityProfile[];
        conversations?: CommunityConversation[];
      };
      if (data.conversations) setLiveConversations(data.conversations);
      if (data.discoverableProfiles) setLiveDiscoverableProfiles(data.discoverableProfiles);
    } catch {
      // stil falen; het paneel toont dan de laatst bekende (mogelijk lege) data
    }
  }

  useEffect(() => {
    if (!isLoggedIn || activePanel !== 'chats') return;
    const refreshTimer = window.setInterval(() => void fetchDockData(), 12000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDockData();
    return () => window.clearInterval(refreshTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePanel, isLoggedIn]);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 820px)').matches;
    if (!isMobile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(true);
  }, []);

  function openPanel(panel: CommunityDockPanel) {
    setActivePanel((current) => {
      const nextPanel = current === panel ? null : panel;
      setCollapsed(nextPanel === null && window.matchMedia('(max-width: 820px)').matches);
      return nextPanel;
    });
  }

  const isDockCollapsed = collapsed && !activePanel;

  const dockActions = (
    <div className="community-dock-actions" aria-label="Community snelmenu">
      <button
        className={activePanel === 'account' ? 'active profile' : 'profile'}
        type="button"
        onClick={() => openPanel('account')}
        aria-label="Mijn profiel"
        aria-pressed={activePanel === 'account'}
      >
        <User size={21} aria-hidden />
        <ChevronDown size={14} aria-hidden />
      </button>
      <button
        className={activePanel === 'notifications' ? 'active' : undefined}
        type="button"
        onClick={() => openPanel('notifications')}
        aria-label="Meldingen"
        aria-pressed={activePanel === 'notifications'}
      >
        <Image
          src="/img/icons_SNAAR/Bell_alerts/icons8-bell-50.png"
          alt=""
          width={22}
          height={22}
        />
      </button>
      <button
        className={activePanel === 'chats' ? 'active' : undefined}
        type="button"
        onClick={() => openPanel('chats')}
        aria-label="Messenger"
        aria-pressed={activePanel === 'chats'}
      >
        <Image
          src="/img/icons_SNAAR/chat_icon/icons8-chat-48.png"
          alt=""
          width={22}
          height={22}
        />
      </button>
      <button
        className={activePanel === 'menu' ? 'active' : undefined}
        type="button"
        onClick={() => openPanel('menu')}
        aria-label="Mijn feed"
        aria-pressed={activePanel === 'menu'}
      >
        <Grid3X3 size={21} aria-hidden />
      </button>
    </div>
  );

  const dockClassName = [
    'community-account-dock',
    isDockCollapsed ? 'collapsed' : null,
    isOnLight ? 'is-on-light' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={dockRef} className={dockClassName} role="group" aria-label="Community account">
      <button
        className="community-dock-fab"
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label="Open communitymenu"
        tabIndex={isDockCollapsed ? 0 : -1}
      >
        <Grid3X3 size={20} aria-hidden />
      </button>
      {dockActions}

      {activePanel ? (
        <div
          className={
            activePanel === 'chats'
              ? `community-dock-panel community-dock-panel-chat${activeConversation ? ' has-active-conversation' : ''}`
              : 'community-dock-panel'
          }
        >
          {activePanel === 'menu' ? (
            <div className="community-panel-section">
              <div className="community-panel-heading">
                <h2>Menu</h2>
                <span>Community</span>
              </div>
              <Link
                className="community-panel-row primary"
                href={isLoggedIn ? '/community/profiel' : loginHref}
              >
                <User size={20} aria-hidden />
                <span>{isLoggedIn ? 'Mijn profiel bekijken' : 'Inloggen'}</span>
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

          {activePanel === 'chats' ? (
            <div className="community-panel-section community-chat-panel">
              <div className="community-panel-heading">
                <button
                  type="button"
                  className="community-chat-back"
                  aria-label="Sluit berichten"
                  onClick={() => setActivePanel(null)}
                >
                  <ChevronLeft size={22} aria-hidden />
                </button>
                <h2>
                  {activeConversation
                    ? (activeParticipant?.display_name ?? 'Bericht')
                    : 'Berichten'}
                </h2>
                <button
                  type="button"
                  aria-label="Nieuwe chat"
                  onClick={() => setActiveConversationId(null)}
                >
                  <Edit3 size={18} aria-hidden />
                </button>
              </div>
              {chatErrorMessage ? (
                <p className="community-panel-alert">{chatErrorMessage}</p>
              ) : null}
              <label className="community-chat-search">
                <span className="sr-only">Zoeken in SNAAR berichten</span>
                <Search size={18} aria-hidden />
                <input
                  type="search"
                  placeholder="Zoeken in SNAAR"
                  value={chatSearch}
                  onChange={(event) => setChatSearch(event.target.value)}
                />
              </label>
              <div className="community-chat-list">
                {isLoggedIn &&
                  visibleConversations.map((conversation) => {
                    const peer = getConversationPeer(conversation, currentUserId);
                    return (
                      <button
                        className={
                          activeConversation?.id === conversation.id
                            ? 'community-chat-person active'
                            : 'community-chat-person'
                        }
                        type="button"
                        key={conversation.id}
                        onClick={() => setActiveConversationId(conversation.id)}
                      >
                        <ProfileAvatar
                          name={peer?.display_name ?? 'SNAAR'}
                          avatarUrl={peer?.avatar_url ?? null}
                        />
                        <span>
                          <strong>{peer?.display_name ?? 'SNAAR gesprek'}</strong>
                          <small>
                            {conversation.community_messages?.at(-1)?.body ?? 'Nog geen berichten'}
                          </small>
                        </span>
                      </button>
                    );
                  })}
                {isLoggedIn && !liveConversations.length ? (
                  <p className="community-panel-empty">
                    Nog geen gesprekken. Kies hieronder iemand die openstaat voor contact.
                  </p>
                ) : null}
                {isLoggedIn && !liveDiscoverableProfiles.length ? (
                  <p className="community-panel-empty">
                    Er zijn nog geen andere vindbare profielen. Zet je eigen profiel op vindbaar en
                    nodig anderen uit om hetzelfde te doen.
                  </p>
                ) : null}
                {isLoggedIn && visibleProfiles.length ? (
                  <p className="community-chat-list-label">Nieuw gesprek</p>
                ) : null}
                {visibleProfiles.map((person) => (
                  <form action={startCommunityConversation} key={person.user_id}>
                    <input type="hidden" name="return_to" value="/community" readOnly />
                    <input
                      type="hidden"
                      name="participant_user_id"
                      value={person.user_id}
                      readOnly
                    />
                    <button className="community-chat-person" type="submit" disabled={!isLoggedIn}>
                      <ProfileAvatar
                        name={person.display_name}
                        avatarUrl={person.avatar_url ?? null}
                      />
                      <span>
                        <strong>{person.display_name}</strong>
                        <small>Beschikbaar voor rustig contact</small>
                      </span>
                    </button>
                  </form>
                ))}
                {isLoggedIn &&
                normalizedChatSearch &&
                !visibleConversations.length &&
                !visibleProfiles.length ? (
                  <p className="community-panel-empty">
                    Geen gesprekken of vindbare profielen gevonden.
                  </p>
                ) : null}
              </div>
              {isLoggedIn && activeConversation ? (
                <div
                  className="community-message-thread"
                  aria-label={`Gesprek met ${activeParticipant?.display_name ?? 'communitylid'}`}
                >
                  {activeMessages.length ? (
                    activeMessages.map((message) => (
                      <p
                        className={message.sender_id === currentUserId ? 'own' : undefined}
                        key={message.id}
                      >
                        {message.body}
                      </p>
                    ))
                  ) : (
                    <p>Nog geen berichten. Stuur de eerste rustige groet.</p>
                  )}
                </div>
              ) : null}
              {isLoggedIn && activeConversation ? (
                <form
                  className="community-chat-compose"
                  action={sendCommunityMessage.bind(null, activeConversation.id)}
                >
                  <input type="hidden" name="return_to" value="/community" readOnly />
                  <input
                    name="body"
                    placeholder="Schrijf een privebericht..."
                    maxLength={2000}
                    required
                  />
                  <button type="submit" aria-label="Verstuur bericht">
                    <Send size={17} aria-hidden />
                  </button>
                </form>
              ) : isLoggedIn ? (
                <div className="community-chat-compose is-empty">
                  <span>Kies een gesprek of start hierboven een nieuw gesprek.</span>
                </div>
              ) : (
                <div className="community-chat-compose is-empty">
                  <span>Log in om prive te chatten.</span>
                  <Link href={loginHref}>Inloggen</Link>
                </div>
              )}
            </div>
          ) : null}

          {activePanel === 'notifications' ? (
            <div className="community-panel-section">
              <div className="community-panel-heading">
                <h2>Meldingen</h2>
              </div>
              <div className="community-notification-list">
                {isLoggedIn ? (
                  <>
                    <p>
                      <strong>Nog geen nieuwe meldingen</strong>
                      <span>
                        Als iemand reageert, steun geeft of jou een bericht stuurt, zie je dat hier.
                      </span>
                    </p>
                    <p>
                      <strong>Profieltip</strong>
                      <span>Maak je profiel vindbaar als je openstaat voor rustig contact.</span>
                    </p>
                  </>
                ) : (
                  <p>
                    <strong>Meldingen na inloggen</strong>
                    <span>Log in om reacties, steun en priveberichten op een plek te volgen.</span>
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {activePanel === 'account' ? (
            <div className="community-panel-section">
              <div className="community-panel-heading">
                <h2>Mijn profiel</h2>
                <span>{isLoggedIn ? 'Ingelogd' : 'Gast'}</span>
              </div>
              <div className="community-account-summary">
                <ProfileAvatar name={displayName} avatarUrl={avatarUrl} large />
                <div>
                  <strong>
                    {isLoggedIn ? displayName : 'Log in als je wilt reageren of delen.'}
                  </strong>
                  {!isLoggedIn ? (
                    <p>
                      Je kunt rustig meelezen zonder account. Log in als je wilt reageren, steun
                      geven of zelf iets delen.
                    </p>
                  ) : null}
                </div>
              </div>
              {isLoggedIn ? (
                <>
                  <Link className="community-panel-row" href="/community/profiel">
                    <User size={20} aria-hidden />
                    <span>Open mijn profielpagina</span>
                  </Link>
                  <form
                    className="community-profile-form"
                    action={updateCommunityProfile}
                    encType="multipart/form-data"
                  >
                    <input type="hidden" name="return_to" value="/community" readOnly />
                    <label>
                      Naam
                      <input
                        name="display_name"
                        defaultValue={displayName}
                        maxLength={80}
                        required
                      />
                    </label>
                    <label>
                      Profielfoto
                      <input
                        name="avatar_file"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                      />
                    </label>
                    <label className="community-checkbox-row">
                      <input
                        name="is_discoverable"
                        type="checkbox"
                        defaultChecked={currentProfile?.is_discoverable ?? false}
                      />
                      Vindbaar voor priveberichten
                    </label>
                    <button className="community-panel-button" type="submit">
                      Profiel opslaan
                    </button>
                  </form>
                  <form action={signOut}>
                    <input type="hidden" name="next" value="/community" readOnly />
                    <button className="community-panel-button secondary" type="submit">
                      Uitloggen
                    </button>
                  </form>
                </>
              ) : (
                <Link className="community-panel-button" href={loginHref}>
                  Inloggen om mee te doen
                </Link>
              )}
              {!hasSupabaseEnv ? (
                <p className="small-note">De communityservice is tijdelijk niet beschikbaar.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ProfileAvatar({
  name,
  avatarUrl,
  large = false,
}: {
  name: string;
  avatarUrl?: string | null;
  large?: boolean;
}) {
  const className = large ? 'community-profile-avatar large' : 'community-profile-avatar';
  if (avatarUrl)
    return (
      <Image
        className={className}
        src={avatarUrl}
        alt=""
        width={large ? 52 : 34}
        height={large ? 52 : 34}
      />
    );
  return (
    <span className={className} aria-hidden>
      {authorInitial(name)}
    </span>
  );
}

function getConversationPeer(conversation: CommunityConversation, currentUserId?: string | null) {
  const rawProfile =
    conversation.community_conversation_participants?.find(
      (participant) => participant.user_id !== currentUserId
    )?.community_profiles ?? null;
  return Array.isArray(rawProfile) ? (rawProfile[0] ?? null) : rawProfile;
}

export function GoFundMeSupportSection() {
  return (
    <section
      className="gofundme-support-section"
      id="gofundme"
      aria-label="Steun het gezin van Tycho"
    >
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
    {
      label: 'Instagram',
      href: links.instagram_url,
      className: 'social-instagram',
      icon: <Image src="/img/instagram.png" alt="" width={18} height={18} />,
    },
    {
      label: 'Facebook',
      href: links.facebook_url,
      className: 'social-facebook',
      icon: <Image src="/img/facebook.png" alt="" width={18} height={18} />,
    },
    {
      label: 'Spotify',
      href: links.spotify_url,
      className: 'social-spotify',
      icon: <Music2 size={18} aria-hidden />,
    },
    {
      label: 'Mail',
      href: `mailto:${site.email}`,
      className: 'social-mail',
      icon: <Mail size={18} aria-hidden />,
    },
    {
      label: 'TikTok',
      href: links.tiktok_url,
      className: 'social-tiktok',
      icon: <Image src="/img/tik-tok.png" alt="" width={18} height={18} />,
    },
    {
      label: 'YouTube Music',
      href: links.youtube_music_url,
      className: 'social-youtube-music',
      icon: <Youtube size={19} aria-hidden />,
    },
  ].flatMap((entry): { className: string; href: string; icon: ReactNode; label: string }[] =>
    entry.href ? [{ ...entry, href: entry.href }] : []
  );

  if (!entries.length) return null;
  return (
    <div className="social-links brand-social-links" aria-label="Social media">
      {entries.map(({ className, href, icon, label }) => (
        <a
          className={`brand-social-link ${className}`}
          key={label}
          href={href}
          rel="noopener noreferrer"
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          aria-label={label}
        >
          {icon}
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
}

export function Hero({
  latest,
  episodes,
}: {
  latest: PodcastEpisode | null;
  episodes: PodcastEpisode[];
}) {
  return <HeroSlider siteName={site.name} latest={latest} episodes={episodes} />;
}

export function EpisodeSignupSection({ status }: { status?: string | null }) {
  const feedback: Record<string, string> = {
    error: 'Aanmelden lukte niet. Probeer het nog eens.',
    invalid: 'Vul je naam en een geldig e-mailadres in.',
    'rate-limited': 'Er zijn te veel aanmeldpogingen. Probeer het later opnieuw.',
    storage: 'Aanmelden is tijdelijk niet beschikbaar.',
    subscribed: 'Je staat op de lijst. We laten je weten wanneer aflevering 1 klaarstaat.',
  };

  return (
    <section
      className="episode-signup-section"
      id="aanmelden"
      aria-labelledby="episode-signup-title"
    >
      <div className="episode-signup-copy">
        <p className="eyebrow">Aflevering 1</p>
        <h2 id="episode-signup-title">Mis het niet!</h2>
        <p>Meld je aan dan geven we een seintje wanneer de nieuwe aflevering beschikbaar is.</p>
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
        <button className="button" type="submit">
          Meld mij aan
        </button>
        {status ? <p className="signup-feedback">{feedback[status] ?? feedback.error}</p> : null}
      </form>
    </section>
  );
}

export function PodcastOnePagerSection({
  latest,
  seasons,
  episodes,
}: {
  latest: PodcastEpisode | null;
  seasons: PodcastSeason[];
  episodes: PodcastEpisode[];
}) {
  const featured = latest ?? episodes[0] ?? null;

  if (!featured) return null;

  return (
    <section className="podcast-module" id="podcast" aria-labelledby="podcast-title">
      <h2 className="sr-only" id="podcast-title">
        Podcast
      </h2>
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
              <EpisodeQueueItem
                key={episode.id}
                episode={episode}
                active={episode.id === featured.id}
              />
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
                  <a
                    target="_blank"
                    href={`${podcastTikTokProfileUrl}?refer=creator_embed`}
                    rel="noopener noreferrer"
                  >
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

export function SpotifyEmbedPlayer({
  episode,
  compact = false,
}: {
  episode: PodcastEpisode;
  compact?: boolean;
}) {
  const spotifyEmbedUrl = episode.spotify_url ? getSpotifyEmbedUrl(episode.spotify_url) : null;
  if (!spotifyEmbedUrl) return null;

  return (
    <iframe
      className={compact ? 'spotify-embed-player is-compact' : 'spotify-embed-player'}
      title={`Spotify-player: ${episode.title}`}
      style={{ borderRadius: '12px' }}
      src={spotifyEmbedUrl}
      width="100%"
      height={compact ? '110' : '152'}
      frameBorder={0}
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
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

export function LatestEpisodeCard({
  episode,
  compact = false,
}: {
  episode: PodcastEpisode;
  compact?: boolean;
}) {
  const audioUrl = getEpisodeAudioUrl(episode);

  return (
    <article className={compact ? 'latest-card floating' : 'latest-card'}>
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

export function ModernAudioPlayer({
  episode,
  showPlaceholderNote = true,
}: {
  episode: PodcastEpisode;
  showPlaceholderNote?: boolean;
}) {
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

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
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
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pauzeer' : 'Speel af'}>
          {isPlaying ? <Pause size={20} aria-hidden /> : <Play size={20} aria-hidden />}
        </button>
        <div className="player-progress" onClick={handleProgressClick}>
          <div
            className="progress-bar"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="player-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
          className="player-volume"
        />
      </div>
      {showPlaceholderNote && !episode.audio_file_url ? (
        <p className="player-note">
          Testaudio: vervang deze placeholder zodra de echte aflevering klaarstaat.
        </p>
      ) : null}
    </div>
  );
}

function EpisodeQueueItem({ episode, active }: { episode: PodcastEpisode; active?: boolean }) {
  return (
    <article className={`queue-item${active ? ' active' : ''}`}>
      <div className="queue-play">
        {getEpisodeAudioUrl(episode) ? <Play aria-hidden /> : <Headphones aria-hidden />}
      </div>
      <div>
        <p className="eyebrow">
          S{episode.season_number} - E{episode.episode_number}
        </p>
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
      {episode.publication_date ? ` - ${formatDate(episode.publication_date)}` : ''}
      {episode.duration ? ` - ${episode.duration}` : ''}
    </p>
  );
}

export function PlatformLinks({ episode }: { episode: PodcastEpisode }) {
  const links = [
    ['Spotify', episode.spotify_url],
    ['Podimo', episode.podimo_url],
    ['Apple Podcasts', episode.apple_podcast_url],
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

function isMeaningfulLinkCard(card: PodcastEpisode['link_cards'][number]) {
  const label = card.label.trim().toLowerCase();
  const url = card.url.trim();
  if (!label || !url) return false;
  return !(label === 'luister binnenkort' && (url === '#podcast' || url === '/podcast'));
}

export function EpisodeList({
  seasons,
  episodes,
}: {
  seasons: PodcastSeason[];
  episodes: PodcastEpisode[];
}) {
  return (
    <div className="season-list">
      {seasons.map((season) => {
        const seasonEpisodes = episodes.filter(
          (episode) => episode.season_number === season.season_number
        );
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
            <Calendar size={16} aria-hidden /> Volgende aflevering beschikbaar op{' '}
            {formatDate(episode.next_episode_date)}
          </p>
        ) : null}
        <audio controls preload="metadata" src={audioUrl} />
        {!episode.audio_file_url ? (
          <p className="small-note">Testaudio: totdat de echte aflevering beschikbaar is.</p>
        ) : null}
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

const postTypeLabels: Record<NonNullable<CommunityPost['post_type']>, string> = {
  story: 'Verhaal',
  question: 'Vraag',
  tip: 'Tip',
  link: 'Handige link',
};

const snaarIcons = {
  favoriteBefore: '/img/icons_SNAAR/favorite_before_click/icons8-favorite-48.png',
  favoriteAfter: '/img/icons_SNAAR/favorite_after_click/icons8-favorite-100.png',
  comment: '/img/icons_SNAAR/comment/icons8-comment-48.png',
};

export function CommunityPostCard({
  post,
  showActions = false,
  currentProfile = null,
  defaultCommentsOpen = false,
}: {
  post: CommunityPost;
  showActions?: boolean;
  currentProfile?: CommunityProfile | null;
  defaultCommentsOpen?: boolean;
}) {
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen);
  const postType = post.post_type ?? 'story';
  const authorName = displayAuthor(post.author_name, post.author_display_type);
  const postUrl = `/community/${post.slug}`;
  const commentsId = `community-comments-${post.id}`;
  return (
    <article className="post-card community-post-card">
      <header className="community-post-author">
        <ProfileAvatar name={authorName} avatarUrl={post.author_avatar_url ?? null} />
        <div>
          <strong>{authorName}</strong>
          <p>
            {postTypeLabels[postType]} - {post.category} - {formatDate(post.created_at)}
          </p>
        </div>
      </header>
      {post.image_url ? (
        <Image
          className="post-card-image"
          src={post.image_url}
          alt={`Afbeelding bij ${post.title}`}
          width={720}
          height={420}
        />
      ) : null}
      <h3>
        <Link href={`/community/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="community-post-body">{post.body}</p>
      {post.resource_url ? (
        <a
          className="community-resource-link"
          href={post.resource_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {post.resource_label ?? 'Bekijk gedeelde link'}
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
        <span>{post.reply_count} reacties</span>
      </div>
      <div className="community-card-actions" role="group" aria-label="Berichtacties">
        {showActions ? (
          <form action={supportPost.bind(null, post.id)}>
            <input type="hidden" name="return_to" value="/community" readOnly />
            <SupportPostSubmitButton
              supported={Boolean(post.has_supported)}
              count={post.support_count}
            />
          </form>
        ) : (
          <Link
            className="community-post-action"
            href={`/login?next=${encodeURIComponent(postUrl)}`}
            aria-label="Dit raakte mij"
          >
            <Image src={snaarIcons.favoriteBefore} alt="" width={21} height={21} />
            <span>{post.support_count}</span>
          </Link>
        )}
        <button
          className="community-post-action"
          type="button"
          onClick={() => setCommentsOpen((open) => !open)}
          aria-expanded={commentsOpen}
          aria-controls={commentsId}
        >
          <Image src={snaarIcons.comment} alt="" width={21} height={21} />
          Reageer
        </button>
      </div>
      {showActions ? (
        <CommunityReportMenu
          targetType="post"
          targetId={post.id}
          hasImage={Boolean(post.image_url)}
        />
      ) : null}
      {commentsOpen ? (
        <div className="community-comments-panel" id={commentsId}>
          {post.replies?.length ? (
            <div className="community-comment-thread" aria-label={`Reacties op ${post.title}`}>
              {post.replies.map((reply) => (
                <CommunityInlineReply
                  key={reply.id}
                  postId={post.id}
                  reply={reply}
                  showActions={showActions}
                />
              ))}
              {post.reply_count > post.replies.length ? (
                <Link className="community-comment-more" href={postUrl}>
                  Bekijk alle {post.reply_count} reacties
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="community-comments-empty">
              Nog geen gepubliceerde reacties. Jij kunt de eerste zijn.
            </p>
          )}
          <div className="community-inline-comment">
            {showActions ? (
              <ProfileAvatar
                name={currentProfile?.display_name ?? 'Jij'}
                avatarUrl={currentProfile?.avatar_url ?? null}
              />
            ) : (
              <span className="community-avatar community-avatar-small" aria-hidden>
                S
              </span>
            )}
            {showActions ? (
              <form
                className="community-inline-reply-form"
                action={createCommunityReply.bind(null, post.id)}
              >
                <input type="hidden" name="return_to" value="/community" readOnly />
                <input type="hidden" name="author_display_type" value="first_name" readOnly />
                <input name="body" placeholder="Schrijf een reactie..." maxLength={2000} required />
                <button type="submit" aria-label="Reactie plaatsen">
                  <Send size={16} aria-hidden />
                </button>
              </form>
            ) : (
              <Link href={`/login?next=${encodeURIComponent(postUrl)}`}>
                Log in om te reageren...
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function CommunityInlineReply({
  postId,
  reply,
  showActions,
  depth = 0,
}: {
  postId: string;
  reply: CommunityReply;
  showActions: boolean;
  depth?: number;
}) {
  const authorName = displayAuthor(reply.author_name, reply.author_display_type);
  const childReplies = reply.replies ?? [];
  return (
    <article className={depth ? 'community-comment-card is-reply' : 'community-comment-card'}>
      <ProfileAvatar name={authorName} avatarUrl={reply.author_avatar_url ?? null} />
      <div className="community-comment-bubble">
        <strong>{authorName}</strong>
        <p>{reply.body}</p>
        {reply.status !== 'approved' ? (
          <span className="community-comment-pending">Wacht op moderatie · alleen voor jou zichtbaar</span>
        ) : null}
        <div className="community-comment-actions">
          <span>{formatDate(reply.created_at)}</span>
          {showActions ? (
            <>
              <details>
                <summary>Reageer</summary>
                <form
                  className="community-inline-reply-form compact"
                  action={createCommunityReply.bind(null, postId)}
                >
                  <input type="hidden" name="return_to" value="/community" readOnly />
                  <input type="hidden" name="parent_reply_id" value={reply.id} readOnly />
                  <input type="hidden" name="author_display_type" value="first_name" readOnly />
                  <input name="body" placeholder="Antwoord..." maxLength={2000} required />
                  <button type="submit" aria-label="Antwoord plaatsen">
                    <Send size={14} aria-hidden />
                  </button>
                </form>
              </details>
              <form action={reportCommunityContent.bind(null, 'reply', reply.id)}>
                <input type="hidden" name="return_to" value="/community" readOnly />
                <input type="hidden" name="report_category" value="taalgebruik" readOnly />
                <button type="submit">Melden</button>
              </form>
            </>
          ) : null}
        </div>
        {depth < 1 && childReplies.length ? (
          <div className="community-comment-children">
            {childReplies.map((child) => (
              <CommunityInlineReply
                key={child.id}
                postId={postId}
                reply={child}
                showActions={showActions}
                depth={depth + 1}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CommunityReportMenu({
  targetType,
  targetId,
  hasImage,
}: {
  targetType: 'post';
  targetId: string;
  hasImage: boolean;
}) {
  const items = [
    { label: 'Post melden', type: targetType, category: 'ongepast' },
    { label: 'Taalgebruik melden', type: 'language', category: 'taalgebruik' },
    ...(hasImage ? [{ label: 'Afbeelding melden', type: 'image', category: 'afbeelding' }] : []),
  ];
  return (
    <details className="community-report-menu">
      <summary>Melden</summary>
      <div>
        {items.map((item) => (
          <form action={reportCommunityContent.bind(null, item.type, targetId)} key={item.label}>
            <input type="hidden" name="return_to" value="/community" readOnly />
            <input type="hidden" name="report_category" value={item.category} readOnly />
            <button type="submit">{item.label}</button>
          </form>
        ))}
      </div>
    </details>
  );
}

export function CommunityFeedback({
  submitted,
  error,
}: {
  submitted?: boolean;
  error?: string | null;
}) {
  if (submitted)
    return (
      <p className="notice" role="status" aria-live="polite">
        Je verhaal is ontvangen en staat klaar voor moderatie.
      </p>
    );
  if (!error) return null;
  const messages: Record<string, string> = {
    'community-images':
      'Uploaden van de afbeelding is niet gelukt. Probeer een kleiner bestand of plaats je bericht zonder afbeelding.',
    image: 'De afbeelding moet JPG, JPEG, PNG of WEBP zijn en maximaal 4 MB groot zijn.',
    'missing-fields': 'Controleer of titel, categorie en bericht zijn ingevuld.',
    storage: 'Afbeeldingen uploaden is tijdelijk niet beschikbaar.',
    supabase: 'Een bijdrage plaatsen is tijdelijk niet beschikbaar.',
  };
  return (
    <p className="notice" role="alert">
      {messages[error] ?? 'Controleer de invoer en probeer het opnieuw.'}
    </p>
  );
}

function SupportPostSubmitButton({
  supported,
  count,
}: {
  supported: boolean;
  count: number;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={supported ? 'community-post-action is-supported' : 'community-post-action'}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-pressed={supported}
      aria-label={supported ? 'Steun intrekken' : 'Dit raakte mij'}
    >
      <Image
        src={supported ? snaarIcons.favoriteAfter : snaarIcons.favoriteBefore}
        alt=""
        width={21}
        height={21}
      />
      <span>{count}</span>
    </button>
  );
}

export function HostCard({ host }: { host: HostProfile }) {
  const hostName = host.name.toLowerCase();
  const isSusan = hostName.includes('susan');
  const isDaniela = hostName.includes('daniela');
  const familyCard = isSusan
    ? {
        deck: 'Eva, dochter van Susan, blijft aanwezig in haar verhaal, humor en manier van leven.',
        image: '/img/EVA_PORTRET.jpg',
        imageAlt: 'Portret van Eva',
        name: 'Eva',
        relation: 'Dochter van Susan',
        storyKey: 'eva' as const,
      }
    : isDaniela
      ? {
          deck: 'Tycho, zoon van Daniela, leeft voort in liefde, herinneringen en alles wat hij in beweging bracht.',
          image: '/img/TYCHO_PORTRET.jpg',
          imageAlt: 'Portret van Tycho',
          name: 'Tycho',
          relation: 'Zoon van Daniela',
          storyKey: 'tycho' as const,
        }
      : null;
  const imageUrl = hostName.includes('susan')
    ? '/img/portretsuus.png'
    : hostName.includes('daniela')
      ? '/img/Portret_Daniela.jpeg'
      : host.image_url || null;

  return (
    <article className="host-card">
      {imageUrl ? (
        <Image src={imageUrl} alt={host.name} width={720} height={540} />
      ) : (
        <div className="host-placeholder" aria-hidden />
      )}
      <div>
        <p className="eyebrow">{host.role ?? 'Team'}</p>
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
              {familyCard.storyKey === 'tycho' ? (
                <a
                  className="button"
                  href={tychoSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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

import { Icon } from './ui/Icon';
import { PageIntro } from './ui/PageIntro';
import { formatDate } from './ui/formatDate';

export { Icon, PageIntro, formatDate };

function displayAuthor(name: string | null, type: string) {
  if (type === 'anonymous') return 'Anoniem';
  if (type === 'first_name' && name) return name.split(' ')[0];
  return name ?? 'Communitylid';
}

function authorInitial(name: string) {
  return (name.trim()[0] ?? 'S').toUpperCase();
}

function getSpotifyEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname !== 'open.spotify.com') return value;
    if (!url.pathname.startsWith('/embed/')) {
      url.pathname = `/embed${url.pathname}`;
    }
    url.search = '';
    return url.toString();
  } catch {
    return value;
  }
}

function getEpisodeAudioUrl(episode: PodcastEpisode) {
  return episode.audio_file_url || podcastPlaceholderAudioUrl;
}
