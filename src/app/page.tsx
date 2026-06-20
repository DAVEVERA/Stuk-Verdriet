import type { Metadata } from "next";
import Image from "next/image";
import { Mail } from "lucide-react";
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

function ComingSoonPage() {
  return (
    <section className="coming-soon-page" aria-labelledby="coming-soon-title">
      <Image
        src="/landing/coming-soon-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="coming-soon-image"
      />
      <div className="coming-soon-scrim" aria-hidden="true" />
      <div className="coming-soon-content">
        <Image src={site.logo} alt="Stuk Verdriet" width={112} height={142} priority className="coming-soon-logo" />
        <p className="coming-soon-kicker">Stuk Verdriet</p>
        <h1 id="coming-soon-title">We zijn bijna live</h1>
        <p className="coming-soon-lead">
          De laatste details krijgen nu aandacht. Binnenkort vind je hier gesprekken, verhalen en een zachte plek
          voor rouw, gemis en verder leven.
        </p>
        <div className="coming-soon-actions" aria-label="Tijdelijke acties">
          <a className="coming-soon-primary" href={`mailto:${site.email}`}>
            <Mail size={18} aria-hidden />
            Neem contact op
          </a>
        </div>
      </div>
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
