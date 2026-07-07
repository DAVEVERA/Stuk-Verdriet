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
        <aside className="community-login-card community-coming-soon" aria-label="Community in development">
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
              <p className="eyebrow">Under construction</p>
              <h2>Community ontplooit zich</h2>
              <p>We bouwen aan een mooie plek voor jouw verhalen. Volg ons op social media voor updates!</p>
              <div className="community-social-links">
                <a
                  href="https://www.instagram.com/stukverdrietdepodcast/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-circle-link"
                  aria-label="Volg Stuk Verdriet op Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 11.002 2.881 1.44 1.44 0 01-.002-2.881z"/>
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@stuk.verdriet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-circle-link"
                  aria-label="Volg Stuk Verdriet op TikTok"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.66 .3 2.89 2.89 0 015.66-.3V9.54a4.84 4.84 0 003.77 4.25v-3.1a9.86 9.86 0 01-1.1-.53v3.1z"/>
                  </svg>
                </a>
              </div>
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
