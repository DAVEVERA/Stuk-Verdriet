import Image from "next/image";
import { Heart } from "lucide-react";
import { FlyoutOverlay } from "@/components/FlyoutOverlay";
import { CommunityCategoryGrid, CommunityFeedback, CommunityStoryForm, EpisodeSignupSection, Hero, HostCard, PodcastOnePagerSection, StickySpotifyPlayer } from "@/components/ui";
import { getApprovedCommunityPosts, getCommunityCategories, getLatestEpisode, getPublishedEpisodes, getPublishedHosts, getPublishedSeasons, getSocialLinks } from "@/lib/content";
import { type OnepagerPanel } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase";

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
            <div className="aya-brand-row">
              <a className="aya-logo-link" href="https://ayafonds.nl/" aria-label="Bezoek AYAfonds.nl">
                <Image src="/img/AYAFonds/aya_sage.png" alt="AYA" width={1131} height={417} />
              </a>
              <span>Partner in passende AYA-zorg</span>
            </div>
            <div className="aya-banner-grid">
              <div className="aya-banner-copy">
                <p className="eyebrow">Mede mogelijk gemaakt door</p>
                <h2 id="aya-support-title">Deze podcast wordt mede mogelijk gemaakt door AYAfonds.nl</h2>
                <p>
                  AYAfonds zet zich in voor jongvolwassenen die leven met of na kanker. Met hun steun krijgen verhalen over
                  rouw, zorg en verder leven een plek waar ze gehoord mogen worden.
                </p>
                <div className="aya-banner-actions">
                  <a className="aya-donate-button" href="https://ayafonds.nl/doneer/" target="_self">
                    Doneer nu <Heart size={18} aria-hidden />
                  </a>
                  <a className="aya-secondary-link" href="https://ayafonds.nl/" target="_self">
                    Meer over AYAfonds
                  </a>
                </div>
              </div>
              <div className="aya-statement" aria-hidden>
                <Image
                  src="/img/AYAFonds/text_sage.png"
                  alt=""
                  width={1699}
                  height={926}
                  sizes="(max-width: 900px) 88vw, 560px"
                />
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
