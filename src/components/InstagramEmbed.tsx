"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";

export function InstagramEmbed({ permalink }: { permalink: string }) {
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

  return (
    <div className="insta-embed">
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
    </div>
  );
}
