"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Sections rendered with a visually dark background (photo hero, dark
 * banners). Fixed glass navigation defaults to the "on dark" treatment and
 * flips to the light/sage treatment whenever it overlaps one of these
 * sections - mirrors the color-shift behaviour used for the social sidebar.
 */
const DARK_SECTION_SELECTOR =
  "[data-nav-contrast='dark'], .hero, .community-hero-banner, .theme-article-hero";

/**
 * Tracks whether the fixed element referenced by `ref` currently overlaps a
 * "light" page section (i.e. NOT one of the dark full-bleed sections), so
 * callers can flip their glass styling for contrast.
 */
export function useSectionContrast(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  const [isOnLight, setIsOnLight] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const darkSections = Array.from(document.querySelectorAll<HTMLElement>(DARK_SECTION_SELECTOR));
    if (!darkSections.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOnLight(true);
      return;
    }

    const visibility = new Map<Element, number>();

    function recompute() {
      const rect = element?.getBoundingClientRect();
      if (!rect) return;
      const mid = rect.top + rect.height / 2;
      let coveredByDark = false;
      for (const [section, ratio] of visibility) {
        if (ratio <= 0) continue;
        const sectionRect = (section as Element).getBoundingClientRect();
        if (mid >= sectionRect.top && mid <= sectionRect.bottom) {
          coveredByDark = true;
          break;
        }
      }
      setIsOnLight(!coveredByDark);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target, entry.intersectionRatio);
        }
        recompute();
      },
      { threshold: [0, 0.05, 0.25, 0.5, 0.75, 1] }
    );

    darkSections.forEach((section) => observer.observe(section));
    recompute();

    window.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", recompute);
      window.removeEventListener("resize", recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return isOnLight;
}
