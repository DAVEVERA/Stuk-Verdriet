"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroPodcastPlayer } from "@/components/HeroPodcastPlayer";
import type { PodcastEpisode } from "@/types/content";

type HeroSlide = {
  image: string;
  mobileImage: string;
  imageAlt: string;
  imageClassName: string;
  heroClassName: string;
  slogan: [string, string];
};

const slides: HeroSlide[] = [
  {
    image: "/img/podcastopnamehero.png",
    mobileImage: "/img/mobile/podcastopnameheromobiel.png",
    imageAlt: "Susan en Daniela tijdens een podcastopname",
    imageClassName: "hero-slide-image-podcast",
    heroClassName: "hero-state-podcast",
    slogan: ["Verdriet verdient", "een stem."]
  },
  {
    image: "/img/Laviehero.png",
    mobileImage: "/img/mobile/Lavieheromobiel.png",
    imageAlt: "Podcastopstelling bij La Vie met microfoons en een roze bank",
    imageClassName: "hero-slide-image-lavie",
    heroClassName: "hero-state-lavie",
    slogan: ["Woorden geven aan", "wat niet te bevatten is."]
  },
  {
    image: "/hero/herostartbutterfly.png",
    mobileImage: "/hero/herostartbutterfly.png",
    imageAlt: "Een vlinder rust op een uitgestoken hand",
    imageClassName: "hero-slide-image-butterfly",
    heroClassName: "hero-state-butterfly",
    slogan: ["Samen door wat niemand", "alleen zou moeten dragen."]
  }
];

export function HeroSlider({ siteName, latest, episodes }: { siteName: string; latest: PodcastEpisode | null; episodes: PodcastEpisode[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6200);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className={`hero hero-slider ${activeSlide.heroClassName}`} id="home" aria-label="Stuk Verdriet introductie">
      <div className="hero-slide-stack" aria-hidden="true">
        {slides.map((slide, index) => (
          <div className={`hero-slide${index === activeIndex ? " active" : ""}`} key={`${slide.image}-${index}`}>
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={`hero-slide-desktop-image ${slide.imageClassName}`}
            />
            <Image
              src={slide.mobileImage}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={`hero-slide-mobile-image ${slide.imageClassName}`}
            />
          </div>
        ))}
      </div>
      <div className="hero-slider-wash" aria-hidden="true" />
      <div className="hero-copy">
        <h1>{siteName}</h1>
        <div className="hero-slogan-art slogan-text" aria-label={activeSlide.slogan.join(" ")}>
          <span>{activeSlide.slogan[0]}</span>
          <span>{activeSlide.slogan[1]}</span>
        </div>
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
      <HeroPodcastPlayer latest={latest} episodes={episodes} />
    </section>
  );
}
