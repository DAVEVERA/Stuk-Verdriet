import Image from "next/image";
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
