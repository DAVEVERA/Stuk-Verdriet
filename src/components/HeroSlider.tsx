"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroPodcastPlayer } from "@/components/HeroPodcastPlayer";
import { defaultSiteContent } from "@/lib/site-content";
import type { PodcastEpisode, SiteHeroSlide } from "@/types/content";

const slideImageClasses = ["hero-slide-image-podcast", "hero-slide-image-lavie", "hero-slide-image-episode-live"];
const slideHeroClasses = ["hero-state-podcast", "hero-state-lavie", "hero-state-butterfly"];

export function HeroSlider({ siteName, latest, episodes, configuredSlides }: { siteName: string; latest: PodcastEpisode | null; episodes: PodcastEpisode[]; configuredSlides?: SiteHeroSlide[] }) {
  const enabledSlides = configuredSlides?.filter((slide) => slide.enabled) ?? [];
  const slides = enabledSlides.length ? enabledSlides : [defaultSiteContent.heroSlides[0]];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const mobileSlogan = activeSlide.mobileSlogan ?? activeSlide.slogan;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6200);
    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  return (
    <section className={`hero hero-slider ${slideHeroClasses[activeIndex] ?? slideHeroClasses[0]}`} id="home" aria-label="Stuk Verdriet introductie">
      <div className="hero-visual">
        <div className="hero-slide-stack" aria-hidden="true">
          {slides.map((slide, index) => (
            <div className={`hero-slide${index === activeIndex ? " active" : ""}`} key={`${slide.image}-${index}`}>
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className={`hero-slide-desktop-image ${slideImageClasses[index] ?? slideImageClasses[0]}`}
              />
              <Image
                src={slide.mobileImage}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className={`hero-slide-mobile-image ${slideImageClasses[index] ?? slideImageClasses[0]}`}
              />
            </div>
          ))}
        </div>
        <div className="hero-slider-wash" aria-hidden="true" />
        <div className="hero-copy">
          <p className={activeSlide.hideCopy ? "sr-only" : "hero-site-title"}>{siteName}</p>
          {!activeSlide.hideCopy ? (
            <>
              <div className="hero-slogan-art hero-slogan-art-desktop slogan-text" aria-label={activeSlide.slogan.join(" ")}>
                <span>{activeSlide.slogan[0]}</span>
                <span>{activeSlide.slogan[1]}</span>
              </div>
              <div className="hero-slogan-art hero-slogan-art-mobile slogan-text" aria-label={mobileSlogan.join(" ")}>
                {mobileSlogan.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </>
          ) : null}
          <div className="hero-slider-dots" role="tablist" aria-label="Kies hero slide">
            {slides.map((slide, index) =>
              index === activeIndex ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-label={`Toon slide ${index + 1}: ${slide.slogan.join(" ")}`}
                  className="active"
                  key={`${slide.slogan[0]}-${index}`}
                  onClick={() => setActiveIndex(index)}
                />
              ) : (
                <button
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-label={`Toon slide ${index + 1}: ${slide.slogan.join(" ")}`}
                  key={`${slide.slogan[0]}-${index}`}
                  onClick={() => setActiveIndex(index)}
                />
              )
            )}
          </div>
        </div>
      </div>
      <HeroPodcastPlayer latest={latest} episodes={episodes} />
    </section>
  );
}
