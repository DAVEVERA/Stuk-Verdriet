"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { site } from "@/lib/site";
import type { SocialLinks } from "@/types/content";

type HeaderProps = {
  socialLinks: SocialLinks;
  spotifyUrl?: string | null;
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/podcast", label: "Podcast" }
];

export function Header(_props: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navTabIndex = open ? undefined : -1;

  function openSidebar() {
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
      </nav>
    </>
  );

  return (
    <>
      <header className={`site-header${open ? " nav-open" : ""}`}>
        <div className="header-inner">
          {logoTrigger}

          <nav className="desktop-nav" id="primary-navigation" aria-label="Hoofdnavigatie" data-open={open ? "true" : "false"}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : undefined} onClick={() => setOpen(false)} tabIndex={navTabIndex}>
                {link.label}
              </Link>
            ))}

            <div className="nav-social-icons" aria-label="Social media links">
              <a href="https://www.instagram.com/stukverdrietdepodcast/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Image src="/img/instagram.png" alt="" width={20} height={20} />
              </a>
              <a href="https://www.facebook.com/stukverdriet" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Image src="/img/facebook.png" alt="" width={20} height={20} />
              </a>
              <a href="https://www.tiktok.com/@stuk.verdriet" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <Image src="/img/tik-tok.png" alt="" width={20} height={20} />
              </a>
            </div>
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
