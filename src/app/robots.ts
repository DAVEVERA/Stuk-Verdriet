import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const productionSiteUrl = "https://stukverdriet.com";

function getBaseUrl() {
  const configuredUrl = site.url.trim();
  if (!configuredUrl || configuredUrl.includes("localhost")) return productionSiteUrl;
  return configuredUrl.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/auth", "/login", "/redirect"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
