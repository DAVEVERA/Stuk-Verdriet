"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import type { SocialLinks } from "@/types/content";

type HeaderProps = {
  socialLinks: SocialLinks;
  spotifyUrl?: string | null;
  logoUrl?: string;
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/podcast", label: "Podcast" },
  { href: "/community", label: "Community" }
];

export function Header({ logoUrl }: HeaderProps) {
  const pathname = usePathname();
  const isCommunityPage = pathname === "/community";
  const headerLogo = isCommunityPage ? "/img/icons_SNAAR/snaar_cirkel.png" : logoUrl || site.logo;
  const headerLogoAlt = isCommunityPage ? "SNAAR logo" : "Stuk Verdriet logo";
  const visibleNavLinks = isCommunityPage
    ? navLinks.filter((link) => link.href !== "/podcast" && link.href !== "/community")
    : navLinks;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          href="/"
          className={isCommunityPage ? "header-home-link is-bare" : "header-home-link"}
          aria-label="Naar de homepage"
        >
          <Image src={headerLogo} alt={headerLogoAlt} width={70} height={88} priority />
        </Link>

        <nav className="header-nav" aria-label="Hoofdnavigatie">
          {visibleNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
