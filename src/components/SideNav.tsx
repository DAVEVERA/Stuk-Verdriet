"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Headphones, Home, Mail, Users } from "lucide-react";
import { useSectionContrast } from "@/hooks/useSectionContrast";
import { site } from "@/lib/site";
import type { SocialLinks } from "@/types/content";

type SideNavProps = {
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

export function SideNav({ socialLinks }: SideNavProps) {
  const pathname = usePathname();
  const isCommunityPage = pathname === "/community" || pathname.startsWith("/community/");
  const railRef = useRef<HTMLElement | null>(null);
  const isOnLight = useSectionContrast(railRef, [pathname]);

  const mainLinks = [
    {
      href: "/podcast",
      label: "Podcast",
      icon: <Headphones size={20} strokeWidth={1.9} aria-hidden />,
      active: pathname.startsWith("/podcast")
    },
    {
      href: "/",
      label: "Home",
      icon: <Home size={20} strokeWidth={1.9} aria-hidden />,
      active: pathname === "/"
    },
    {
      href: "/community",
      label: "Community",
      icon: <Users size={20} strokeWidth={1.9} aria-hidden />,
      active: isCommunityPage
    }
  ];

  const socialItems = [
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
      href: `mailto:${site.email}`,
      label: "E-mail",
      icon: <Mail size={20} strokeWidth={1.8} aria-hidden />
    }
  ];

  return (
    <aside
      ref={railRef}
      className={isOnLight ? "site-side-nav is-on-light" : "site-side-nav"}
      aria-label="Sitenavigatie"
      data-community-context={isCommunityPage ? "true" : undefined}
    >
      <div className="site-side-nav-shell">
        <nav className="site-side-nav-group site-side-nav-main" aria-label="Hoofdnavigatie">
          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-side-nav-link${item.active ? " active" : ""}`}
              aria-label={item.label}
              aria-current={item.active ? "page" : undefined}
            >
              {item.icon}
              <span className="site-side-nav-tooltip">{item.label}</span>
            </Link>
          ))}
        </nav>

        <span className="site-side-nav-separator site-side-nav-social-separator" aria-hidden="true" />

        <nav className="site-side-nav-group site-side-nav-social" aria-label="Social media">
          {socialItems.map((item) => {
            const isEmail = item.href.startsWith("mailto:");
            return (
              <a
                key={item.label}
                href={item.href}
                className="site-side-nav-link site-side-nav-social-link"
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noopener noreferrer"}
                aria-label={item.label}
              >
                {item.icon}
                <span className="site-side-nav-tooltip">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
