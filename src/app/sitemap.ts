import type { MetadataRoute } from "next";
import { getApprovedCommunityPosts, getPublishedEpisodes } from "@/lib/content";
import { getThemeArticles } from "@/lib/theme-articles";
import { site } from "@/lib/site";

const productionSiteUrl = "https://stukverdriet.staging.mnrv.nl";

const staticRoutes = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/podcast", priority: 0.9, changeFrequency: "weekly" },
  { path: "/themas", priority: 0.9, changeFrequency: "monthly" },
  { path: "/community", priority: 0.8, changeFrequency: "weekly" },
  { path: "/over", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/archief", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/algemene-voorwaarden", priority: 0.3, changeFrequency: "yearly" },
  { path: "/communityrichtlijnen", priority: 0.4, changeFrequency: "yearly" }
] satisfies Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}>;

function getBaseUrl() {
  const configuredUrl = site.url.trim();
  if (!configuredUrl || configuredUrl.includes("localhost")) return productionSiteUrl;
  return configuredUrl.replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const [episodes, posts] = await Promise.all([getPublishedEpisodes(), getApprovedCommunityPosts()]);
  const themes = getThemeArticles();

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));

  for (const episode of episodes) {
    entries.push({
      url: `${baseUrl}/podcast/${episode.slug}`,
      lastModified: episode.publication_date ? new Date(episode.publication_date) : new Date(),
      changeFrequency: "monthly",
      priority: 0.8
    });
  }

  for (const theme of themes) {
    entries.push({
      url: `${baseUrl}/themas/${theme.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    });
  }

  for (const post of posts) {
    entries.push({
      url: `${baseUrl}/community/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.created_at),
      changeFrequency: "monthly",
      priority: 0.6
    });
  }

  return entries;
}
