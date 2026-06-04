import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EpisodeMeta, PageIntro, PlatformLinks, formatDate } from "@/components/ui";
import { getEpisodeBySlug, getPublishedEpisodes } from "@/lib/content";

export async function generateStaticParams() {
  const episodes = await getPublishedEpisodes();
  return episodes.map((episode) => ({ slug: episode.slug }));
}

export default async function EpisodeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);
  if (!episode) notFound();

  return (
    <>
      <PageIntro eyebrow={`Seizoen ${episode.season_number}, aflevering ${episode.episode_number}`} title={episode.title}>
        <EpisodeMeta episode={episode} />
      </PageIntro>
      <section className="content-band">
        <article className="latest-card">
          {episode.image_url ? <Image src={episode.image_url} alt="" width={1200} height={780} /> : null}
          {episode.audio_file_url ? <audio controls src={episode.audio_file_url} /> : null}
          {episode.short_intro ? <p>{episode.short_intro}</p> : null}
          {episode.description ? <p>{episode.description}</p> : null}
          {episode.next_episode_date ? <p>Volgende aflevering beschikbaar op: {formatDate(episode.next_episode_date)}</p> : null}
          <PlatformLinks episode={episode} />
          <Link className="text-link" href="/podcast">
            Terug naar podcastoverzicht
          </Link>
        </article>
      </section>
    </>
  );
}
