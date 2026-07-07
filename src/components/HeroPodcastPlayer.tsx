"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Captions, ChevronDown, Gauge, ListMusic, Pause, Play, SkipBack, SkipForward, StepBack, StepForward } from "lucide-react";
import type { PodcastEpisode } from "@/types/content";

const fallbackAudioUrl = "/audio/Voor de vroege vogels.mp3";
const playbackRates = [1, 1.5, 2] as const;

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
  const [playbackRate, setPlaybackRate] = useState<(typeof playbackRates)[number]>(1);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeCueRef = useRef<HTMLParagraphElement | null>(null);

  const effectiveSelectedId = playlist.some((item) => item.id === selectedId) ? selectedId : playlist[0]?.id ?? "";
  const selectedIndex = Math.max(0, playlist.findIndex((episode) => episode.id === effectiveSelectedId));
  const episode = playlist[selectedIndex] ?? playlist[0] ?? null;
  const segments = episode?.transcript_segments ?? [];
  const activeSegmentIndex = segments.findIndex((segment) => currentTime >= segment.start && currentTime < segment.end);
  const transcriptToggle = isTranscriptOpen ? (
    <button type="button" onClick={() => setIsTranscriptOpen(false)} aria-expanded="true" aria-controls="hero-player-transcript">
      <Captions size={16} aria-hidden />
      Transcript
    </button>
  ) : (
    <button type="button" onClick={() => setIsTranscriptOpen(true)} aria-expanded="false" aria-controls="hero-player-transcript">
      <Captions size={16} aria-hidden />
      Transcript
    </button>
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate, episode?.id]);

  useEffect(() => {
    if (!isTranscriptOpen || activeSegmentIndex < 0) return;
    activeCueRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeSegmentIndex, isTranscriptOpen]);

  if (!episode) return null;

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
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
      audio.playbackRate = playbackRate;
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
    <aside id="hero-player" className={`hero-podcast-player${isTranscriptOpen ? " transcript-open" : ""}`} aria-label="Podcastspeler">
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
        <button className="hero-player-icon-button hero-player-primary" type="button" onClick={togglePlay} aria-label={isPlaying ? "Pauzeer aflevering" : "Speel aflevering af"}>
          {isPlaying ? <Pause aria-hidden /> : <Play aria-hidden />}
        </button>
      </div>

      {episode.short_intro ? <p className="hero-player-intro">{episode.short_intro}</p> : null}

      <label className="hero-player-select">
        <ListMusic size={17} aria-hidden />
        <span className="sr-only">Kies aflevering</span>
        <select value={episode.id} onChange={(event) => selectEpisode(playlist.findIndex((item) => item.id === event.target.value), false)}>
          {playlist.map((item) => (
            <option key={item.id} value={item.id}>
              {item.episode_number > 0 ? `S${item.season_number} E${item.episode_number} - ` : ""}{item.title}
            </option>
          ))}
        </select>
        <ChevronDown size={17} aria-hidden />
      </label>

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
        <button type="button" onClick={() => moveEpisode(-1)} aria-label="Vorige aflevering">
          <StepBack aria-hidden />
        </button>
        <button type="button" onClick={() => seekBy(-15)} aria-label="15 seconden terug">
          <SkipBack aria-hidden />
          <span>15</span>
        </button>
        <button className="hero-player-main-control" type="button" onClick={togglePlay} aria-label={isPlaying ? "Pauzeer" : "Speel af"}>
          {isPlaying ? <Pause aria-hidden /> : <Play aria-hidden />}
        </button>
        <button type="button" onClick={() => seekBy(30)} aria-label="30 seconden vooruit">
          <SkipForward aria-hidden />
          <span>30</span>
        </button>
        <button type="button" onClick={() => moveEpisode(1)} aria-label="Volgende aflevering">
          <StepForward aria-hidden />
        </button>
      </div>

      <div className="hero-player-tools">
        <label>
          <Gauge size={16} aria-hidden />
          <span className="sr-only">Afspeelsnelheid</span>
          <select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value) as (typeof playbackRates)[number])}>
            {playbackRates.map((rate) => (
              <option key={rate} value={rate}>
                {rate}x
              </option>
            ))}
          </select>
        </label>
        {transcriptToggle}
      </div>

      <div className="hero-player-signup-promo">
        <div>
          <h3>Mis het niet!</h3>
          <p>Meld je aan en wees een van de eersten die aflevering 1 kan luisteren.</p>
        </div>
        <a href="#aanmelden">Meld mij aan</a>
      </div>

      <div id="hero-player-transcript" className={`hero-player-transcript${isTranscriptOpen ? " open" : ""}`}>
        {segments.length ? (
          <div className="hero-player-transcript-scroll" aria-live="polite">
            {segments.map((segment, index) => (
              <p
                key={`${segment.start}-${index}`}
                ref={index === activeSegmentIndex ? activeCueRef : null}
                className={index === activeSegmentIndex ? "active" : ""}
              >
                <span>{formatTime(segment.start)}</span>
                {segment.text}
              </p>
            ))}
          </div>
        ) : (
          <p className="hero-player-transcript-empty">
            Nederlands transcript is nog niet beschikbaar voor deze aflevering.
          </p>
        )}
      </div>
    </aside>
  );
}
