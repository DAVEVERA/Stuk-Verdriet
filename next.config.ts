import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url))
  },
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
