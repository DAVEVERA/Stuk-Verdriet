"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bookmark, Heart, Pause, Play, X } from "lucide-react";
import {
  beginPulsePointerSession,
  cancelPulsePointerSession,
  finishPulsePointerSession,
  type PulsePointerSession
} from "@/components/communityPulseViewerGestures";
import type { CommunityProfile, CommunityPulseMoment } from "@/types/content";

type CommunityPulseViewerProps = {
  moments: CommunityPulseMoment[];
  startIndex: number;
  isLoggedIn: boolean;
  onClose: () => void;
};

const STORY_DURATION_MS = 8000;
const pulseBackgrounds: Record<string, string> = {
  "solid-pine": "#2f4f4f",
  "solid-sage": "#7a9a7a",
  "solid-sand": "#cbb899",
  "solid-gold": "#daa520",
  "gradient-sage-dusk": "linear-gradient(145deg, #2f4f4f 0%, #5e7665 48%, #cbb899 100%)",
  "gradient-pine-light": "linear-gradient(155deg, #2f4f4f 0%, #7a9a7a 66%, #f7f3ec 100%)",
  "gradient-sand-glow": "linear-gradient(150deg, #f7f3ec 0%, #cbb899 64%, #7a9a7a 100%)",
  "gradient-evening": "linear-gradient(160deg, #2f4f4f 0%, #4b665a 48%, #cbb899 88%, #daa520 120%)"
};

function pulseProfile(moment: CommunityPulseMoment) {
  const profile = Array.isArray(moment.community_profiles) ? moment.community_profiles[0] : moment.community_profiles;
  return profile as CommunityProfile | null | undefined;
}

async function callPulseAction(momentId: string, action: "react" | "unreact" | "save" | "unsave") {
  try {
    const response = await fetch(`/api/community/pulse/${momentId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action })
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function CommunityPulseViewer({ moments, startIndex, isLoggedIn, onClose }: CommunityPulseViewerProps) {
  const [index, setIndex] = useState(startIndex);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reactedState, setReactedState] = useState<Record<string, boolean>>({});
  const [savedState, setSavedState] = useState<Record<string, boolean>>({});
  const [busyAction, setBusyAction] = useState<"react" | "save" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const titleId = useId();
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const pauseButtonRef = useRef<HTMLButtonElement | null>(null);
  const pointerSessionRef = useRef<PulsePointerSession | null>(null);
  const suppressNavigationClickRef = useRef(false);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());

  const moment = moments[index] ?? null;
  const profile = moment ? pulseProfile(moment) : null;
  const hasReacted = moment ? reactedState[moment.id] ?? Boolean(moment.has_reacted) : false;
  const hasSaved = moment ? savedState[moment.id] ?? Boolean(moment.has_saved) : false;
  const mediaItems = moment?.media_manifest?.items ?? [];
  const visibleMediaCount = moment?.media_manifest?.layout === "grid" ? 4 : moment?.media_manifest?.layout === "split" ? 2 : 1;
  const visualMedia = mediaItems.filter((item) => item.type !== "audio").slice(0, visibleMediaCount);
  const audioMedia = mediaItems.filter((item) => item.type === "audio").slice(0, 1);

  const goTo = useCallback((next: number) => {
    if (next < 0) {
      onClose();
      return;
    }
    if (next >= moments.length) {
      onClose();
      return;
    }
    setIndex(next);
    setProgress(0);
    setFeedback(null);
    elapsedRef.current = 0;
  }, [moments.length, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goTo, index, onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pauseButtonRef.current?.focus();

    return () => previouslyFocused?.focus();
  }, []);

  useEffect(() => {
    if (paused) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    startedAtRef.current = performance.now() - elapsedRef.current;

    function tick(now: number) {
      elapsedRef.current = now - startedAtRef.current;
      const ratio = Math.min(1, elapsedRef.current / STORY_DURATION_MS);
      setProgress(ratio);
      if (ratio >= 1) {
        goTo(index + 1);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [index, paused, goTo]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (paused) video.pause();
      else void video.play().catch(() => undefined);
    });
  }, [index, paused]);

  if (!moment) return null;

  async function handleReact() {
    if (!isLoggedIn || !moment || busyAction) return;
    const next = !hasReacted;
    setBusyAction("react");
    setFeedback(null);
    setReactedState((current) => ({ ...current, [moment.id]: next }));
    const succeeded = await callPulseAction(moment.id, next ? "react" : "unreact");
    if (!succeeded) {
      setReactedState((current) => ({ ...current, [moment.id]: !next }));
      setFeedback("Reageren lukte niet. Probeer het opnieuw.");
    }
    setBusyAction(null);
  }

  async function handleSave() {
    if (!isLoggedIn || !moment || busyAction) return;
    const next = !hasSaved;
    setBusyAction("save");
    setFeedback(null);
    setSavedState((current) => ({ ...current, [moment.id]: next }));
    const succeeded = await callPulseAction(moment.id, next ? "save" : "unsave");
    if (!succeeded) {
      setSavedState((current) => ({ ...current, [moment.id]: !next }));
      setFeedback("Bewaren lukte niet. Probeer het opnieuw.");
    }
    setBusyAction(null);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-pulse-control]")) return;
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (pointerSessionRef.current) return;

    pointerSessionRef.current = beginPulsePointerSession(
      event.pointerId,
      event.pointerType,
      event.clientX,
      paused
    );
    suppressNavigationClickRef.current = false;
    setPaused(true);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    const session = pointerSessionRef.current;
    if (!session) return;

    const result = finishPulsePointerSession(session, event.pointerId, event.clientX);
    if (!result) return;

    pointerSessionRef.current = null;
    setPaused(result.paused);
    if (result.navigationDelta !== 0) {
      event.preventDefault();
      suppressNavigationClickRef.current = true;
      window.setTimeout(() => {
        suppressNavigationClickRef.current = false;
      }, 0);
      goTo(index + result.navigationDelta);
    }
  }

  function restorePointerPlayback(event: React.PointerEvent<HTMLElement>) {
    const session = pointerSessionRef.current;
    if (!session) return;

    const restoredPaused = cancelPulsePointerSession(session, event.pointerId);
    if (restoredPaused === null) return;

    pointerSessionRef.current = null;
    setPaused(restoredPaused);
  }

  function handleNavigationClick(next: number) {
    if (suppressNavigationClickRef.current) {
      suppressNavigationClickRef.current = false;
      return;
    }
    goTo(next);
  }

  return createPortal(
    <div className="pulse-viewer-layer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button className="pulse-viewer-backdrop" type="button" aria-label="Sluit verhaal" onClick={onClose} />
      <div className="pulse-viewer-stage">
        <article
          className="pulse-viewer-card"
          style={{ background: pulseBackgrounds[moment.background_style ?? ""] ?? moment.background_color }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={restorePointerPlayback}
          onPointerLeave={restorePointerPlayback}
        >
          <div className="pulse-viewer-progress-row">
            {moments.map((item, itemIndex) => (
              <span className="pulse-viewer-progress-track" key={item.id}>
                <span
                  className="pulse-viewer-progress-fill"
                  style={{
                    transform: `scaleX(${itemIndex < index ? 1 : itemIndex === index ? progress : 0})`
                  }}
                />
              </span>
            ))}
          </div>

          <header className="pulse-viewer-header" data-pulse-control>
            <span className="pulse-viewer-avatar">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill sizes="36px" />
              ) : (
                <span>{(profile?.display_name ?? "S").slice(0, 1).toUpperCase()}</span>
              )}
            </span>
            <div className="pulse-viewer-header-copy">
              <strong>{profile?.display_name ?? "SNAAR"}</strong>
              <span id={titleId}>{moment.title} · {index + 1} van {moments.length}</span>
            </div>
            <button
              ref={pauseButtonRef}
              className="pulse-viewer-pause"
              type="button"
              aria-label={paused ? "Moment afspelen" : "Moment pauzeren"}
              aria-pressed={paused}
              aria-keyshortcuts="Space"
              onClick={() => setPaused((current) => !current)}
            >
              {paused ? <Play size={18} aria-hidden /> : <Pause size={18} aria-hidden />}
            </button>
            <button className="pulse-viewer-close" type="button" aria-label="Sluit verhaal" onClick={onClose}>
              <X size={20} aria-hidden />
            </button>
          </header>

          {visualMedia.length ? (
            <div className={`pulse-viewer-media is-layout-${moment.media_manifest?.layout ?? "single"}`}>
              {visualMedia.map((item) => (
                <figure className="pulse-viewer-media-frame" key={item.id} data-pulse-control={item.type === "video" ? "true" : undefined}>
                  {item.type === "video" ? (
                    <video
                      ref={(node) => {
                        if (node) videoRefs.current.set(item.id, node);
                        else videoRefs.current.delete(item.id);
                      }}
                      src={item.url}
                      aria-label={item.alt || "Momentvideo"}
                      muted
                      loop
                      playsInline
                      controls
                      preload="metadata"
                      style={{ objectPosition: `${item.cropX}% ${item.cropY}%`, transform: `scale(${item.zoom})` }}
                    />
                  ) : (
                    <Image
                      loader={({ src }) => src}
                      unoptimized
                      src={item.url}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 430px"
                      style={{ objectPosition: `${item.cropX}% ${item.cropY}%`, transform: `scale(${item.zoom})` }}
                    />
                  )}
                  {item.attributionUrl ? (
                    <a className="pulse-viewer-attribution" href={item.attributionUrl} target="_blank" rel="noreferrer sponsored" data-pulse-control>
                      {item.provider === "giphy" ? "Powered by GIPHY" : item.provider === "icons8" ? "Icons8" : `Foto: ${item.attributionName ?? "Unsplash"}`}
                    </a>
                  ) : null}
                </figure>
              ))}
            </div>
          ) : moment.image_url ? <Image src={moment.image_url} alt="" fill sizes="(max-width: 640px) 100vw, 430px" /> : null}

          <div className={`pulse-story-canvas animation-${moment.animation}`}>
            {moment.layers.map((layer) => (
              <span
                key={layer.id}
                className={`pulse-story-layer animation-${layer.animation}`}
                style={{
                  color: layer.color,
                  fontSize: `${layer.size}px`,
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  textAlign: layer.align ?? "center",
                  fontFamily: layer.fontFamily === "display" ? "var(--font-slogan), cursive" : layer.fontFamily === "serif" ? "Georgia, serif" : layer.fontFamily === "mono" ? "Courier New, monospace" : "var(--font-jost), sans-serif",
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`
                }}
              >
                {layer.text}
              </span>
            ))}
          </div>

          {audioMedia.map((item) => (
            <div className="pulse-viewer-audio" key={item.id} data-pulse-control>
              <span>{item.alt || "Geluid bij dit moment"}</span>
              <audio controls preload="metadata" src={item.url} onPlay={() => setPaused(true)} onEnded={() => setPaused(false)}>
                Je browser ondersteunt dit audiobestand niet.
              </audio>
            </div>
          ))}

          <button className="pulse-viewer-nav-zone prev" type="button" aria-label="Vorig verhaal" onClick={() => handleNavigationClick(index - 1)} />
          <button className="pulse-viewer-nav-zone next" type="button" aria-label="Volgend verhaal" onClick={() => handleNavigationClick(index + 1)} />

          {isLoggedIn ? (
            <div className="pulse-viewer-actions" data-pulse-control>
              <button
                className={`pulse-viewer-action${hasReacted ? " active" : ""}`}
                type="button"
                onClick={handleReact}
                disabled={busyAction !== null}
                aria-pressed={hasReacted}
              >
                <Heart size={20} aria-hidden fill={hasReacted ? "currentColor" : "none"} />
                Dit raakte mij
              </button>
              <button
                className={`pulse-viewer-action${hasSaved ? " active" : ""}`}
                type="button"
                onClick={handleSave}
                disabled={busyAction !== null}
                aria-pressed={hasSaved}
              >
                <Bookmark size={20} aria-hidden fill={hasSaved ? "currentColor" : "none"} />
                Bewaar dit moment
              </button>
            </div>
          ) : null}
          {feedback ? <p className="pulse-viewer-feedback" role="alert">{feedback}</p> : null}
        </article>
      </div>
    </div>,
    document.body
  );
}
