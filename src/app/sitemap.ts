import type { MetadataRoute } from "next";
import { getApprovedCommunityPosts, getPublishedEpisodes } from "@/lib/content";
import { getThemeArticles } from "@/lib/theme-articles";
import { site } from "@/lib/site";

const staticRoutes = [
  "",
  "/podcast",
  "/themas",
  "/community",
  "/over",
  "/contact",
  "/faq",
  "/archief",
  "/bijsluiter",
  "/privacy",
  "/cookies",
  "/algemene-voorwaarden",
  "/communityrichtlijnen"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = site.url.replace(/\/$/, "");
  const [episodes, posts] = await Promise.all([getPublishedEpisodes(), getApprovedCommunityPosts()]);
  const themes = getThemeArticles();

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));

  for (const episode of episodes) {
    entries.push({
      url: `${baseUrl}/podcast/${episode.slug}`,
      lastModified: episode.publication_date ? new Date(episode.publication_date) : new Date()
    });
  }

  for (const theme of themes) {
    entries.push({ url: `${baseUrl}/themas/${theme.slug}`, lastModified: new Date() });
  }

  for (const post of posts) {
    entries.push({
      url: `${baseUrl}/community/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.created_at)
    });
  }

  return entries;
}
