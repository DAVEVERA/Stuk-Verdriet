"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroSlide = {
  image: string;
  mobileImage: string;
  imageAlt: string;
  imageClassName: string;
  slogan: [string, string];
  cta: string;
  href: string;
};

const slides: HeroSlide[] = [
  {
    image: "/hero/headerduo-upscaled.png",
    mobileImage: "/img/mobile/headerduo.png",
    imageAlt: "Susan en Daniela in een zachte bosrijke omgeving",
    imageClassName: "hero-slide-image-duo",
    slogan: ["Je staat er niet", "alleen voor."],
    cta: "Luister nu",
    href: "/podcast"
  },
  {
    image: "/img/hero2.png",
    mobileImage: "/img/mobile/headerduo.png",
    imageAlt: "Susan en Daniela samen aan tafel",
    imageClassName: "hero-slide-image-table",
    slogan: ["Verdriet verdient", "een stem."],
    cta: "Luister nu",
    href: "/podcast"
  },
  {
    image: "/img/hero2.png",
    mobileImage: "/img/mobile/headerduo.png",
    imageAlt: "Susan en Daniela in gesprekssfeer",
    imageClassName: "hero-slide-image-close",
    slogan: ["Verhalen geven", "houvast."],
    cta: "Luister nu",
    href: "/podcast"
  }
];

export function HeroSlider({ siteName }: { siteName: string }) {
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
    <section className="hero hero-slider" id="home" aria-label="Stuk Verdriet introductie">
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
              className="hero-slide-mobile-image"
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
        <div className="subtle-actions">
          <Link href={activeSlide.href}>{activeSlide.cta}</Link>
        </div>
        <div className="hero-slider-dots" role="tablist" aria-label="Kies hero slide">
          {slides.map((slide, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Toon slide ${index + 1}: ${slide.slogan.join(" ")}`}
              className={index === activeIndex ? "active" : ""}
              key={`${slide.slogan[0]}-${index}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
