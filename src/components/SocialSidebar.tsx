"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import type { SocialLinks } from "@/types/content";

type SocialSidebarProps = {
  socialLinks: SocialLinks;
};

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 1 1-.277-1.215c3.809-.871 7.077-.496 9.712 1.115a.623.623 0 0 1 .207.857Zm1.223-2.723a.78.78 0 0 1-1.072.257c-2.688-1.652-6.786-2.131-9.965-1.166a.78.78 0 1 1-.453-1.492c3.63-1.102 8.147-.568 11.233 1.329a.78.78 0 0 1 .257 1.072Zm.105-2.834C14.692 9.01 9.375 8.834 6.297 9.77a.935.935 0 1 1-.543-1.789c3.533-1.073 9.404-.865 13.115 1.338a.935.935 0 0 1-.955 1.548Z"
      />
    </svg>
  );
}

// Parses an rgb()/rgba() color string into perceptual luminance (0 = black, 1 = white).
// Returns null when the color can't be parsed or is fully transparent.
function luminanceFromColor(color: string): number | null {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => parseFloat(part.trim()));
  const [r, g, b, a = 1] = parts;
  if ([r, g, b].some((value) => Number.isNaN(value))) return null;
  if (a === 0) return null;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Walks up from the element under the sidebar until it finds a non-transparent
// background, then reports whether that background reads as "light".
function isPointOverLightBackground(x: number, y: number): boolean | null {
  let el = document.elementFromPoint(x, y) as Element | null;
  while (el) {
    const bg = window.getComputedStyle(el).backgroundColor;
    const luminance = luminanceFromColor(bg);
    if (luminance !== null) {
      return luminance > 0.6;
    }
    el = el.parentElement;
  }
  return null;
}

export function SocialSidebar({ socialLinks }: SocialSidebarProps) {
  const asideRef = useRef<HTMLElement>(null);
  const [isOnLight, setIsOnLight] = useState(false);

  useEffect(() => {
    let frame = 0;

    const checkBackground = () => {
      frame = 0;
      const node = asideRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = Math.min(Math.max(rect.left - 1, 1), window.innerWidth - 1);
      const y = rect.top + rect.height / 2;
      const previousPointerEvents = node.style.pointerEvents;
      node.style.pointerEvents = "none";
      const onLight = isPointOverLightBackground(x, y);
      node.style.pointerEvents = previousPointerEvents;
      if (onLight !== null) {
        setIsOnLight(onLight);
      }
    };

    const scheduleCheck = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(checkBackground);
    };

    checkBackground();
    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck);

    const resizeObserver = new ResizeObserver(scheduleCheck);
    resizeObserver.observe(document.body);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      resizeObserver.disconnect();
    };
  }, []);

  const links = [
    {
      href: socialLinks.instagram_url ?? "https://www.instagram.com/stukverdrietdepodcast/",
      label: "Instagram",
      icon: <Image src="/img/instagram.png" alt="" width={20} height={20} />
    },
    {
      href: socialLinks.tiktok_url ?? "https://www.tiktok.com/@stuk.verdriet",
      label: "TikTok",
      icon: <Image src="/img/tik-tok.png" alt="" width={20} height={20} />
    },
    {
      href: socialLinks.spotify_url ?? "https://open.spotify.com/show/033OI50e7tsd9mWq3TuUQy",
      label: "Spotify",
      icon: <SpotifyIcon />
    },
    {
      href: "mailto:info@stukverdriet.nl",
      label: "E-mail",
      icon: <Mail size={20} strokeWidth={1.75} aria-hidden />
    }
  ];

  return (
    <aside
      ref={asideRef}
      className={`social-sidebar${isOnLight ? " is-on-light" : ""}`}
      aria-label="Social media"
    >
      <div className="social-sidebar-links">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            aria-label={link.label}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </aside>
  );
}
