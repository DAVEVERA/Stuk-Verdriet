"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { site } from "@/lib/site";

function SpotifyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/podcast", label: "Podcast" },
  { href: "/themas", label: "Thema's" }
];

export function Header({ spotifyUrl }: { spotifyUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="header-logo" aria-label="Stuk Verdriet home">
            <Image src={site.logo} alt="Stuk Verdriet logo" width={300} height={380} priority />
          </Link>

          <nav className="desktop-nav" aria-label="Hoofdnavigatie">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : undefined}>
                {link.label}
              </Link>
            ))}
            <Link href="/bijsluiter" className="story-link">
              Deel je verhaal
            </Link>
            {spotifyUrl ? (
              <a className="nav-spotify-link" href={spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label="Luister op Spotify">
                <SpotifyIcon size={22} />
              </a>
            ) : null}
          </nav>

          <button className="menu-button" type="button" onClick={() => setOpen(true)} aria-label="Menu openen" aria-expanded={open}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {open ? <button className="sidebar-overlay" type="button" aria-label="Menu sluiten" onClick={() => setOpen(false)} /> : null}

      <aside className={`mobile-sidebar${open ? " open" : ""}`} aria-hidden={!open}>
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
          {spotifyUrl ? (
            <a className="nav-spotify-link" href={spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label="Luister op Spotify" onClick={() => setOpen(false)}>
              <SpotifyIcon size={22} /> Spotify
            </a>
          ) : null}
        </nav>
      </aside>
    </>
  );
}
