import { getApprovedCommunityPosts, getCommunityCategories } from "@/lib/content";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import { CommunityAccountDock, CommunityPostCard, Icon } from "@/components/ui";
import Image from "next/image";
import type { CommunityConversation, CommunityProfile } from "@/types/content";

type CommunityPageProps = {
  searchParams?: Promise<{ submitted?: string; error?: string; missing?: string; conversation?: string }>;
};

export const dynamic = "force-dynamic";

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = (await searchParams) ?? {};
  const [categories, posts, supabase] = await Promise.all([
    getCommunityCategories(),
    getApprovedCommunityPosts(),
    createSupabaseServerClient()
  ]);
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const isLoggedIn = Boolean(user);
  let currentProfile: CommunityProfile | null = null;
  let discoverableProfiles: CommunityProfile[] = [];
  let conversations: CommunityConversation[] = [];
  if (supabase && user) {
    const [profileResult, profilesResult, conversationsResult] = await Promise.all([
      supabase.from("community_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("community_profiles").select("*").eq("is_discoverable", true).neq("user_id", user.id).limit(12),
      supabase
        .from("community_conversations")
        .select("id,created_by,created_at,updated_at,community_conversation_participants(conversation_id,user_id,last_read_at,created_at,community_profiles(user_id,display_name,avatar_url,is_discoverable)),community_messages(id,conversation_id,sender_id,body,created_at)")
        .order("updated_at", { ascending: false })
        .order("created_at", { referencedTable: "community_messages", ascending: true })
        .limit(6, { referencedTable: "community_messages" })
        .limit(8)
    ]);
    currentProfile = (profileResult.data as CommunityProfile | null) ?? null;
    discoverableProfiles = (profilesResult.data as CommunityProfile[] | null) ?? [];
    conversations = (conversationsResult.data as CommunityConversation[] | null) ?? [];
  }
  const featuredPosts = posts.slice(0, 9);
  const linkPosts = posts.filter((post) => post.post_type === "link" || post.resource_url).slice(0, 4);
  const visibleCategories = categories.slice(0, 6);

  return (
    <main className="community-platform-page">
      <section className="community-platform-hero">
        <div className="community-hero-brand-stage" aria-label="SNAAR">
          <div className="community-hero-logo-mark">
            <Image src="/img/icons_SNAAR/snaar_cirkel.png" alt="SNAAR" width={132} height={132} priority />
          </div>
          <div className="community-hero-banner">
            <Image
              src="/img/icons_SNAAR/Snaar_hero.png"
              alt=""
              fill
              priority
              sizes="(max-width: 820px) calc(100vw - 20px), 1040px"
            />
          </div>
        </div>
        <div className="community-hero-copy">
          <h1>Hoe gevoelig de snaar ook is, hier raken we hem samen. Je hoeft het niet alleen te doen. We zijn er voor je. Laat van je horen.</h1>
        </div>
        <CommunityAccountDock
          isLoggedIn={isLoggedIn}
          email={user?.email ?? null}
          currentUserId={user?.id ?? null}
          currentProfile={currentProfile}
          discoverableProfiles={discoverableProfiles}
          conversations={conversations}
          posts={posts}
          hasSupabaseEnv={hasSupabaseEnv}
          selectedConversationId={params.conversation ?? null}
          chatError={params.error ?? null}
        />
      </section>

      <section className="community-social-layout" aria-label="Community feed">
        <section className="community-feed-column" id="verhalen" aria-labelledby="community-feed-title">
          <div className="community-feed">
            <div className="community-feed-heading">
              <div>
                <p className="eyebrow">Nieuw in de community</p>
                <h2 id="community-feed-title">Jouw Feed</h2>
              </div>
              <span>{posts.length} bijdragen</span>
            </div>
            {featuredPosts.length ? (
              <div className="post-grid community-post-list">
                {featuredPosts.map((post) => (
                  <CommunityPostCard key={post.id} post={post} showActions={isLoggedIn} />
                ))}
              </div>
            ) : (
              <div className="community-empty-state">
                <h3>De community wordt gevuld.</h3>
                <p>De eerste goedgekeurde verhalen, vragen en tips verschijnen hier. Je kunt alvast een bijdrage insturen.</p>
              </div>
            )}
          </div>
        </section>
      </section>

      <section className="community-link-section" id="community-links" aria-labelledby="community-links-title">
        <div className="community-feed-heading">
          <div>
            <p className="eyebrow">Handvatten</p>
            <h2 id="community-links-title">Handige routes en gedeelde links</h2>
          </div>
        </div>
        {linkPosts.length ? (
          <div className="post-grid compact community-link-grid">
            {linkPosts.map((post) => (
              <CommunityPostCard key={post.id} post={post} showActions={isLoggedIn} />
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
