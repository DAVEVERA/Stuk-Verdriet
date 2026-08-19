import { Onepager } from "@/app/onepager";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getEpisodeBySlug, getPublishedEpisodes } from "@/lib/content";

type EpisodeDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const getEpisode = cache(getEpisodeBySlug);

export async function generateStaticParams() {
  const episodes = await getPublishedEpisodes();
  return episodes.map((episode) => ({ slug: episode.slug }));
}

export async function generateMetadata({ params }: EpisodeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  if (!episode) {
    return {
      robots: {
        index: false,
        follow: false
      }
    };
  }

  return {
    title: episode.title,
    description: episode.short_intro ?? episode.description ?? "Luister naar de podcast Stuk Verdriet.",
    alternates: {
      canonical: "/podcast"
    },
    robots: {
      index: false,
      follow: true
    }
  };
}

export default async function EpisodeDetailPage({ params }: EpisodeDetailPageProps) {
  const { slug } = await params;
  const episode = await getEpisode(slug);
  if (!episode) notFound();

  return <Onepager initialPanel="podcast" />;
}
