"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bookmark, Heart, X } from "lucide-react";
import type { CommunityProfile, CommunityPulseMoment } from "@/types/content";

type CommunityPulseViewerProps = {
  moments: CommunityPulseMoment[];
  startIndex: number;
  isLoggedIn: boolean;
  onClose: () => void;
};

const STORY_DURATION_MS = 5500;

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
  const titleId = useId();
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const moment = moments[index] ?? null;
  const profile = moment ? pulseProfile(moment) : null;
  const hasReacted = moment ? reactedState[moment.id] ?? Boolean(moment.has_reacted) : false;
  const hasSaved = moment ? savedState[moment.id] ?? Boolean(moment.has_saved) : false;

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

  if (!moment) return null;

  function handleReact() {
    if (!isLoggedIn || !moment) return;
    const next = !hasReacted;
    setReactedState((current) => ({ ...current, [moment.id]: next }));
    void callPulseAction(moment.id, next ? "react" : "unreact");
  }

  function handleSave() {
    if (!isLoggedIn || !moment) return;
    const next = !hasSaved;
    setSavedState((current) => ({ ...current, [moment.id]: next }));
    void callPulseAction(moment.id, next ? "save" : "unsave");
  }

  const previewText = moment.layers.find((layer) => layer.kind === "text")?.text || moment.body || moment.title;

  return createPortal(
    <div className="pulse-viewer-layer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button className="pulse-viewer-backdrop" type="button" aria-label="Sluit verhaal" onClick={onClose} />
      <div className="pulse-viewer-stage">
        <article
          className="pulse-viewer-card"
          style={{ backgroundColor: moment.background_color }}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
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

          <header className="pulse-viewer-header">
            <span className="pulse-viewer-avatar">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill sizes="36px" />
              ) : (
                <span>{(profile?.display_name ?? "S").slice(0, 1).toUpperCase()}</span>
              )}
            </span>
            <div className="pulse-viewer-header-copy">
              <strong>{profile?.display_name ?? "SNAAR"}</strong>
              <span id={titleId}>{moment.title}</span>
            </div>
            <button className="pulse-viewer-close" type="button" aria-label="Sluit verhaal" onClick={onClose}>
              <X size={20} aria-hidden />
            </button>
          </header>

          {moment.image_url ? <Image src={moment.image_url} alt="" fill sizes="(max-width: 640px) 100vw, 430px" /> : null}

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
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`
                }}
              >
                {layer.text}
              </span>
            ))}
          </div>

          {!moment.layers.length && previewText ? (
            <p className="pulse-viewer-fallback-text">{previewText}</p>
          ) : null}

          <button className="pulse-viewer-nav-zone prev" type="button" aria-label="Vorig verhaal" onClick={() => goTo(index - 1)} />
          <button className="pulse-viewer-nav-zone next" type="button" aria-label="Volgend verhaal" onClick={() => goTo(index + 1)} />

          {isLoggedIn ? (
            <div className="pulse-viewer-actions">
              <button
                className={`pulse-viewer-action${hasReacted ? " active" : ""}`}
                type="button"
                onClick={handleReact}
              >
                <Heart size={20} aria-hidden fill={hasReacted ? "currentColor" : "none"} />
                Dit raakte mij
              </button>
              <button
                className={`pulse-viewer-action${hasSaved ? " active" : ""}`}
                type="button"
                onClick={handleSave}
              >
                <Bookmark size={20} aria-hidden fill={hasSaved ? "currentColor" : "none"} />
                Bewaar dit moment
              </button>
            </div>
          ) : null}
        </article>
      </div>
    </div>,
    document.body
  );
}
