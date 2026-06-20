import Link from "next/link";
import { MessageCircle, Shield, Sparkles, Users } from "lucide-react";
import { signOut } from "@/lib/actions";
import { getApprovedCommunityPosts, getCommunityCategories } from "@/lib/content";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import { CommunityFeedback, CommunityPostCard, CommunityStoryForm, Icon } from "@/components/ui";

type CommunityPageProps = {
  searchParams?: Promise<{ submitted?: string; error?: string; missing?: string }>;
};

export const dynamic = "force-dynamic";

const platformPillars = [
  {
    icon: MessageCircle,
    title: "Deel je verhaal",
    text: "Schrijf wat je bezighoudt. Groot, klein, rauw of praktisch: je hoeft het niet mooier te maken."
  },
  {
    icon: Users,
    title: "Vind herkenning",
    text: "Lees verhalen van anderen en reageer wanneer je iets herkent of steun wilt geven."
  },
  {
    icon: Sparkles,
    title: "Tips en handvatten",
    text: "Bewaar en deel dingen die helpen: woorden, rituelen, boeken, organisaties of praktische stappen."
  },
  {
    icon: Shield,
    title: "Veilig gemodereerd",
    text: "Nieuwe bijdragen worden eerst gelezen. Zo blijft de community zorgvuldig en menselijk."
  }
];

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = await searchParams;
  const [categories, posts, supabase] = await Promise.all([
    getCommunityCategories(),
    getApprovedCommunityPosts(),
    createSupabaseServerClient()
  ]);
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const isLoggedIn = Boolean(user);
  const featuredPosts = posts.slice(0, 9);
  const linkPosts = posts.filter((post) => post.post_type === "link" || post.resource_url).slice(0, 4);

  return (
    <main className="community-platform-page">
      <section className="community-platform-hero">
        <div>
          <p className="eyebrow">Community</p>
          <h1>Een plek voor verhalen, steun en houvast.</h1>
          <p>
            Deel wat je meedraagt, lees mee met anderen en verzamel tips die kunnen helpen bij rouw, ziekte,
            afscheid en verder leven.
          </p>
          <div className="community-platform-actions">
            <a className="button" href="#deel-je-verhaal">Deel je verhaal</a>
            <a className="text-link" href="#verhalen">Lees verhalen</a>
          </div>
        </div>
        <aside className="community-login-card" aria-label="Community account">
          {isLoggedIn ? (
            <>
              <p className="eyebrow">Ingelogd</p>
              <h2>{user?.email}</h2>
              <p>Je kunt posten, reageren en steun geven. Nieuwe bijdragen gaan eerst langs moderatie.</p>
              <form action={signOut}>
                <input type="hidden" name="next" value="/community" readOnly />
                <button className="text-link" type="submit">Uitloggen</button>
              </form>
            </>
          ) : (
            <>
              <p className="eyebrow">Meedoen</p>
              <h2>Log in om te delen</h2>
              <p>Lezen kan zonder account. Voor posten, reageren en steunen log je in met Google of e-mail.</p>
              <Link className="button" href="/login?next=%2Fcommunity">Inloggen</Link>
              {!hasSupabaseEnv ? <p className="small-note">Supabase env vars ontbreken nog.</p> : null}
            </>
          )}
        </aside>
      </section>

      <section className="community-pillar-grid" aria-label="Wat kan in de community">
        {platformPillars.map((item) => {
          const PillarIcon = item.icon;
          return (
            <article key={item.title}>
              <PillarIcon size={24} aria-hidden />
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          );
        })}
      </section>

      <section className="community-platform-layout" id="deel-je-verhaal" aria-label="Verhaal delen en communityfeed">
        <aside className="community-compose-panel">
          <div className="community-compose-heading">
            <p className="eyebrow">Schrijf mee</p>
            <h2>Wat wil je kwijt?</h2>
            <p>Je bijdrage wordt eerst gemodereerd. Kies zelf of je zichtbaar bent met je voornaam, volledige naam of anoniem.</p>
          </div>
          <CommunityFeedback submitted={params?.submitted === "pending"} error={params?.error ?? params?.missing ?? null} />
          <CommunityStoryForm categories={categories} isLoggedIn={isLoggedIn} returnTo="/community" />
        </aside>

        <div className="community-feed" id="verhalen">
          <div className="community-feed-heading">
            <div>
              <p className="eyebrow">Verhalen en vragen</p>
              <h2>Wat anderen delen</h2>
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

      <section className="community-link-section" aria-labelledby="community-links-title">
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
            {categories.slice(0, 6).map((category) => (
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
