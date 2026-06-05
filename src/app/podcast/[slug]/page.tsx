import { Onepager } from "@/app/onepager";
import { fallbackEpisodes } from "@/lib/fallback-data";

export function generateStaticParams() {
  return fallbackEpisodes.map((episode) => ({ slug: episode.slug }));
}

export default function EpisodeDetailPage() {
  return <Onepager initialPanel="podcast" />;
}
