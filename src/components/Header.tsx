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

export function Header({ logoUrl }: HeaderProps) {
  const pathname = usePathname();
  const isCommunityPage = pathname === "/community";
  const headerLogo = isCommunityPage ? "/img/icons_SNAAR/snaar_cirkel.png" : logoUrl || site.logo;
  const headerLogoAlt = isCommunityPage ? "SNAAR logo" : "Stuk Verdriet logo";

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
      </div>
    </header>
  );
}
