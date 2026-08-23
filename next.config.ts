import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    cpus: 2,
    serverActions: {
      bodySizeLimit: "31mb"
    }
  },
  turbopack: {
    root: process.cwd()
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "*.giphy.com"
      },
      {
        protocol: "https",
        hostname: "img.icons8.com"
      },
      {
        protocol: "https",
        hostname: "maxst.icons8.com"
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**"
      }
    ]
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const formActionSrc = [
      "form-action 'self'",
      "https://stukverdriet.com",
      "https://www.stukverdriet.com"
    ].join(" ");
    const scriptSrc = [
      "script-src 'self' 'unsafe-inline'",
      isDev ? "'unsafe-eval'" : null,
      "https://www.googletagmanager.com https://www.google-analytics.com https://www.instagram.com https://www.tiktok.com"
    ]
      .filter(Boolean)
      .join(" ");
    const upgradeInsecureRequests = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")
      ? "upgrade-insecure-requests"
      : null;

    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      formActionSrc,
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      scriptSrc,
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com",
      "frame-src 'self' https://open.spotify.com https://www.gofundme.com https://www.instagram.com https://www.tiktok.com",
      upgradeInsecureRequests
    ]
      .filter(Boolean)
      .join("; ");

    return [
      {
        source: "/audio/:path*.mpeg",
        headers: [
          { key: "Content-Type", value: "audio/mpeg" },
          { key: "Accept-Ranges", value: "bytes" }
        ]
      },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }
        ]
      }
    ];
  }
};

export default nextConfig;
