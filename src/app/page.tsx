import Link from "next/link";
import { CommunityCategoryGrid, Hero, HostCard, LatestEpisodeCard } from "@/components/ui";
import { getCommunityCategories, getLatestEpisode, getPublishedHosts } from "@/lib/content";

export default async function HomePage() {
  const [latest, categories, hosts] = await Promise.all([getLatestEpisode(), getCommunityCategories(), getPublishedHosts()]);

  return (
    <>
      <Hero latest={latest} />
      {latest ? (
        <section className="content-band">
          <div className="section-heading">
            <p className="eyebrow">Podcast</p>
            <h2>Nieuwste aflevering</h2>
          </div>
          <LatestEpisodeCard episode={latest} />
        </section>
      ) : null}
      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Community</p>
          <h2>Vind herkenning, steun en kennis</h2>
          <p>Een rustige plek waar berichten pas zichtbaar worden na goedkeuring.</p>
          <div className="subtle-actions">
            <Link href="/community">Naar de community</Link>
          </div>
        </div>
        <CommunityCategoryGrid categories={categories.slice(0, 4)} />
      </section>
      {hosts.length ? (
        <section className="content-band">
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
    </>
  );
}
