"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { site } from "@/lib/site";
import { isCommunityStandaloneBuild } from "@/lib/community-visibility";
import type { SocialLinks } from "@/types/content";

type HeaderProps = {
  socialLinks: SocialLinks;
  spotifyUrl?: string | null;
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/podcast", label: "Podcast" },
  ...(isCommunityStandaloneBuild() ? [{ href: "/community", label: "Community" }] : [])
];

export function Header(_props: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const logoTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileSidebarRef = useRef<HTMLElement>(null);
  const navTabIndex = open ? undefined : -1;
  const isCommunityPage = pathname === "/community";
  const headerLogo = isCommunityPage ? "/img/icons_SNAAR/snaar_cirkel.png" : site.logo;
  const headerLogoAlt = isCommunityPage ? "SNAAR logo" : "Stuk Verdriet logo";
  const visibleNavLinks = isCommunityPage
    ? navLinks.filter((link) => link.href !== "/podcast" && link.href !== "/community")
    : navLinks;

  function closeSidebar() {
    setOpen(false);
    window.requestAnimationFrame(() => logoTriggerRef.current?.focus());
  }

  function openSidebar() {
    if (open) {
      closeSidebar();
      return;
    }
    setOpen(true);
  }

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 759px)").matches;
    document.body.style.overflow = open && isMobile ? "hidden" : "";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => logoTriggerRef.current?.focus());
        return;
      }

      if (event.key !== "Tab" || !open || !isMobile) return;

      const selectors = [
        ".site-header .header-logo-trigger",
        ".sidebar-overlay",
        ".mobile-sidebar.open a[href]",
        ".mobile-sidebar.open button:not([disabled])",
        ".community-account-dock a[href]",
        ".community-account-dock button:not([disabled])",
        ".community-account-dock input:not([disabled])",
        ".community-account-dock textarea:not([disabled])"
      ].join(",");
      const focusable = Array.from(document.querySelectorAll<HTMLElement>(selectors)).filter((element) => {
        const styles = window.getComputedStyle(element);
        return styles.display !== "none" && styles.visibility !== "hidden" && element.getClientRects().length > 0;
      });
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!focusable.includes(document.activeElement as HTMLElement)) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    if (open && isMobile) {
      window.requestAnimationFrame(() => {
        mobileSidebarRef.current?.querySelector<HTMLElement>(".close-button")?.focus();
      });
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const logoTrigger = open ? (
    <button ref={logoTriggerRef} className="header-logo-trigger" type="button" onClick={openSidebar} aria-label="Menu sluiten" aria-expanded="true" aria-controls="primary-navigation">
      <Image src={headerLogo} alt={headerLogoAlt} width={300} height={380} priority />
    </button>
  ) : (
    <button ref={logoTriggerRef} className="header-logo-trigger" type="button" onClick={openSidebar} aria-label="Menu openen" aria-expanded="false" aria-controls="primary-navigation">
      <Image src={headerLogo} alt={headerLogoAlt} width={300} height={380} priority />
    </button>
  );

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo" aria-label="Stuk Verdriet home">
          <Image src={headerLogo} alt={headerLogoAlt} width={70} height={88} />
        </Link>
        <button className="close-button" type="button" onClick={closeSidebar} aria-label="Menu sluiten">
          <X size={18} aria-hidden />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Mobiele navigatie">
        {visibleNavLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={pathname === link.href ? "active" : undefined}>
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <header className={`site-header${isCommunityPage ? " community-logo-header" : ""}${open ? " nav-open" : ""}`}>
        <div className="header-inner">
          {logoTrigger}

          <nav className="desktop-nav" id="primary-navigation" aria-label="Hoofdnavigatie" data-open={open ? "true" : "false"}>
            {visibleNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : undefined} onClick={() => setOpen(false)} tabIndex={navTabIndex}>
                {link.label}
              </Link>
            ))}

            <div className="nav-social-icons" aria-label="Social media links">
              <a href="https://www.instagram.com/stukverdrietdepodcast/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Image src="/img/instagram.png" alt="Instagram" width={20} height={20} />
              </a>
              <a href="https://www.facebook.com/stukverdriet" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Image src="/img/facebook.png" alt="Facebook" width={20} height={20} />
              </a>
              <a href="https://www.tiktok.com/@stuk.verdriet" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <Image src="/img/tik-tok.png" alt="TikTok" width={20} height={20} />
              </a>
            </div>
          </nav>

        </div>
      </header>

      {open ? <button className="sidebar-overlay" type="button" aria-label="Menu sluiten" onClick={closeSidebar} /> : null}

      {open ? (
        <aside ref={mobileSidebarRef} className="mobile-sidebar open" aria-hidden="false" aria-modal="true" role="dialog" aria-label="Mobiele navigatie">
          {sidebarContent}
        </aside>
      ) : (
        <aside ref={mobileSidebarRef} className="mobile-sidebar" aria-hidden="true" inert>
          {sidebarContent}
        </aside>
      )}
    </>
  );
}
