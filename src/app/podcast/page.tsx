import type { Metadata } from "next";
import { EpisodeList, PageIntro } from "@/components/ui";
import { getPublishedEpisodes, getPublishedSeasons } from "@/lib/content";

export const metadata: Metadata = {
  title: "Podcast",
  description: "Afleveringen van Stuk Verdriet, een open en eerlijke podcast over rouw."
};

export default async function PodcastPage() {
  const [seasons, episodes] = await Promise.all([getPublishedSeasons(), getPublishedEpisodes()]);
  return (
    <>
      <PageIntro eyebrow="Podcast" title="Afleveringen">
        <p>[PODCAST_INTRO_WORDT_AANGELEVERD]</p>
      </PageIntro>
      <EpisodeList seasons={seasons} episodes={episodes} />
    </>
  );
}
