import Image from "next/image";
import { Heart } from "lucide-react";
import { FlyoutOverlay } from "@/components/FlyoutOverlay";
import { SiteDesignStyles } from "@/components/SiteDesignStyles";
import { CommunityCategoryGrid, CommunityFeedback, CommunityStoryForm, EpisodeSignupSection, GoFundMeSupportSection, Hero, HostCard, SocialLinksList } from "@/components/ui";
import { getApprovedCommunityPosts, getCommunityCategories, getLatestEpisode, getPublishedEpisodes, getPublishedHosts, getPublishedSeasons, getSiteDesignSettings, getSocialLinks } from "@/lib/content";
import { type OnepagerPanel } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getThemeArticles } from "@/lib/theme-articles";

type OnepagerProps = {
  initialPanel?: OnepagerPanel | null;
  initialTheme?: string | null;
  submitted?: boolean;
  error?: string | null;
  signupStatus?: string | null;
};

export async function Onepager({ initialPanel = null, initialTheme = null, submitted = false, error = null, signupStatus = null }: OnepagerProps) {
  const supabase = await createSupabaseServerClient();
  const [latest, seasons, episodes, categories, posts, hosts, socialLinks, sectionDesign, authResult] = await Promise.all([
    getLatestEpisode(),
    getPublishedSeasons(),
    getPublishedEpisodes(),
    getCommunityCategories(),
    getApprovedCommunityPosts(),
    getPublishedHosts(),
    getSocialLinks(),
    getSiteDesignSettings(),
    supabase ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } })
  ]);
  const isLoggedIn = Boolean(authResult.data.user);
  const themeArticles = getThemeArticles();

  return (
    <>
      <SiteDesignStyles settings={sectionDesign} />
      <Hero latest={latest} episodes={episodes} />
      <div className="story-gradient-flow">
        <GoFundMeSupportSection />

        {hosts.length ? (
          <section className="content-band hosts-section" id="over">
            <div className="section-heading">
              <h2>Over de podcastmakers</h2>
            </div>
            <div className="host-grid">
              {hosts.map((host) => (
                <HostCard key={host.id} host={host} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="aya-support-banner" aria-labelledby="aya-support-title">
          <div className="aya-banner-inner">
            <div className="aya-banner-copy">
              <a className="aya-logo-link" href="https://ayafonds.nl/" aria-label="Bezoek AYAfonds.nl">
                <Image src="/img/AYAFonds/Embleem_logo_paars.svg" alt="AYA Fonds" width={148} height={125} />
              </a>
              <h2 id="aya-support-title">Deze podcast is mogelijk gemaakt door het AYA Fonds.</h2>
              <p>
                Het AYA Fonds zet zich in voor betere mentale, sociale en fysieke zorg voor jongvolwassenen
                met kanker (AYA&apos;s) en hun naasten. Met hun steun krijgen verhalen over rouw, zorg en
                verder leven een plek waar ze gehoord mogen worden.
              </p>
              <p className="aya-cta-line">Geef voor jongvolwassenen met kanker.</p>
              <div className="aya-banner-actions" aria-label="AYA Fonds acties">
                <a className="aya-donate-button" href="https://ayafonds.nl/" target="_self">
                  Meer over AYA Fonds
                </a>
                <a className="aya-donate-button aya-donate-primary" href="https://ayafonds.nl/doneer/" target="_self">
                  Doneer direct aan AYA Fonds <Heart size={18} aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="community-story-section" id="community" aria-labelledby="community-entry-title">
          <div className="community-visual">
            <Image src="/img/wegwijzer.png" alt="Wegwijzer met Stuk Verdriet op de pijl voor een berglandschap" fill sizes="(max-width: 900px) 100vw, 42vw" />
          </div>
          <div className="community-panel">
            <div className="community-panel-heading">
              <h2 id="community-entry-title">Ingang community</h2>
              <p>Deel je verhaal, stel een vraag of lees mee met anderen die rouw en gemis herkennen.</p>
            </div>
            <CommunityFeedback submitted={submitted} error={error} />
            <div className="community-story-grid">
              <CommunityStoryForm categories={categories} isLoggedIn={isLoggedIn} returnTo="/community" />
            </div>
          </div>
        </section>

        <section className="content-band image-band" id="themas">
          <div className="section-heading">
            <h2>Waar heb je nu behoefte aan?</h2>
          </div>
          <CommunityCategoryGrid categories={categories} />
        </section>

        <EpisodeSignupSection status={signupStatus} />
      </div>

      <FlyoutOverlay
        initialPanel={initialPanel}
        initialTheme={initialTheme}
        latest={latest}
        seasons={seasons}
        episodes={episodes}
        categories={categories}
        themeArticles={themeArticles}
        posts={posts}
        hosts={hosts}
        socialLinks={socialLinks}
        isLoggedIn={isLoggedIn}
        submitted={submitted}
        error={error}
      />

      <aside className="social-sidebar" aria-label="Volg Stuk Verdriet">
        <nav className="social-sidebar-nav">
          <a
            href="https://www.instagram.com/stukverdrietdepodcast/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-sidebar-link"
            aria-label="Instagram"
            title="Instagram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 11.002 2.881 1.44 1.44 0 01-.002-2.881z"/>
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@stuk.verdriet"
            target="_blank"
            rel="noopener noreferrer"
            className="social-sidebar-link"
            aria-label="TikTok"
            title="TikTok"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.66 .3 2.89 2.89 0 015.66-.3V9.54a4.84 4.84 0 003.77 4.25v-3.1a9.86 9.86 0 01-1.1-.53v3.1z"/>
            </svg>
          </a>
        </nav>
      </aside>
    </>
  );
}
