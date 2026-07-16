"use client";

import { useMemo, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { PodcastEpisode } from "@/types/content";

const fallbackAudioUrl = "/audio/Voor de vroege vogels.mp3";

function getEpisodeAudioUrl(episode: PodcastEpisode) {
  return episode.audio_file_url || fallbackAudioUrl;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function HeroPodcastPlayer({ latest, episodes }: { latest: PodcastEpisode | null; episodes: PodcastEpisode[] }) {
  const playlist = useMemo(() => {
    const seen = new Set<string>();
    return [latest, ...episodes].filter((episode): episode is PodcastEpisode => {
      if (!episode || seen.has(episode.id)) return false;
      seen.add(episode.id);
      return true;
    });
  }, [latest, episodes]);
  const [selectedId, setSelectedId] = useState(playlist[0]?.id ?? "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const effectiveSelectedId = playlist.some((item) => item.id === selectedId) ? selectedId : playlist[0]?.id ?? "";
  const selectedIndex = Math.max(0, playlist.findIndex((episode) => episode.id === effectiveSelectedId));
  const episode = playlist[selectedIndex] ?? playlist[0] ?? null;

  if (!episode) return null;

  async function playAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function pauseAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }

  function seekBy(amount: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + amount, 0), duration || audio.duration || 0);
  }

  function selectEpisode(index: number, autoplay = isPlaying) {
    const next = playlist[index];
    if (!next) return;
    setSelectedId(next.id);
    setCurrentTime(0);
    window.setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (autoplay) {
        void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }, 0);
  }

  function moveEpisode(amount: number) {
    if (!playlist.length) return;
    const nextIndex = (selectedIndex + amount + playlist.length) % playlist.length;
    selectEpisode(nextIndex);
  }

  return (
    <aside id="hero-player" className="hero-podcast-player" aria-label="Podcastspeler">
      <audio
        ref={audioRef}
        src={getEpisodeAudioUrl(episode)}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => moveEpisode(1)}
      />

      <div className="hero-player-topline">
        <div>
          <p className="hero-player-kicker">Luister nu</p>
          <h2>{episode.title}</h2>
        </div>
      </div>

      <div className="hero-player-progress">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || currentTime)}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (audioRef.current) audioRef.current.currentTime = next;
            setCurrentTime(next);
          }}
          aria-label="Voortgang aflevering"
        />
        <div>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hero-player-controls" aria-label="Podcastbediening">
        <button type="button" onClick={() => seekBy(-15)} aria-label="15 seconden terug">
          <SkipBack aria-hidden />
          <span>15</span>
        </button>
        <button type="button" onClick={pauseAudio} aria-label="Pauzeer">
          <Pause aria-hidden />
        </button>
        <button className="hero-player-main-control" type="button" onClick={playAudio} aria-label="Speel af">
          <Play aria-hidden />
        </button>
        <button type="button" onClick={() => seekBy(15)} aria-label="15 seconden vooruit">
          <SkipForward aria-hidden />
          <span>15</span>
        </button>
      </div>

      <div className="hero-player-signup-promo">
        <a href="#aanmelden">Geef mij een seintje</a>
      </div>
    </aside>
  );
}
