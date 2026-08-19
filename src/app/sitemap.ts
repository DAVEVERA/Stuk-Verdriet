import type { MetadataRoute } from "next";
import { getApprovedCommunityPosts, getPublishedEpisodes } from "@/lib/content";
import { canonicalSiteUrl } from "@/lib/site";
import { getThemeArticles } from "@/lib/theme-articles";

// Alleen aanpassen wanneer de zichtbare hoofdinhoud van de homepage wezenlijk wijzigt.
const homepageContentLastModified = "2026-08-19";

const staticPaths = [
  "",
  "/podcast",
  "/themas",
  "/community",
  "/over",
  "/contact"
] as const;

export const revalidate = 3600;

function validDate(value: string | null | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function newestDate(values: Array<string | null | undefined>) {
  return values
    .map(validDate)
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];
}

function canonicalUrl(pathname: string) {
  const path = pathname === "/" ? "" : `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  return `${canonicalSiteUrl}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [episodes, posts] = await Promise.all([
    getPublishedEpisodes(),
    getApprovedCommunityPosts()
  ]);
  const themes = getThemeArticles();

  const episodeLastModified = newestDate(
    episodes.flatMap((episode) => [episode.updated_at, episode.publication_date, episode.created_at])
  );
  const communityLastModified = newestDate(
    posts.flatMap((post) => [post.updated_at, post.created_at])
  );
  const homeLastModified = newestDate([
    homepageContentLastModified,
    episodeLastModified?.toISOString(),
    communityLastModified?.toISOString()
  ]);

  const aggregateDates = new Map<string, Date | undefined>([
    ["", homeLastModified],
    ["/podcast", episodeLastModified],
    ["/community", communityLastModified]
  ]);

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: canonicalUrl(path),
    lastModified: aggregateDates.get(path)
  }));

  for (const theme of themes) {
    if (!theme.slug) continue;
    entries.push({
      url: canonicalUrl(`/themas/${theme.slug}`)
    });
  }

  for (const post of posts) {
    if (!post.slug) continue;
    entries.push({
      url: canonicalUrl(`/community/${post.slug}`),
      lastModified: validDate(post.updated_at ?? post.created_at)
    });
  }

  return Array.from(
    new Map(entries.map((entry) => [entry.url, entry])).values()
  );
}
