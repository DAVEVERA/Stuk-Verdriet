"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";

export function InstagramEmbed({ permalink }: { permalink: string }) {
  const clipRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    const process = () => window.instgrm?.Embeds.process();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", process);
      return () => existing.removeEventListener("load", process);
    }
    const script = document.createElement("script");
    script.src = EMBED_SCRIPT_SRC;
    script.async = true;
    script.onload = process;
    document.body.appendChild(script);
  }, []);

  // De iframe groeit pas nadat Instagram de post heeft geladen; kijk of de
  // inhoud hoger wordt dan het ingeklapte venster zodat de knop alleen
  // verschijnt wanneer er echt iets te lezen valt.
  useEffect(() => {
    const el = clipRef.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 8);
    const resizeObserver = new ResizeObserver(check);
    const observeChildren = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(el);
      Array.from(el.children).forEach((child) => resizeObserver.observe(child));
    };
    const mutationObserver = new MutationObserver(() => {
      observeChildren();
      check();
    });
    mutationObserver.observe(el, { childList: true, subtree: true });
    observeChildren();
    check();
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className="insta-embed">
      <div ref={clipRef} className={expanded ? "insta-embed-clip expanded" : "insta-embed-clip"}>
        <blockquote
          className="instagram-media"
          data-instgrm-captioned=""
          data-instgrm-permalink={`${permalink}?utm_source=ig_embed&utm_campaign=loading`}
          data-instgrm-version="14"
          style={{
            background: "#fff",
            border: 0,
            borderRadius: "3px",
            boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
            margin: "1px",
            maxWidth: "540px",
            minWidth: "0",
            padding: 0,
            width: "calc(100% - 2px)"
          }}
        >
          <a href={permalink} target="_blank" rel="noreferrer">
            Bekijk dit bericht van Stuk Verdriet op Instagram
          </a>
        </blockquote>
        {!expanded && overflows && <div className="insta-embed-fade" aria-hidden />}
      </div>
      {(overflows || expanded) && (
        <button
          type="button"
          className="insta-embed-toggle"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Toon minder" : "Lees meer…"}
        </button>
      )}
    </div>
  );
}
