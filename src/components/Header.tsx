"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { site } from "@/lib/site";

const navLinks = [
  { href: "/#home", label: "Home" },
  { href: "/#podcast", label: "Podcast" },
  { href: "/#themas", label: "Thema's" }
];

export function Header() {
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
              <Link key={link.href} href={link.href} className={pathname === "/" && link.href === "/#home" ? "active" : undefined}>
                {link.label}
              </Link>
            ))}
            <Link href="/#deel-je-verhaal" className="story-link">
              Deel je verhaal
            </Link>
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
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={pathname === "/" && link.href === "/#home" ? "active" : undefined}>
              {link.label}
            </Link>
          ))}
          <Link href="/#deel-je-verhaal" onClick={() => setOpen(false)} className="story-link">
            Deel je verhaal
          </Link>
        </nav>
      </aside>
    </>
  );
}
