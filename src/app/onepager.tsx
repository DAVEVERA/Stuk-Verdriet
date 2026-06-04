import Image from "next/image";
import { FlyoutOverlay } from "@/components/FlyoutOverlay";
import { CommunityCategoryGrid, CommunityPostCard, Hero, HostCard, PodcastOnePagerSection, StickySpotifyPlayer } from "@/components/ui";
import { createCommunityPost } from "@/lib/actions";
import { getApprovedCommunityPosts, getCommunityCategories, getLatestEpisode, getPublishedEpisodes, getPublishedHosts, getPublishedSeasons, getSocialLinks } from "@/lib/content";
import { type OnepagerPanel } from "@/lib/site";

type OnepagerProps = {
  initialPanel?: OnepagerPanel | null;
  initialTheme?: string | null;
  submitted?: boolean;
  error?: string | null;
};

export async function Onepager({ initialPanel = null, initialTheme = null, submitted = false, error = null }: OnepagerProps) {
  const [latest, seasons, episodes, categories, posts, hosts, socialLinks] = await Promise.all([
    getLatestEpisode(),
    getPublishedSeasons(),
    getPublishedEpisodes(),
    getCommunityCategories(),
    getApprovedCommunityPosts(),
    getPublishedHosts(),
    getSocialLinks()
  ]);

  return (
    <>
      <Hero />
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
          {submitted ? <p className="notice">Je verhaal is ontvangen.</p> : null}
          {error ? <p className="notice">Controleer of titel, categorie en bericht zijn ingevuld.</p> : null}
          <div className="community-story-grid">
            <div className="post-grid compact">
              {posts.slice(0, 2).map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
            <form className="form-grid story-form" action={createCommunityPost}>
              <label>
                Titel
                <input name="title" required />
              </label>
              <label>
                Categorie
                <select name="category" required>
                  {categories.map((category) => (
                    <option key={category.id}>{category.title}</option>
                  ))}
                </select>
              </label>
              <label>
                Zichtbare naam
                <select name="author_display_type" defaultValue="first_name">
                  <option value="first_name">Voornaam</option>
                  <option value="real_name">Volledige naam</option>
                  <option value="anonymous">Anoniem</option>
                </select>
              </label>
              <label>
                Bericht
                <textarea name="body" required />
              </label>
              <button className="button" type="submit">Verstuur ter goedkeuring</button>
            </form>
          </div>
        </div>
      </section>

      {hosts.length ? (
        <section className="content-band" id="over">
          <div className="section-heading">
            <p className="eyebrow">Over</p>
            <h2>Over Susan</h2>
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
        submitted={submitted}
        error={error}
      />
    </>
  );
}
