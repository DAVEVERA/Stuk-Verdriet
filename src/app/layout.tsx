import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/ui";
import { getSocialLinks } from "@/lib/content";
import { site } from "@/lib/site";
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
      path: "./fonts/NothingYouCouldDo-Regular.ttf",
      style: "normal",
      weight: "400"
    }
  ],
  variable: "--font-slogan",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Stuk Verdriet - podcast en community over rouw",
    template: "%s | Stuk Verdriet"
  },
  description: "Stuk Verdriet biedt herkenning, steun en verbinding voor iedereen die te maken heeft met rouw.",
  openGraph: {
    title: "Stuk Verdriet",
    description: "Verdriet verdient een stem.",
    siteName: "Stuk Verdriet",
    images: ["/brand/sverdriet_logo.webp"],
    locale: "nl_NL",
    type: "website"
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const socialLinks = await getSocialLinks();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="nl" className={`${jost.variable} ${slogan.variable}`}>
      <body>
        <div className="site-shell">
          <Header spotifyUrl={socialLinks.spotify_url} />
          <main className="main">{children}</main>
          <Footer socialLinks={socialLinks} />
        </div>
        <CookieConsent gaId={gaId} />
      </body>
    </html>
  );
}
