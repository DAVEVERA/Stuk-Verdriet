import { getApprovedCommunityPosts, getCommunityCategories } from '@/lib/content';
import type { Metadata } from 'next';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase';
import { CommunityPulseStrip } from '@/components/CommunityPulseStrip';
import { CommunityPostCard, Icon } from '@/components/ui';
import type { CommunityFriendship, CommunityProfile, CommunityPulseMoment } from '@/types/content';

type CommunityPageProps = {
  searchParams?: Promise<{
    submitted?: string;
    error?: string;
    missing?: string;
    conversation?: string;
    comments?: string;
    reply?: string;
    account?: string;
  }>;
};

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Lees verhalen, deel ervaringen en vind verbinding binnen de community van Stuk Verdriet.',
  alternates: {
    canonical: '/community',
  },
};

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const categories = await getCommunityCategories();
  const isLoggedIn = Boolean(user);
  const posts = await getApprovedCommunityPosts(user?.id ?? null);
  let currentProfile: CommunityProfile | null = null;
  let pulseMoments: CommunityPulseMoment[] = [];
  if (supabase && user) {
    const admin = createSupabaseAdminClient();
    const profileResult = await supabase
      .from('community_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    currentProfile = (profileResult.data as CommunityProfile | null) ?? null;
    const dataClient = admin ?? supabase;
    if (dataClient) {
      const [friendshipsResult, pulseResult] = await Promise.all([
        dataClient
          .from('community_friendships')
          .select('*')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted'),
        dataClient
          .from('community_pulse_moments')
          .select(
            '*,community_profiles:community_profiles!community_pulse_moments_user_id_fkey(user_id,display_name,avatar_url,is_discoverable)'
          )
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(30),
      ]);
      const friendships = (friendshipsResult.data as CommunityFriendship[] | null) ?? [];
      const connectedIds = new Set(
        friendships.map((item) =>
          item.requester_id === user.id ? item.addressee_id : item.requester_id
        )
      );
      pulseMoments = ((pulseResult.data as CommunityPulseMoment[] | null) ?? [])
        .filter((moment) => {
          const profile = Array.isArray(moment.community_profiles)
            ? moment.community_profiles[0]
            : moment.community_profiles;
          if (moment.user_id === user.id) return true;
          if (moment.visibility === 'community') return Boolean(profile?.is_discoverable);
          if (moment.visibility === 'connections') return connectedIds.has(moment.user_id);
          return false;
        })
        .slice(0, 12);
    }
  } else {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const pulseResult = await admin
        .from('community_pulse_moments')
        .select(
          '*,community_profiles:community_profiles!community_pulse_moments_user_id_fkey(user_id,display_name,avatar_url,is_discoverable)'
        )
        .eq('status', 'published')
        .eq('visibility', 'community')
        .order('created_at', { ascending: false })
        .limit(12);
      pulseMoments = ((pulseResult.data as CommunityPulseMoment[] | null) ?? []).filter(
        (moment) => {
          const profile = Array.isArray(moment.community_profiles)
            ? moment.community_profiles[0]
            : moment.community_profiles;
          return Boolean(profile?.is_discoverable);
        }
      );
    }
  }
  const featuredPosts = posts.slice(0, 9);
  const linkPosts = posts
    .filter((post) => post.post_type === 'link' || post.resource_url)
    .slice(0, 4);
  const visibleCategories = categories.slice(0, 6);

  return (
    <main className="community-platform-page">
      <section className="community-platform-hero">
        <div className="community-hero-brand-stage" aria-label="SNAAR">
          <div className="community-hero-banner">
            <h1 className="community-hero-text">
              <span>Hoe gevoelig de snaar ook is,</span>
              <span>hier raken we hem samen.</span>
              <span>Je hoeft het niet alleen te doen.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="community-social-layout" aria-label="Community feed">
        <section
          className="community-feed-column"
          id="verhalen"
          aria-labelledby="community-feed-title"
        >
          <div className="community-feed">
            <div className="community-feed-heading">
              <div>
                <p className="eyebrow">Nieuw in de community</p>
                <h2 id="community-feed-title">Jouw Feed</h2>
              </div>
              <span>{posts.length} bijdragen</span>
            </div>
            {params.reply === 'submitted' ? (
              <p className="notice community-feed-notice" role="status">
                Je reactie is ontvangen en wordt op de richtlijnen gecontroleerd. Je ziet de actuele
                status bij Mijn profiel onder Bijdragen.
              </p>
            ) : null}
            {params.account === 'deleted' ? (
              <p className="notice community-feed-notice" role="status">
                Je account is verwijderd. Je bent uitgelogd en kunt je op elk moment opnieuw
                aanmelden.
              </p>
            ) : null}
            {params.error === 'reply' || params.error === 'reply-create' ? (
              <p className="notice community-feed-notice" role="alert">
                Je reactie kon niet worden opgeslagen. Controleer de tekst en probeer het opnieuw.
              </p>
            ) : null}
            <CommunityPulseStrip
              moments={pulseMoments}
              isLoggedIn={isLoggedIn}
              returnTo="/community"
            />
            {featuredPosts.length ? (
              <div className="post-grid community-post-list">
                {featuredPosts.map((post) => (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    showActions={isLoggedIn}
                    currentProfile={currentProfile}
                    defaultCommentsOpen={params.comments === post.id}
                  />
                ))}
              </div>
            ) : (
              <div className="community-empty-state">
                <h3>De community wordt gevuld.</h3>
                <p>
                  De eerste goedgekeurde verhalen, vragen en tips verschijnen hier. Je kunt alvast
                  een bijdrage insturen.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>

      <section
        className="community-link-section"
        id="community-links"
        aria-labelledby="community-links-title"
      >
        <div className="community-feed-heading">
          <div>
            <p className="eyebrow">Handvatten</p>
            <h2 id="community-links-title">Handige routes en gedeelde links</h2>
          </div>
        </div>
        {linkPosts.length ? (
          <div className="community-prefooter-link-grid">
            {linkPosts.map((post) => (
              <a
                className="community-prefooter-link"
                key={post.id}
                href={post.resource_url ?? `/community/${post.slug}`}
                target={post.resource_url ? '_blank' : undefined}
                rel={post.resource_url ? 'noopener noreferrer' : undefined}
              >
                <span>{post.category}</span>
                <strong>{post.resource_label ?? post.title}</strong>
                <small>{post.body}</small>
              </a>
            ))}
          </div>
        ) : (
          <div className="community-category-strip">
            {visibleCategories.map((category) => (
              <article key={category.slug}>
                <Icon name={category.icon} />
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
