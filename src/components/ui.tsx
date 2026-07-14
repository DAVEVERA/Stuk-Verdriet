"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef, useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Headphones,
  Heart,
  Instagram,
  Leaf,
  Mail,
  MessageCircle,
  Music2,
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
import { createCommunityPost, supportPost, subscribeEpisodeSignup } from "@/lib/actions";
import { navigation, site } from "@/lib/site";
import type { CommunityCategory, CommunityPost, HostProfile, PodcastEpisode, PodcastSeason, SocialLinks } from "@/types/content";

const podcastPlaceholderAudioUrl = "/audio/podcast-placeholder.wav";
const podcastInstagramProfileUrl = "https://www.instagram.com/stukverdrietdepodcast/";
const podcastTikTokProfileUrl = "https://www.tiktok.com/@stuk.verdriet";
const tychoSupportUrl = "https://radboudoncologiefonds.voorradboudfonds.nl/project/tycho";
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
        <Image src={site.logo} alt="" width={76} height={76} />
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
        &copy; {new Date().getFullYear()} Stuk Verdriet - Met liefde gebouwd door{" "}
        <a href="https://mnrv.nl" target="_blank" rel="noopener noreferrer">
          MNRV
        </a>
      </p>
    </footer>
  );
}

export function GoFundMeSupportSection() {
  return (
    <section className="gofundme-support-section" aria-label="Steun het gezin van Tycho">
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
        <p className="eyebrow">S{episode.season_number} · E{episode.episode_number}</p>
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
      {episode.publication_date ? ` · ${formatDate(episode.publication_date)}` : ""}
      {episode.duration ? ` · ${episode.duration}` : ""}
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

export function CommunityPostCard({ post, showActions = false }: { post: CommunityPost; showActions?: boolean }) {
  const postType = post.post_type ?? "story";
  return (
    <article className="post-card">
      {post.image_url ? <Image className="post-card-image" src={post.image_url} alt="" width={720} height={420} /> : null}
      <p className="eyebrow">{postTypeLabels[postType]} · {post.category}</p>
      <h3>
        <Link href={`/community/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.body}</p>
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
      <div className="post-meta">
        <span>{displayAuthor(post.author_name, post.author_display_type)}</span>
        <span>{formatDate(post.created_at)}</span>
        <span>{post.reply_count} reacties</span>
        <span>{post.support_count} steun</span>
      </div>
      {showActions ? (
        <div className="community-card-actions">
          <Link className="text-link" href={`/community/${post.slug}`}>Lees en reageer</Link>
          <form action={supportPost.bind(null, post.id)}>
            <button className="button" type="submit">Steun</button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

export function CommunityFeedback({ submitted, error }: { submitted?: boolean; error?: string | null }) {
  if (submitted) return <p className="notice">Je verhaal is ontvangen en staat klaar voor moderatie.</p>;
  if (!error) return null;
  const messages: Record<string, string> = {
    "community-images": "Uploaden van de afbeelding is niet gelukt. Probeer een kleiner bestand of plaats je bericht zonder afbeelding.",
    image: "De afbeelding moet JPG, JPEG, PNG of WEBP zijn en maximaal 4 MB groot zijn.",
    "missing-fields": "Controleer of titel, categorie en bericht zijn ingevuld.",
    storage: "Afbeeldingen uploaden is nog niet goed gekoppeld. Controleer de Supabase Storage bucket.",
    supabase: "Community plaatsen vereist Supabase-configuratie."
  };
  return <p className="notice">{messages[error] ?? "Controleer de invoer en probeer het opnieuw."}</p>;
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
      <button className="button" type="submit">Verstuur ter goedkeuring</button>
    </form>
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
