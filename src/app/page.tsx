import Image from "next/image";
import { CommunityCategoryGrid, CommunityPostCard, Hero, HostCard, PodcastOnePagerSection, SocialLinksList, StickySpotifyPlayer } from "@/components/ui";
import { createCommunityPost } from "@/lib/actions";
import { getApprovedCommunityPosts, getCommunityCategories, getLatestEpisode, getPublishedEpisodes, getPublishedHosts, getPublishedSeasons, getSocialLinks } from "@/lib/content";
import { site } from "@/lib/site";

export default async function HomePage() {
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
          <p className="eyebrow">Thema&apos;s</p>
          <h2>Onderwerpen die ruimte geven</h2>
          <p>De community is opgezet rond rustige thema&apos;s, zodat herkenning en praktische steun vindbaar blijven.</p>
        </div>
        <CommunityCategoryGrid categories={categories} />
      </section>

      <section className="community-onepager" id="community">
        <div className="community-visual">
          <Image src="/hero/community-path.png" alt="Rustige boswandeling met bankje als symbool voor ruimte en gesprek" fill sizes="(max-width: 900px) 100vw, 40vw" />
        </div>
        <div className="community-panel">
          <p className="eyebrow">Community</p>
          <h2>Vind herkenning, steun en kennis</h2>
          <p>Berichten worden eerst gelezen door een beheerder. Zo blijft de plek rustig, veilig en respectvol.</p>
          <div className="post-grid compact">
            {posts.slice(0, 2).map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-band share-section" id="deel-je-verhaal">
        <div className="section-heading">
          <p className="eyebrow">Deel je verhaal</p>
          <h2>Laagdrempelig, met moderatie</h2>
          <p>Inloggen is nodig om te plaatsen. Nieuwe berichten staan eerst op pending.</p>
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
      </section>

      {hosts.length ? (
        <section className="content-band" id="over">
          <div className="section-heading">
            <p className="eyebrow">Over</p>
            <h2>De mensen achter Stuk Verdriet</h2>
          </div>
          <div className="host-grid">
            {hosts.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="contact-band" id="contact">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Rustig contact</h2>
          <p>Alleen per e-mail en via beschikbare social media. Geen telefoonnummer of adres op de site.</p>
        </div>
        <div className="contact-actions">
          <a className="button" href={`mailto:${site.email}`}>{site.email}</a>
          <SocialLinksList links={socialLinks} />
        </div>
      </section>
    </>
  );
}
