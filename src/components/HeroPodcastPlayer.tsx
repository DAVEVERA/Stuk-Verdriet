import type { PodcastEpisode } from "@/types/content";

const heroSpotifyEpisodeUrl = "https://open.spotify.com/embed/episode/1krrANNcoXfDGxTX70pN5o?theme=0";
const heroSpotifyEpisodeTitle = "Aflevering 2";

function getSpotifyEmbedUrl(value?: string | null) {
  if (!value) return heroSpotifyEpisodeUrl;

  try {
    const url = new URL(value);
    if (url.hostname !== "open.spotify.com") return heroSpotifyEpisodeUrl;
    if (!url.pathname.startsWith("/embed/")) {
      url.pathname = `/embed${url.pathname}`;
    }
    url.search = "?theme=0";
    return url.toString();
  } catch {
    return heroSpotifyEpisodeUrl;
  }
}

export function HeroPodcastPlayer({ latest, episodes }: { latest: PodcastEpisode | null; episodes: PodcastEpisode[] }) {
  const episode = latest ?? episodes[0] ?? null;
  if (!episode) return null;

  const spotifyEmbedUrl = getSpotifyEmbedUrl(heroSpotifyEpisodeUrl);
  const playerTitle = episode.title.toLowerCase().includes("aflevering 2") ? episode.title : heroSpotifyEpisodeTitle;

  return (
    <aside id="hero-player" className="hero-podcast-player" aria-label="Podcastspeler">
      <div className="hero-player-topline">
        <p className="hero-player-kicker">Luister nu</p>
        <h2>{playerTitle}</h2>
      </div>

      <div className="hero-player-spotify">
        <iframe
          data-testid="embed-iframe"
          className="hero-player-spotify-frame"
          title={`Luister naar ${playerTitle} op Spotify`}
          src={spotifyEmbedUrl}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="hero-player-signup-promo">
        <a href="#aanmelden">Geef mij een seintje</a>
      </div>
    </aside>
  );
}
