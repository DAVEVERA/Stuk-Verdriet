"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CommunityCategory } from "@/types/content";

const themeImages: Record<string, string> = {
  "rouw-algemeen": "/img/theme-rouw.jpg",
  "voor-ouders": "/img/theme-ouders.jpg",
  "voor-ayas": "/img/theme-ayas.png",
  "naasten-en-familie": "/img/theme-naasten.jpg",
  "voor-broers-en-zussen": "/img/theme-naasten.jpg",
  "praktische-steun": "/img/theme-praktisch.jpg",
  "vragen-en-antwoorden": "/img/theme-vragen-lieveheersbeestje.jpg",
  "verhalen-en-herkenning": "/img/theme-herkenning.jpg"
};

export function CategoryCarousel({ categories }: { categories: CommunityCategory[] }) {
  const count = categories.length;
  const [activeIndex, setActiveIndex] = useState(() => categories.length);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [slideOffsets, setSlideOffsets] = useState<number[]>([]);
  const slideRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hasMultiple = count > 1;
  const renderedCategories = useMemo(() => (hasMultiple ? [...categories, ...categories, ...categories] : categories), [categories, hasMultiple]);
  const activeRealIndex = count ? ((activeIndex % count) + count) % count : 0;

  const activeCategoryTitle = useMemo(() => categories[activeRealIndex]?.title ?? "thema", [activeRealIndex, categories]);

  useEffect(() => {
    if (!hasMultiple) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setTransitionEnabled(true);
      setActiveIndex((current) => current + 1);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [count, hasMultiple]);

  useEffect(() => {
    function measureSlides() {
      setSlideOffsets(renderedCategories.map((_, index) => slideRefs.current[index]?.offsetLeft ?? 0));
    }

    measureSlides();
    window.addEventListener("resize", measureSlides);
    return () => window.removeEventListener("resize", measureSlides);
  }, [renderedCategories]);

  function goTo(index: number) {
    if (!count) return;
    setTransitionEnabled(true);
    setActiveIndex(count + ((index % count) + count) % count);
  }

  function moveBy(amount: number) {
    setTransitionEnabled(true);
    setActiveIndex((current) => current + amount);
  }

  function handleTransitionEnd() {
    if (!hasMultiple) return;
    if (activeIndex >= count * 2 || activeIndex < count) {
      setTransitionEnabled(false);
      setActiveIndex(count + activeRealIndex);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }
  }

  return (
    <div className="category-carousel" aria-label="Thema's">
      <div className="category-carousel-viewport">
        <div
          className="category-grid"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(-${slideOffsets[activeIndex] ?? 0}px)`,
            transition: transitionEnabled ? undefined : "none"
          }}
        >
          {renderedCategories.map((category, index) => {
            const realIndex = count ? index % count : index;
            const isPrimarySet = !hasMultiple || Math.floor(index / count) === 1;
            return (
            <Link
              key={`${category.id}-${index}`}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              className={`category-card category-card-linked${realIndex === 0 ? " featured" : ""}`}
              href={`/themas?theme=${category.slug}`}
              aria-current={isPrimarySet && realIndex === activeRealIndex ? "true" : undefined}
              aria-hidden={isPrimarySet ? undefined : true}
              tabIndex={isPrimarySet ? undefined : -1}
            >
              <Image src={themeImages[category.slug] ?? "/img/theme-rouw.jpg"} alt="" width={760} height={520} />
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
