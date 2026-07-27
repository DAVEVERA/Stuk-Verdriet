import type { PodcastEpisode } from "@/types/content";

const heroEpisodeTitle = "Afl. 2 - In gesprek met een AYA en haar vader";
const heroEpisodeAudioUrl =
  "https://traffic.omny.fm/d/clips/56337cb8-b71d-4e6c-b279-b31700c37714/39e4cd19-74cc-4c95-82d1-b483009801e1/17a8a080-a3df-4694-a7a2-b49400ec1ef6/audio.mp3?utm_source=Podcast&in_playlist=75be1074-3a78-4407-80fb-b48300980637";
const heroSpotifyEpisodeUrl = "https://open.spotify.com/episode/1krrANNcoXfDGxTX70pN5o";

export function HeroPodcastPlayer({ latest, episodes }: { latest: PodcastEpisode | null; episodes: PodcastEpisode[] }) {
  const episode = latest ?? episodes[0] ?? null;
  if (!episode) return null;

  return (
    <aside id="hero-player" className="hero-podcast-player" aria-label="Podcastspeler">
      <div className="hero-player-topline">
        <p className="hero-player-kicker">Luister nu</p>
        <h2>{heroEpisodeTitle}</h2>
      </div>

      <div className="hero-player-audio">
        <audio
          className="hero-player-audio-control"
          controls
          preload="metadata"
          src={heroEpisodeAudioUrl}
        />
      </div>

      <div className="hero-player-signup-promo">
        <a href={heroSpotifyEpisodeUrl} target="_blank" rel="noreferrer">
          Open aflevering op Spotify
        </a>
      </div>
    </aside>
  );
}
