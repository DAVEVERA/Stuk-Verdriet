import Image from "next/image";
import { Heart, Share2 } from "lucide-react";
import { FlyoutOverlay } from "@/components/FlyoutOverlay";
import { InterviewGrid } from "@/components/InterviewGrid";
import { SiteDesignStyles } from "@/components/SiteDesignStyles";
import { CommunityCategoryGrid, CommunityFeedback, CommunityStoryForm, EpisodeSignupSection, GoFundMeSupportSection, Hero, HostCard, SocialLinksList } from "@/components/ui";
import { getApprovedCommunityPosts, getCommunityCategories, getInterviewsWithComments, getLatestEpisode, getPublishedEpisodes, getPublishedHosts, getPublishedSeasons, getSiteDesignSettings, getSocialLinks } from "@/lib/content";
import { likeInterview, shareInterview, submitInterviewComment, likeComment } from "@/lib/interview-actions";
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
  const [latest, seasons, episodes, categories, posts, hosts, socialLinks, sectionDesign, authResult, interviewsData] = await Promise.all([
    getLatestEpisode(),
    getPublishedSeasons(),
    getPublishedEpisodes(),
    getCommunityCategories(),
    getApprovedCommunityPosts(),
    getPublishedHosts(),
    getSocialLinks(),
    getSiteDesignSettings(),
    supabase ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } }),
    getInterviewsWithComments()
  ]);
  const isLoggedIn = Boolean(authResult.data.user);
  const themeArticles = getThemeArticles();
  const { interviews, commentsByInterview } = interviewsData;

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

        <section className="interview-section content-band" id="interviews" aria-labelledby="interviews-title">
          <div className="section-heading">
            <h2 id="interviews-title">Interviews</h2>
            <p>Echte verhalen van mensen die hun ervaringen delen rond verlies, rouw en verder leven.</p>
          </div>
          <InterviewGrid
            interviews={interviews}
            comments={commentsByInterview}
            isLoggedIn={isLoggedIn}
            onCommentSubmit={async (interviewId, body, parentId) => {
              "use server";
              await submitInterviewComment(interviewId, body, parentId);
            }}
            onCommentLike={async (commentId) => {
              "use server";
              await likeComment(commentId);
            }}
            onInterviewLike={async (interviewId) => {
              "use server";
              await likeInterview(interviewId);
            }}
            onInterviewShare={async (interviewId) => {
              "use server";
              await shareInterview(interviewId);
            }}
          />
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

      <aside className="social-sidebar" aria-label="Volg Stuk Verdriet" role="complementary">
        <details className="social-sidebar-shell" open>
          <summary className="social-sidebar-toggle">
            <Share2 size={18} aria-hidden />
            <span className="sr-only">Toon of verberg social media links</span>
          </summary>
          <nav className="social-sidebar-nav">
            <a
              href="https://www.instagram.com/stukverdrietdepodcast/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
              aria-label="Volg ons op Instagram"
            >
              <Image src="/img/instagram.png" alt="Instagram" width={32} height={32} />
            </a>
            <a
              href="https://www.facebook.com/stukverdriet"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
              aria-label="Volg ons op Facebook"
            >
              <Image src="/img/facebook.png" alt="Facebook" width={32} height={32} />
            </a>
            <a
              href="https://www.tiktok.com/@stuk.verdriet"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
              aria-label="Volg ons op TikTok"
            >
              <Image src="/img/tik-tok.png" alt="TikTok" width={32} height={32} />
            </a>
          </nav>
        </details>
      </aside>

      <details className="social-mobile-drawer" aria-label="Social media links">
        <summary className="social-mobile-toggle">
          <Share2 size={18} aria-hidden />
          <span className="sr-only">Toon social media links</span>
        </summary>
        <nav className="social-mobile-links" aria-label="Social media links">
          <a href="https://www.instagram.com/stukverdrietdepodcast/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Image src="/img/instagram.png" alt="" width={24} height={24} />
          </a>
          <a href="https://www.facebook.com/stukverdriet" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Image src="/img/facebook.png" alt="" width={24} height={24} />
          </a>
          <a href="https://www.tiktok.com/@stuk.verdriet" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <Image src="/img/tik-tok.png" alt="" width={24} height={24} />
          </a>
        </nav>
      </details>

      <footer className="onepager-footer-social" aria-label="Volg Stuk Verdriet op social media">
        <nav className="footer-social-nav">
          <a href="https://www.instagram.com/stukverdrietdepodcast/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Image src="/img/instagram.png" alt="Instagram" width={28} height={28} />
          </a>
          <a href="https://www.facebook.com/stukverdriet" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Image src="/img/facebook.png" alt="Facebook" width={28} height={28} />
          </a>
          <a href="https://www.tiktok.com/@stuk.verdriet" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <Image src="/img/tik-tok.png" alt="TikTok" width={28} height={28} />
          </a>
        </nav>
      </footer>
    </>
  );
}
