import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/redirect"]
      }
    ],
    sitemap: `${canonicalSiteUrl}/sitemap.xml`
  };
}
