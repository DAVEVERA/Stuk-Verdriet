import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock3,
  Download,
  Headphones,
  Heart,
  Leaf,
  Mail,
  MessageCircle,
  Mic2,
  Pause,
  Play,
  Shield,
  Star,
  User,
  Users,
  Volume2
} from "lucide-react";
import { navigation, site } from "@/lib/site";
import type { CommunityCategory, CommunityPost, HostProfile, PodcastEpisode, PodcastSeason, SocialLinks } from "@/types/content";

export function Footer({ socialLinks }: { socialLinks: SocialLinks }) {
  return (
    <footer className="footer">
      <div>
        <Image src={site.logo} alt="" width={76} height={76} />
        <h2>{site.name}</h2>
        <p className="slogan-text">{site.tagline}</p>
      </div>
      <div className="footer-links">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/privacy">Privacyverklaring</Link>
        <Link href="/communityrichtlijnen">Communityrichtlijnen</Link>
        <Link href="/cookies">Cookieverklaring</Link>
      </div>
      <div>
        <a className="quiet-link" href={`mailto:${site.email}`}>
          <Mail size={18} aria-hidden /> {site.email}
        </a>
        <SocialLinksList links={socialLinks} />
      </div>
      <p className="copyright">© {new Date().getFullYear()} Stuk Verdriet</p>
    </footer>
  );
}

export function SocialLinksList({ links }: { links: SocialLinks }) {
  const entries = [
    ["Instagram", links.instagram_url],
    ["Facebook", links.facebook_url],
    ["TikTok", links.tiktok_url],
    ["Spotify", links.spotify_url],
    ["Podimo", links.podimo_url],
    ["Apple Podcasts", links.apple_podcast_url]
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  if (!entries.length) return null;
  return (
    <div className="social-links">
      {entries.map(([label, href]) => (
        <a key={label} href={href} rel="noreferrer" target="_blank">
          {label}
        </a>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <p className="eyebrow">De podcast</p>
        <h1>{site.name}</h1>
        <p className="hero-tagline slogan-text">{site.tagline}</p>
        <p className="placeholder">[HOMEPAGE_TEKST_WORDT_AANGELEVERD]</p>
        <div className="subtle-actions">
          <Link href="/#podcast">Bekijk afleveringen</Link>
          <Link href="/#community">Naar de community</Link>
        </div>
      </div>
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
  const upcoming = episodes.find((episode) => episode.next_episode_date)?.next_episode_date ?? featured?.next_episode_date ?? null;

  if (!featured) return null;

  return (
    <section className="podcast-module" id="podcast" aria-labelledby="podcast-title">
      <div className="podcast-shell">
        <div className="podcast-copy">
          <p className="eyebrow">Podcast</p>
          <h2 id="podcast-title">Luisteren op je eigen tempo</h2>
          <p>[PODCAST_INTRO_WORDT_AANGELEVERD]</p>
        </div>

        <div className="podcast-app">
          <div className="podcast-now">
            <div className="podcast-cover">
              <span>Stuk Verdriet</span>
              <Mic2 aria-hidden />
              <small>De podcast</small>
            </div>
            <div className="podcast-player-panel">
              <p className="eyebrow">Nieuwste aflevering</p>
              <h3>{featured.title}</h3>
              <EpisodeMeta episode={featured} />
              {featured.short_intro ? <p>{featured.short_intro}</p> : null}
              <ModernAudioPlayer episode={featured} />
              <PlatformLinks episode={featured} />
            </div>
          </div>

          <div className="podcast-utility-grid" aria-label="Podcastinformatie">
            <div>
              <Clock3 aria-hidden />
              <span>Elke 14 dagen</span>
              <strong>{upcoming ? `Volgende: ${formatDate(upcoming)}` : "Planning volgt"}</strong>
            </div>
            <div>
              <Headphones aria-hidden />
              <span>Direct luisteren</span>
              <strong>{featured.audio_file_url ? "Audio beschikbaar" : "Audio wordt toegevoegd"}</strong>
            </div>
            <div>
              <Shield aria-hidden />
              <span>Rustig ingericht</span>
              <strong>Geen drukke feed</strong>
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
      </div>
    </section>
  );
}

export function LatestEpisodeCard({ episode, compact = false }: { episode: PodcastEpisode; compact?: boolean }) {
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
      </div>
      {episode.audio_file_url ? <audio controls src={episode.audio_file_url} /> : null}
      <Link className="text-link" href={`/podcast/${episode.slug}`}>
        Lees meer
      </Link>
    </article>
  );
}

function ModernAudioPlayer({ episode }: { episode: PodcastEpisode }) {
  return (
    <div className="modern-player">
      <div className="player-controls">
        <button type="button" aria-label={episode.audio_file_url ? "Afspelen" : "Audio nog niet beschikbaar"} disabled={!episode.audio_file_url}>
          {episode.audio_file_url ? <Play aria-hidden /> : <Pause aria-hidden />}
        </button>
        <div className="player-timeline">
          <div className="timeline-track">
            <span style={{ width: episode.audio_file_url ? "18%" : "0%" }} />
          </div>
          <div className="timeline-meta">
            <span>00:00</span>
            <span>{episode.duration ?? "--:--"}</span>
          </div>
        </div>
        <Volume2 aria-hidden className="volume-icon" />
      </div>
      {episode.audio_file_url ? <audio controls preload="metadata" src={episode.audio_file_url} /> : <p className="player-note">Audio, shownotes en platformlinks verschijnen zodra de aflevering klaarstaat.</p>}
    </div>
  );
}

function EpisodeQueueItem({ episode, active }: { episode: PodcastEpisode; active?: boolean }) {
  return (
    <article className={`queue-item${active ? " active" : ""}`}>
      <div className="queue-play">
        {episode.audio_file_url ? <Play aria-hidden /> : <Headphones aria-hidden />}
      </div>
      <div>
        <p className="eyebrow">S{episode.season_number} · E{episode.episode_number}</p>
        <h4>{episode.title}</h4>
        <EpisodeMeta episode={episode} />
      </div>
      <div className="queue-actions">
        {episode.audio_file_url ? <Download aria-hidden /> : null}
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
        <a key={label} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      ))}
    </div>
  );
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
        {episode.audio_file_url ? <audio controls src={episode.audio_file_url} /> : null}
        <PlatformLinks episode={episode} />
        <Link className="text-link" href={`/podcast/${episode.slug}`}>
          Lees meer
        </Link>
      </div>
    </article>
  );
}

export function CommunityCategoryGrid({ categories }: { categories: CommunityCategory[] }) {
  return (
    <div className="category-grid">
      {categories.map((category) => (
        <article key={category.id} className="category-card">
          <Icon name={category.icon} />
          <h3>{category.title}</h3>
          <p>{category.description}</p>
        </article>
      ))}
    </div>
  );
}

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="post-card">
      <p className="eyebrow">{post.category}</p>
      <h3>
        <Link href={`/community/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.body}</p>
      <div className="post-meta">
        <span>{displayAuthor(post.author_name, post.author_display_type)}</span>
        <span>{formatDate(post.created_at)}</span>
        <span>{post.reply_count} reacties</span>
        <span>{post.support_count} steun</span>
      </div>
    </article>
  );
}

export function HostCard({ host }: { host: HostProfile }) {
  return (
    <article className="host-card">
      {host.image_url ? <Image src={host.image_url} alt={host.name} width={720} height={540} /> : <div className="host-placeholder" aria-hidden />}
      <div>
        <p className="eyebrow">{host.role ?? "Team"}</p>
        <h3>{host.name}</h3>
        {host.bio ? <p>{host.bio}</p> : null}
        {host.personal_motivation ? <p>{host.personal_motivation}</p> : null}
      </div>
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
