import Image from "next/image";
import { Heart } from "lucide-react";
import { FlyoutOverlay } from "@/components/FlyoutOverlay";
import { SiteDesignStyles } from "@/components/SiteDesignStyles";
import { CommunityCategoryGrid, CommunityFeedback, CommunityStoryForm, EpisodeSignupSection, GoFundMeSupportSection, Hero, HostCard } from "@/components/ui";
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
    </>
  );
}
