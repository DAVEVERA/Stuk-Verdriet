import type { Metadata } from "next";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { Onepager } from "@/app/onepager";
import { site } from "@/lib/site";
import { siteMode } from "@/lib/site-mode";

const activeSiteMode = process.env.SITE_MODE ?? siteMode;

const comingSoonMetadata: Metadata = {
  title: "Bijna live",
  description: "Stuk Verdriet gaat bijna live. Binnenkort vind je hier de podcast en community over rouw, gemis en verder leven."
};

const liveMetadata: Metadata = {
  title: "Stuk Verdriet - podcast en community over rouw",
  description: "Stuk Verdriet biedt herkenning, steun en verbinding voor iedereen die te maken heeft met rouw."
};

export const metadata: Metadata = activeSiteMode === "live" ? liveMetadata : comingSoonMetadata;

type HomePageProps = {
  searchParams?: Promise<{ signup?: string }>;
};

const comingSoonSocials = {
  instagram: "https://www.instagram.com/stukverdrietdepodcast/",
  tiktok: "https://www.tiktok.com/@stukverdrietdepodcast/"
};

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M16.6 5.82c1.18.84 2.36 1.31 3.72 1.41v3.08a8.76 8.76 0 0 1-3.7-.82v5.67c0 3.18-2.58 5.76-5.76 5.76a5.76 5.76 0 0 1-2.2-11.08 5.8 5.8 0 0 1 2.2-.43c.33 0 .65.03.96.09v3.22a2.58 2.58 0 1 0 1.95 2.5V3.08h2.83v2.74Z" />
    </svg>
  );
}

function ComingSoonPage() {
  return (
    <section className="coming-soon-page" aria-labelledby="coming-soon-title">
      <Image
        src="/landing/coming-soon-neon.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="coming-soon-image"
      />
      <div className="coming-soon-scrim" aria-hidden="true" />
      <div className="coming-soon-content">
        <Image src={site.logo} alt="Stuk Verdriet" width={86} height={86} priority className="coming-soon-logo" />
        <h1 id="coming-soon-title">We zijn bijna live</h1>
        <p className="coming-soon-lead">
          Hier ontstaat een plek waar rouw niet weggestopt hoeft te worden. Met eerlijke gesprekken, herkenbare verhalen
          en ruimte voor gemis, liefde en verder leven. Voor iedereen die iets of iemand mist — en wil voelen: ik sta hier
          niet alleen in. Binnenkort meer.
        </p>
        <div className="coming-soon-actions">
          <a className="coming-soon-primary coming-soon-social-instagram" href={comingSoonSocials.instagram} target="_blank" rel="noopener noreferrer">
            <Instagram size={18} aria-hidden />
            Instagram
          </a>
          <a className="coming-soon-primary coming-soon-social-tiktok" href={comingSoonSocials.tiktok} target="_blank" rel="noopener noreferrer">
            <TikTokIcon size={18} />
            TikTok
          </a>
        </div>
      </div>
      <p className="coming-soon-credit">
        Gebouwd door MNRV. <span>&quot;Veel projecten bouw ik met m&apos;n hoofd, deze bouw ik met m&apos;n hart&quot;</span>
      </p>
    </section>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  if (activeSiteMode === "live") {
    const params = await searchParams;
    return <Onepager signupStatus={params?.signup ?? null} />;
  }

  return <ComingSoonPage />;
}
