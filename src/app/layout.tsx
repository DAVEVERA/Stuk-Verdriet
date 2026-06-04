import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Footer, Header } from "@/components/ui";
import { getSocialLinks } from "@/lib/content";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Stuk Verdriet - podcast en community over rouw",
    template: "%s | Stuk Verdriet"
  },
  description: "Stuk Verdriet biedt herkenning, steun en verbinding voor iedereen die te maken heeft met rouw.",
  openGraph: {
    title: "Stuk Verdriet",
    description: "Je staat er niet alleen voor.",
    siteName: "Stuk Verdriet",
    images: ["/brand/sverdriet_logo.webp"],
    locale: "nl_NL",
    type: "website"
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const socialLinks = await getSocialLinks();
  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <div className="site-shell">
          <Header />
          <main className="main">{children}</main>
          <Footer socialLinks={socialLinks} />
        </div>
      </body>
    </html>
  );
}
