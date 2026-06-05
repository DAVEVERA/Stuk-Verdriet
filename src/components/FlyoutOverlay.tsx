"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { site, type OnepagerPanel } from "@/lib/site";
import type { CommunityCategory, CommunityPost, HostProfile, PodcastEpisode, PodcastSeason, SocialLinks } from "@/types/content";
import { CommunityFeedback, CommunityStoryForm, EpisodeMeta, HostCard, ModernAudioPlayer, PlatformLinks, SocialLinksList } from "@/components/ui";

type FlyoutOverlayProps = {
  initialPanel?: OnepagerPanel | null;
  initialTheme?: string | null;
  latest: PodcastEpisode | null;
  seasons: PodcastSeason[];
  episodes: PodcastEpisode[];
  categories: CommunityCategory[];
  posts: CommunityPost[];
  hosts: HostProfile[];
  socialLinks: SocialLinks;
  isLoggedIn: boolean;
  submitted?: boolean;
  error?: string | null;
};

const panelLabels: Record<OnepagerPanel, string> = {
  podcast: "Podcast",
  themas: "Thema's",
  community: "Community",
  over: "Over ons",
  contact: "Contact",
  privacy: "Privacyverklaring",
  cookies: "Cookieverklaring",
  communityrichtlijnen: "Communityrichtlijnen",
  bijsluiter: "Deel je verhaal",
  archief: "Archief"
};

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

const fallbackThemeImage = "/img/theme-rouw.jpg";
const podcastIntro = "Een stuk verdriet. Een leven vol herinneringen. Iedereen rouwt anders. Verdriet verdient een stem.";

export function FlyoutOverlay({
  initialPanel,
  initialTheme,
  latest,
  seasons,
  episodes,
  categories,
  posts,
  hosts,
  socialLinks,
  isLoggedIn,
  submitted,
  error
}: FlyoutOverlayProps) {
  const [panel, setPanel] = useState<OnepagerPanel | null>(initialPanel ?? null);
  const [activeTheme, setActiveTheme] = useState<string | null>(initialTheme ?? null);
  const featured = latest ?? episodes[0] ?? null;
  const selectedTheme = useMemo(
    () => categories.find((category) => category.slug === activeTheme) ?? null,
    [activeTheme, categories]
  );

  useEffect(() => {
    document.body.style.overflow = panel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [panel]);

  if (!panel) return null;
  const isPopout = panel === "podcast" || panel === "themas" || panel === "bijsluiter";

  return (
    <div className={`flyout-layer${isPopout ? " popout-layer" : ""}`} role="dialog" aria-modal="true" aria-labelledby="flyout-title">
      <Link className="flyout-backdrop" href="/" aria-label="Sluit venster" />
      <aside className={`flyout-panel${isPopout ? " popout-panel" : ""}`}>
        <div className="flyout-topbar">
          <p className="eyebrow">{panelLabels[panel]}</p>
          <Link className="flyout-close" href="/" aria-label="Sluit venster">
            <X size={20} aria-hidden />
          </Link>
        </div>
        {renderPanel()}
      </aside>
    </div>
  );

  function renderPanel() {
    if (panel === "podcast") {
      return (
        <div className="flyout-content">
          <h2 id="flyout-title">De podcast</h2>
          <p className="lead-text">{podcastIntro}</p>
          {featured ? (
            <article className="flyout-feature podcast-flyout-feature">
              <div>
                <p className="eyebrow">Nieuwste aflevering</p>
                <h3>{featured.title}</h3>
                <EpisodeMeta episode={featured} />
                {featured.short_intro ? <p>{featured.short_intro}</p> : null}
                <ModernAudioPlayer episode={featured} showPlaceholderNote={false} />
                <PlatformLinks episode={featured} />
              </div>
            </article>
          ) : (
            <p className="notice">De podcastomgeving is klaar. Afleveringen verschijnen zodra ze in de admin zijn gepubliceerd.</p>
          )}
          <div className="flyout-list">
            {seasons.map((season) => {
              const seasonEpisodes = episodes.filter((episode) => episode.season_number === season.season_number);
              if (!seasonEpisodes.length) return null;
              return (
                <section key={season.id}>
                  <h3>{season.title}</h3>
                  <div className="episode-stack">
                    {seasonEpisodes.map((episode) => (
                      <article className="queue-item active" key={episode.id}>
                        <div className="queue-play">
                          <span>{episode.episode_number}</span>
                        </div>
                        <div>
                          <h4>{episode.title}</h4>
                          <EpisodeMeta episode={episode} />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      );
    }

    if (panel === "themas" || panel === "archief") {
      return (
        <div className="flyout-content">
          <h2 id="flyout-title">Thema&apos;s</h2>
          <p className="lead-text">Kies een thema dat past bij jouw vraag, moment of herinnering. Elk onderwerp opent rustig bovenop de onepager.</p>
          {selectedTheme ? (
            <article className="theme-detail">
              <Image src={themeImages[selectedTheme.slug] ?? fallbackThemeImage} alt="" width={720} height={420} />
              <div>
                <p className="eyebrow">Thema</p>
                <h3>{selectedTheme.title}</h3>
                <p>{selectedTheme.description}</p>
                <button type="button" className="text-button" onClick={() => setActiveTheme(null)}>
                  Terug naar alle thema&apos;s
                </button>
              </div>
            </article>
          ) : (
            <div className="theme-flyout-grid">
              {categories.map((category) => (
                <button type="button" className="theme-card" key={category.id} onClick={() => setActiveTheme(category.slug)}>
                  <Image src={themeImages[category.slug] ?? fallbackThemeImage} alt="" width={520} height={340} />
                  <span>{category.title}</span>
                  <small>{category.description}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (panel === "community" || panel === "bijsluiter") {
      return (
        <div className="flyout-content">
          <h2 id="flyout-title">{panel === "bijsluiter" ? "Deel je verhaal" : "Community en verhalen"}</h2>
          <CommunityFeedback submitted={submitted} error={error} />
          <div className="community-flyout-grid story-only-grid">
            <CommunityStoryForm categories={categories} isLoggedIn={isLoggedIn} returnTo={panel === "bijsluiter" ? "/bijsluiter" : "/community"} />
          </div>
        </div>
      );
    }

    if (panel === "over") {
      return (
        <div className="flyout-content">
          <h2 id="flyout-title">Over Susan</h2>
          <div className="host-grid">
            {hosts.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        </div>
      );
    }

    if (panel === "contact") {
      return (
        <div className="flyout-content">
          <h2 id="flyout-title">Contact</h2>
          <a className="button" href={`mailto:${site.email}`}>{site.email}</a>
          <SocialLinksList links={socialLinks} />
        </div>
      );
    }

    if (panel === "privacy") {
      return (
        <div className="flyout-content">
          <h2 id="flyout-title">Privacyverklaring</h2>
          <p className="lead-text">De definitieve privacyverklaring wordt aangeleverd. Tot die tijd verzamelt de publieke site alleen gegevens die nodig zijn voor contact, login en communitymoderatie.</p>
        </div>
      );
    }

    if (panel === "cookies") {
      return (
        <div className="flyout-content">
          <h2 id="flyout-title">Cookieverklaring</h2>
          <p className="lead-text">Deze verklaring wordt definitief ingevuld zodra alle gebruikte cookies en diensten vaststaan.</p>
        </div>
      );
    }

    return (
      <div className="flyout-content">
        <h2 id="flyout-title">Communityrichtlijnen</h2>
        <ul className="guideline-list">
          <li>Reageer respectvol.</li>
          <li>Stel geen medische diagnoses.</li>
          <li>Geen persoonlijke aanvallen.</li>
          <li>Geen haatdragende of kwetsende taal.</li>
          <li>Geen commerciele spam.</li>
          <li>Deel geen privacygevoelige gegevens van anderen.</li>
          <li>Zoek bij acute nood professionele hulp.</li>
        </ul>
      </div>
    );
  }
}
