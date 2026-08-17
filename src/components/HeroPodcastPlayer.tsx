import type { PodcastEpisode } from "@/types/content";
import { SpotifyEmbedPlayer } from "@/components/ui";

export function HeroPodcastPlayer({ latest, episodes }: { latest: PodcastEpisode | null; episodes: PodcastEpisode[] }) {
  const episode = latest ?? episodes[0] ?? null;
  if (!episode) return null;

  return (
    <aside id="hero-player" className="hero-podcast-player" aria-label="Podcastspeler">
      <div className="hero-player-topline">
        <p className="hero-player-kicker">Luister nu</p>
        <h2>{episode.title}</h2>
      </div>

      <div className="hero-player-audio">
        {episode.spotify_url ? (
          <SpotifyEmbedPlayer episode={episode} compact />
        ) : (
          <audio
            className="hero-player-audio-control"
            controls
            preload="metadata"
            src={episode.audio_file_url ?? undefined}
          />
        )}
      </div>

      {episode.spotify_url ? (
        <div className="hero-player-signup-promo">
          <a href={episode.spotify_url} target="_blank" rel="noreferrer">
            Open aflevering op Spotify
          </a>
        </div>
      ) : null}
    </aside>
  );
}
