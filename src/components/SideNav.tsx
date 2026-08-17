"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Headphones, Home, Users } from "lucide-react";
import { useSectionContrast } from "@/hooks/useSectionContrast";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/podcast", label: "Podcast", icon: Headphones },
  { href: "/community", label: "Community", icon: Users }
];

export function SideNav() {
  const pathname = usePathname();
  const isCommunityPage = pathname === "/community" || pathname.startsWith("/community/");
  const railRef = useRef<HTMLElement | null>(null);
  const isOnLight = useSectionContrast(railRef, [pathname]);

  return (
    <nav
      ref={railRef}
      className={isOnLight ? "site-side-nav is-on-light" : "site-side-nav"}
      aria-label="Hoofdnavigatie"
      data-community-context={isCommunityPage ? "true" : undefined}
    >
      <div className="site-side-nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "active" : undefined}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={1.9} aria-hidden />
              <span className="site-side-nav-tooltip">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
