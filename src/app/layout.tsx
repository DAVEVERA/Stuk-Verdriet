import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { CookieConsent } from "@/components/CookieConsent";
import { CommunityAccountDockLoader } from "@/components/CommunityAccountDockLoader";
import { SideNav } from "@/components/SideNav";
import { SocialSidebar } from "@/components/SocialSidebar";
import { Footer } from "@/components/ui";
import { getSiteSettings, getSocialLinks } from "@/lib/content";
import { site } from "@/lib/site";
import { hasSupabaseEnv } from "@/lib/supabase";
import "./globals.css";

const jost = localFont({
  src: [
    {
      path: "./fonts/Jost-VariableFont_wght.ttf",
      style: "normal",
      weight: "100 900"
    },
    {
      path: "./fonts/Jost-Italic-VariableFont_wght.ttf",
      style: "italic",
      weight: "100 900"
    }
  ],
  variable: "--font-jost",
  display: "swap"
});

const slogan = localFont({
  src: [
    {
      path: "../../assets/fonts/Nothing_You_Could_Do/NothingYouCouldDo-Regular.ttf",
      style: "normal",
      weight: "400"
    }
  ],
  variable: "--font-slogan",
  display: "swap"
});

const figtree = localFont({
  src: [
    {
      path: "../../assets/fonts/figtree/Figtree-VariableFont_wght.ttf",
      style: "normal",
      weight: "300 900"
    },
    {
      path: "../../assets/fonts/figtree/Figtree-Italic-VariableFont_wght.ttf",
      style: "italic",
      weight: "300 900"
    }
  ],
  variable: "--font-figtree",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Stuk Verdriet - podcast en community over rouw",
    template: "%s | Stuk Verdriet"
  },
  description: "Stuk Verdriet biedt herkenning, steun en verbinding voor iedereen die te maken heeft met rouw.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Stuk Verdriet",
    statusBarStyle: "black-translucent"
  },
  other: {
    // Next's appleWebApp.capable only emits the modern "mobile-web-app-capable" tag;
    // older iOS Safari versions specifically look for the "apple-" prefixed one.
    "apple-mobile-web-app-capable": "yes"
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: "Stuk Verdriet",
    description: "Verdriet verdient een stem.",
    siteName: "Stuk Verdriet",
    images: ["/brand/sverdriet_logo.webp"],
    locale: "nl_NL",
    type: "website"
  },
  verification: {
    google: "OFa22mraECpgkeSyodVbzq9wLtrXCJAXhZqthNt0Xps"
  }
};

export const viewport: Viewport = {
  themeColor: "#425645"
};

function buildWebsiteJsonLd(logoUrl: string) {
  const absoluteLogoUrl = logoUrl.startsWith("http") ? logoUrl : `${site.url}${logoUrl}`;
  return {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: absoluteLogoUrl,
      email: site.email,
      sameAs: [
        "https://www.instagram.com/stukverdrietdepodcast/",
        "https://www.tiktok.com/@stuk.verdriet"
      ]
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      inLanguage: "nl-NL",
      publisher: {
        "@id": `${site.url}/#organization`
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${site.url}/community?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "PodcastSeries",
      "@id": `${site.url}/podcast#series`,
      name: "Stuk Verdriet",
      url: `${site.url}/podcast`,
      description: "Een Nederlandse podcast en community over rouw, verlies, ziekte, gemis en verder leven.",
      inLanguage: "nl-NL",
      publisher: {
        "@id": `${site.url}/#organization`
      }
    }
  ]
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [socialLinks, siteSettings] = await Promise.all([getSocialLinks(), getSiteSettings()]);
  const logoUrl = siteSettings.logo_url || site.logo;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="nl" className={`${jost.variable} ${slogan.variable} ${figtree.variable}`} data-scroll-behavior="smooth">
      <body>
        <div className="site-shell">
          <Header socialLinks={socialLinks} spotifyUrl={socialLinks.spotify_url} logoUrl={logoUrl} />
          <Suspense fallback={null}>
            <SideNav />
          </Suspense>
          <Suspense fallback={null}>
            <CommunityAccountDockLoader hasSupabaseEnv={hasSupabaseEnv} />
          </Suspense>
          <SocialSidebar socialLinks={socialLinks} />
          <main className="main">{children}</main>
          <Footer socialLinks={socialLinks} logoUrl={logoUrl} />
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd(logoUrl)) }}
        />
        <CookieConsent gaId={gaId} />
      </body>
    </html>
  );
}
