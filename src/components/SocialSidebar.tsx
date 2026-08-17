"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import type { SocialLinks } from "@/types/content";

type SocialSidebarProps = {
  socialLinks: SocialLinks;
};

export function SocialSidebar({ socialLinks }: SocialSidebarProps) {
  const pathname = usePathname();
  return <SocialSidebarInner key={pathname} pathname={pathname} socialLinks={socialLinks} />;
}

function SocialSidebarInner({ pathname, socialLinks }: { pathname: string; socialLinks: SocialLinks }) {
  const isLandingPage = pathname === "/";
  const [expanded, setExpanded] = useState(!isLandingPage);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer.footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const isOpen = expanded || footerVisible;

  const links = [
    {
      href: socialLinks.instagram_url ?? "https://www.instagram.com/stukverdrietdepodcast/",
      label: "Instagram",
      icon: "/img/instagram.png"
    },
    {
      href: socialLinks.facebook_url ?? "https://www.facebook.com/stukverdriet",
      label: "Facebook",
      icon: "/img/facebook.png"
    },
    {
      href: socialLinks.tiktok_url ?? "https://www.tiktok.com/@stuk.verdriet",
      label: "TikTok",
      icon: "/img/tik-tok.png"
    }
  ];

  return (
    <aside className={isOpen ? "social-sidebar open" : "social-sidebar"} aria-label="Social media">
      <button
        className="social-sidebar-toggle"
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Social media inklappen" : "Social media uitklappen"}
      >
        <Share2 size={13} aria-hidden />
      </button>
      <div className="social-sidebar-links">
        {links.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
            <Image src={link.icon} alt="" width={20} height={20} />
          </a>
        ))}
      </div>
    </aside>
  );
}
