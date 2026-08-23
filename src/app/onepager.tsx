import Image, { getImageProps } from "next/image";
import { Heart } from "lucide-react";
import { FlyoutOverlay } from "@/components/FlyoutOverlay";
import { InterviewGrid } from "@/components/InterviewGrid";
import { SiteDesignStyles } from "@/components/SiteDesignStyles";
import Link from "next/link";
import { CommunityCategoryGrid, CommunityFeedback, CommunityPostCard, EpisodeSignupSection, GoFundMeSupportSection, Hero, HostCard, SocialLinksList } from "@/components/ui";
import { getApprovedCommunityPosts, getCommunityCategories, getInterviewsWithComments, getLatestEpisode, getPublishedEpisodes, getPublishedHosts, getPublishedSeasons, getSiteDesignSettings, getSiteSettings, getSocialLinks } from "@/lib/content";
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

function CommunityPreviewBannerImage() {
  const shared = {
    alt: "",
    sizes: "(min-width: 900px) calc(100vw - 112px), calc(100vw - 36px)"
  };
  const {
    props: desktopImageProps
  } = getImageProps({
    ...shared,
    src: "/hero/snaar-community-hero-desktop.png",
    width: 1729,
    height: 910
  });
  const {
    props: mobileImageProps
  } = getImageProps({
    ...shared,
    src: "/hero/snaar-community-hero-mobile.png",
    width: 892,
    height: 1764
  });

  return (
    <picture className="community-preview-banner-picture">
      <source media="(min-width: 900px)" srcSet={desktopImageProps.srcSet} sizes={desktopImageProps.sizes} />
      {/* getImageProps levert hier de geoptimaliseerde fallback voor de art-directed banner. */}
      <img {...mobileImageProps} className="community-preview-banner-image" alt="" aria-hidden="true" />
    </picture>
  );
}

export async function Onepager({ initialPanel = null, initialTheme = null, submitted = false, error = null, signupStatus = null }: OnepagerProps) {
  const supabase = await createSupabaseServerClient();
  const [latest, seasons, episodes, categories, posts, hosts, socialLinks, sectionDesign, siteSettings, authResult, interviewsData] = await Promise.all([
    getLatestEpisode(),
    getPublishedSeasons(),
    getPublishedEpisodes(),
    getCommunityCategories(),
    getApprovedCommunityPosts(),
    getPublishedHosts(),
    getSocialLinks(),
    getSiteDesignSettings(),
    getSiteSettings(),
    supabase ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } }),
    getInterviewsWithComments()
  ]);
  const isLoggedIn = Boolean(authResult.data.user);
  const themeArticles = getThemeArticles();
  const { interviews, commentsByInterview } = interviewsData;
  const copy = siteSettings.content;

  return (
    <>
      <SiteDesignStyles settings={sectionDesign} />
      <h1 className="sr-only">Stuk Verdriet - podcast en community over rouw, verlies en verder leven</h1>
      <Hero latest={latest} episodes={episodes} slides={copy.heroSlides} />
      <div className="story-gradient-flow">
        <GoFundMeSupportSection />

        {hosts.length ? (
          <section className="content-band hosts-section" id="over">
            <div className="section-heading">
              <h2>{copy.hostsTitle}</h2>
            </div>
            <div className="host-grid">
              {hosts.map((host) => (
                <HostCard key={host.id} host={host} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="content-band community-preview-section" id="community-preview" aria-labelledby="community-preview-title">
          <div className="community-preview-banner">
            <CommunityPreviewBannerImage />
            <div className="community-preview-banner-copy">
              <div className="community-preview-brand-row">
                <Image
                  className="community-preview-logo"
                  src="/img/icons_SNAAR/snaar_cirkel.png"
                  alt="SNAAR community"
                  width={289}
                  height={286}
                  sizes="(min-width: 900px) 106px, 78px"
                />
                <div>
                  <p className="community-preview-live"><span aria-hidden="true" /> {copy.communityKicker}</p>
                </div>
              </div>
              <h2 id="community-preview-title">{copy.communityTitle}</h2>
              <p>{copy.communityBody}</p>
              <Link className="button community-preview-cta" href="/community">
                {copy.communityCtaLabel}
              </Link>
            </div>
          </div>
          {posts.length ? (
            <div className="community-preview-feed">
              <div className="community-preview-feed-heading">
                <p>Lees mee met de nieuwste verhalen en reacties uit SNAAR.</p>
              </div>
              <div className="post-grid compact community-preview-grid">
                {posts.slice(0, 3).map((post) => (
                  <CommunityPostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="aya-support-banner" aria-labelledby="aya-support-title">
          <div className="aya-banner-inner">
            <div className="aya-banner-copy">
              <a className="aya-logo-link" href="https://ayafonds.nl/" aria-label="Bezoek AYAfonds.nl">
                <Image src="/img/AYAFonds/Embleem_logo_paars.svg" alt="AYA Fonds" width={148} height={125} />
              </a>
              <h2 id="aya-support-title">{copy.ayaTitle}</h2>
              <p>{copy.ayaBody}</p>
              <p className="aya-cta-line">{copy.ayaCtaLine}</p>
              <div className="aya-banner-actions" aria-label="AYA Fonds acties">
                <a className="aya-donate-button" href="https://ayafonds.nl/" target="_self">
                  {copy.ayaSecondaryLabel}
                </a>
                <a className="aya-donate-button aya-donate-primary" href="https://ayafonds.nl/doneer/" target="_self">
                  {copy.ayaPrimaryLabel} <Heart size={18} aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="interview-section content-band" id="interviews" aria-labelledby="interviews-title">
          <div className="section-heading">
            <h2 id="interviews-title">{copy.interviewsTitle}</h2>
            <p>{copy.interviewsIntro}</p>
          </div>
          <InterviewGrid
            interviews={interviews}
            comments={commentsByInterview}
            isLoggedIn={isLoggedIn}
            onCommentSubmit={async (interviewId, body, parentId, authorName, authorEmail) => {
              "use server";
              await submitInterviewComment(interviewId, body, parentId, authorName, authorEmail);
            }}
            onCommentLike={async (commentId) => {
              "use server";
              await likeComment(commentId);
            }}
            onInterviewLike={async (interviewId, shouldLike) => {
              "use server";
              await likeInterview(interviewId, shouldLike);
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
        signupStatus={signupStatus}
      />
    </>
  );
}
