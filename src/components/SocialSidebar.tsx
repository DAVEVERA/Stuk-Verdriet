"use client";

import Image from "next/image";
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

export function SocialSidebar({ socialLinks }: SocialSidebarProps) {
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
      href: "mailto:info@stukverdriet.com",
      label: "E-mail",
      icon: <Mail size={20} strokeWidth={1.75} aria-hidden />
    }
  ];

  return (
    <aside className="social-sidebar" aria-label="Social media">
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
