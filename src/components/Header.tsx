"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Instagram, Music2, X } from "lucide-react";
import { site } from "@/lib/site";
import type { SocialLinks } from "@/types/content";

function SpotifyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M16.6 5.82c1.18.84 2.36 1.31 3.72 1.41v3.08a8.76 8.76 0 0 1-3.7-.82v5.67c0 3.18-2.58 5.76-5.76 5.76a5.76 5.76 0 0 1-2.2-11.08 5.8 5.8 0 0 1 2.2-.43c.33 0 .65.03.96.09v3.22a2.58 2.58 0 1 0 1.95 2.5V3.08h2.83v2.74Z" />
    </svg>
  );
}

function GoFundMeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2.8c.36 0 .67.25.74.61l.44 2.45 2.03-1.5a.75.75 0 1 1 .89 1.2l-2.03 1.51 2.49.92a.75.75 0 0 1-.52 1.41l-2.48-.92v2.52a.75.75 0 0 1-1.5 0V8.48l-2.48.92a.75.75 0 1 1-.52-1.41l2.49-.92-2.03-1.51a.75.75 0 1 1 .89-1.2l2.03 1.5.44-2.45c.07-.36.38-.61.74-.61Zm0 10.05c3.18 0 5.75 1.92 5.75 4.28S15.18 21.4 12 21.4s-5.75-1.91-5.75-4.27S8.82 12.85 12 12.85Zm0 1.78c-2.02 0-3.66 1.12-3.66 2.5s1.64 2.5 3.66 2.5 3.66-1.12 3.66-2.5-1.64-2.5-3.66-2.5Z" />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/podcast", label: "Podcast" },
  { href: "/themas", label: "Thema's" }
];

const socialSidebarLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/stukverdrietdepodcast/",
    className: "sv-instagram",
    icon: <Instagram size={24} aria-hidden />
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@stukverdrietdepodcast",
    className: "sv-tiktok",
    icon: <TikTokIcon size={24} />
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/search/stuk%20verdriet%20de%20podcast",
    className: "sv-spotify",
    icon: <SpotifyIcon size={24} />
  },
  {
    label: "GoFundMe",
    href: "https://www.gofundme.com/f/help-ons-stichting-stuk-verdriet-werkelijkheid-maken",
    className: "sv-gofundme",
    icon: <GoFundMeIcon size={24} />
  }
];

export function Header({ socialLinks: _socialLinks, spotifyUrl }: { socialLinks: SocialLinks; spotifyUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const navTabIndex = open ? undefined : -1;
  const sidebarSocials = [
    { label: "Instagram", href: socialSidebarLinks[0].href, className: "sidebar-social-instagram", icon: <Instagram size={18} aria-hidden /> },
    { label: "TikTok", href: socialSidebarLinks[1].href, className: "sidebar-social-tiktok", icon: <TikTokIcon /> },
    { label: "Spotify", href: socialSidebarLinks[2].href, className: "sidebar-social-spotify", icon: <Music2 size={18} aria-hidden /> },
    { label: "GoFundMe", href: socialSidebarLinks[3].href, className: "sidebar-social-gofundme", icon: <GoFundMeIcon size={18} /> }
  ];

  function openSidebar() {
    setHasOpened(true);
    setOpen((current) => !current);
  }

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 759px)").matches;
    document.body.style.overflow = open && isMobile ? "hidden" : "";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const logoTrigger = open ? (
    <button className="header-logo-trigger" type="button" onClick={openSidebar} aria-label="Menu sluiten" aria-expanded="true" aria-controls="primary-navigation">
      <Image src={site.logo} alt="Stuk Verdriet logo" width={300} height={380} priority />
    </button>
  ) : (
    <button className="header-logo-trigger" type="button" onClick={openSidebar} aria-label="Menu openen" aria-expanded="false" aria-controls="primary-navigation">
      <Image src={site.logo} alt="Stuk Verdriet logo" width={300} height={380} priority />
    </button>
  );

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo" aria-label="Stuk Verdriet home">
          <Image src={site.logo} alt="Stuk Verdriet logo" width={70} height={88} />
        </Link>
        <button className="close-button" type="button" onClick={() => setOpen(false)} aria-label="Menu sluiten">
          <X size={18} aria-hidden />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Mobiele navigatie">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={pathname === link.href ? "active" : undefined}>
            {link.label}
          </Link>
        ))}
        <Link href="/bijsluiter" onClick={() => setOpen(false)} className="story-link">
          Deel je verhaal
        </Link>
      </nav>
      {hasOpened && sidebarSocials.length ? (
        <div className="sidebar-social-dock" aria-label="Social media">
          {sidebarSocials.map(({ className, href, icon, label }, index) => (
            <a
              className={`sidebar-social-link ${className} sidebar-social-delay-${index + 1}`}
              href={href}
              key={label}
              onClick={() => setOpen(false)}
              rel="noopener noreferrer"
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              aria-label={label}
            >
              {icon}
              <span>{label}</span>
            </a>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <nav className="sv-social-sidebar" aria-label="Social media en doneren">
        <div className="sv-social-tab" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {socialSidebarLinks.map((link) => (
          <a className={`sv-social-link ${link.className}`} href={link.href} key={link.label} rel="noopener noreferrer" target="_blank" aria-label={link.label}>
            {link.icon}
            <span>{link.label}</span>
          </a>
        ))}
      </nav>

      <header className={`site-header${open ? " nav-open" : ""}`}>
        <div className="header-inner">
          {logoTrigger}

          <nav className="desktop-nav" id="primary-navigation" aria-label="Hoofdnavigatie" data-open={open ? "true" : "false"}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : undefined} onClick={() => setOpen(false)} tabIndex={navTabIndex}>
                {link.label}
              </Link>
            ))}
            <Link href="/bijsluiter" className="story-link" onClick={() => setOpen(false)} tabIndex={navTabIndex}>
              Deel je verhaal
            </Link>
            {spotifyUrl ? (
              <a className="nav-spotify-link" href={spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label="Luister op Spotify" tabIndex={navTabIndex}>
                <SpotifyIcon size={22} />
              </a>
            ) : null}
          </nav>

        </div>
      </header>

      {open ? <button className="sidebar-overlay" type="button" aria-label="Menu sluiten" onClick={() => setOpen(false)} /> : null}

      {open ? (
        <aside className="mobile-sidebar open" aria-hidden="false">
          {sidebarContent}
        </aside>
      ) : (
        <aside className="mobile-sidebar" aria-hidden="true" inert>
          {sidebarContent}
        </aside>
      )}
    </>
  );
}
