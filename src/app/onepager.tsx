import Image from "next/image";
import { Heart } from "lucide-react";
import { FlyoutOverlay } from "@/components/FlyoutOverlay";
import { CommunityCategoryGrid, CommunityFeedback, CommunityStoryForm, EpisodeSignupSection, Hero, HostCard, PodcastOnePagerSection, StickySpotifyPlayer, TychoSupportSection } from "@/components/ui";
import { getApprovedCommunityPosts, getCommunityCategories, getLatestEpisode, getPublishedEpisodes, getPublishedHosts, getPublishedSeasons, getSocialLinks } from "@/lib/content";
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
  const [latest, seasons, episodes, categories, posts, hosts, socialLinks, authResult] = await Promise.all([
    getLatestEpisode(),
    getPublishedSeasons(),
    getPublishedEpisodes(),
    getCommunityCategories(),
    getApprovedCommunityPosts(),
    getPublishedHosts(),
    getSocialLinks(),
    supabase ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } })
  ]);
  const isLoggedIn = Boolean(authResult.data.user);
  const themeArticles = getThemeArticles();

  return (
    <>
      <Hero />
      <div className="story-gradient-flow">
        <EpisodeSignupSection status={signupStatus} />
        <PodcastOnePagerSection latest={latest} seasons={seasons} episodes={episodes} />
        <StickySpotifyPlayer episode={latest ?? episodes[0] ?? null} />

        <section className="content-band image-band" id="themas">
          <div className="section-heading">
            <h2>Praktisch, eerlijk en nuttig.</h2>
          </div>
          <CommunityCategoryGrid categories={categories} />
        </section>

        <TychoSupportSection />

        <section className="community-story-section" id="community">
          <div className="community-visual">
            <Image src="/img/PHOTO-2026-06-03-23-01-08(3).jpg" alt="Verrekijker als beeld voor zoeken naar herkenning en richting" fill sizes="(max-width: 900px) 100vw, 42vw" />
          </div>
          <div className="community-panel">
            <CommunityFeedback submitted={submitted} error={error} />
            <div className="community-story-grid">
              <CommunityStoryForm categories={categories} isLoggedIn={isLoggedIn} returnTo="/community" />
            </div>
          </div>
        </section>

        <section className="aya-support-banner" aria-labelledby="aya-support-title">
          <div className="aya-banner-inner">
            <div className="aya-banner-grid">
              <div className="aya-banner-copy">
                <a className="aya-logo-link" href="https://ayafonds.nl/" aria-label="Bezoek AYAfonds.nl">
                  <Image src="/img/AYAFonds/Embleem_logo_.webp" alt="AYA Fonds" width={300} height={204} />
                </a>
                <p className="eyebrow">Partner in passende AYA-zorg</p>
                <h2 id="aya-support-title">Deze podcast wordt mede mogelijk gemaakt door AYAfonds.nl</h2>
                <p>
                  AYAfonds zet zich in voor jongvolwassenen die leven met of na kanker. Met hun steun krijgen verhalen over
                  rouw, zorg en verder leven een plek waar ze gehoord mogen worden.
                </p>
                <blockquote>De juiste zorg om krachtig in het leven te blijven staan.</blockquote>
                <div className="aya-banner-actions" aria-label="AYAfonds acties">
                  <a className="aya-donate-button" href="https://ayafonds.nl/doneer/" target="_self">
                    Doneer nu <Heart size={18} aria-hidden />
                  </a>
                  <a className="aya-secondary-link" href="https://ayafonds.nl/" target="_self">
                    Meer over AYAfonds
                  </a>
                </div>
              </div>
              <div className="aya-donation-panel">
                <div className="aya-qr-card">
                  <Image src="/img/AYAFonds/donate-qr.png" alt="QR-code naar ayafonds.nl/doneer" width={512} height={512} />
                  <div>
                    <p className="eyebrow">Scan en steun</p>
                    <h3>Doneer direct aan AYAfonds</h3>
                    <p>Elke bijdrage helpt om zorg, herkenning en ondersteuning voor AYA&apos;s dichterbij te brengen.</p>
                  </div>
                </div>
                <div className="aya-impact-note">
                  <span aria-hidden>AYA</span>
                  <p>Voor jongvolwassenen met kanker, en voor iedereen die naast hen staat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {hosts.length ? (
        <section className="content-band" id="over">
          <div className="section-heading">
            <h2>Over de podcast makers</h2>
          </div>
          <div className="host-grid">
            {hosts.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        </section>
      ) : null}

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
