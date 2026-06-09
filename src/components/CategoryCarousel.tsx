"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fallbackThemeImage, themeImages } from "@/lib/theme-images";
import type { CommunityCategory } from "@/types/content";

export function CategoryCarousel({ categories }: { categories: CommunityCategory[] }) {
  const count = categories.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideOffsets, setSlideOffsets] = useState<number[]>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hasMultiple = count > 1;
  const activeRealIndex = count ? activeIndex : 0;
  const activeCategoryTitle = categories[activeRealIndex]?.title ?? "thema";

  useEffect(() => {
    if (!hasMultiple) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [count, hasMultiple]);

  useEffect(() => {
    setActiveIndex((current) => (count ? Math.min(current, count - 1) : 0));
  }, [count]);

  useEffect(() => {
    function measureSlides() {
      const viewportWidth = viewportRef.current?.clientWidth ?? 0;
      const lastSlide = slideRefs.current[categories.length - 1];
      const maxOffset = lastSlide ? Math.max(lastSlide.offsetLeft + lastSlide.offsetWidth - viewportWidth, 0) : 0;
      setSlideOffsets(categories.map((_, index) => Math.min(slideRefs.current[index]?.offsetLeft ?? 0, maxOffset)));
    }

    measureSlides();
    window.addEventListener("resize", measureSlides);
    return () => window.removeEventListener("resize", measureSlides);
  }, [categories]);

  function goTo(index: number) {
    if (!count) return;
    setActiveIndex(((index % count) + count) % count);
  }

  function moveBy(amount: number) {
    if (!count) return;
    setActiveIndex((current) => ((current + amount) % count + count) % count);
  }

  return (
    <div className="category-carousel" aria-label="Thema's">
      <div className="category-carousel-viewport" ref={viewportRef}>
        <div
          className="category-grid"
          style={{
            transform: `translateX(-${slideOffsets[activeRealIndex] ?? 0}px)`
          }}
        >
          {categories.map((category, index) => {
            return (
              <Link
                key={category.id}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                className={`category-card category-card-linked${index === 0 ? " featured" : ""}`}
                href={`/themas/${category.slug}`}
                aria-current={index === activeRealIndex ? "true" : undefined}
              >
                <Image src={themeImages[category.slug] ?? fallbackThemeImage} alt="" width={760} height={520} />
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {hasMultiple ? (
        <div className="category-carousel-controls" aria-label={`Navigatie voor ${activeCategoryTitle}`}>
          <button type="button" className="category-arrow" onClick={() => moveBy(-1)} aria-label="Vorig thema">
            <ChevronLeft aria-hidden />
          </button>
          <div className="category-dots" role="radiogroup" aria-label="Kies een thema">
            {categories.map((category, index) => (
              <label key={category.id} className="category-dot">
                <input
                  type="radio"
                  name="category-carousel"
                  checked={index === activeRealIndex}
                  onChange={() => goTo(index)}
                  aria-label={category.title}
                />
                <span aria-hidden />
              </label>
            ))}
          </div>
          <button type="button" className="category-arrow" onClick={() => moveBy(1)} aria-label="Volgend thema">
            <ChevronRight aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
