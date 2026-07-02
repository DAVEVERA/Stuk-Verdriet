import type { Metadata } from "next";
import Image from "next/image";
import { Onepager } from "@/app/onepager";
import { subscribeEpisodeSignup } from "@/lib/actions";
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

const signupFeedback: Record<string, string> = {
  error: "Aanmelden lukte niet. Probeer het nog eens.",
  invalid: "Vul je naam en een geldig e-mailadres in.",
  storage: "Aanmelden is nog niet gekoppeld.",
  subscribed: "Je staat op de lijst! We laten het je weten."
};

function ComingSoonPage({ signupStatus }: { signupStatus: string | null }) {
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
          en ruimte voor gemis, liefde en verder leven. Voor iedereen die iets of iemand mist - en wil voelen: ik sta hier
          niet alleen in.
        </p>
        <form className="coming-soon-signup" action={subscribeEpisodeSignup} id="aanmelden">
          <input type="hidden" name="source" value="coming_soon" readOnly />
          <div className="coming-soon-signup-fields">
            <label>
              Naam
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              E-mailadres
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>
          <button className="button" type="submit">Houd mij op de hoogte</button>
          {signupStatus ? <p className="signup-feedback">{signupFeedback[signupStatus] ?? signupFeedback.error}</p> : null}
        </form>
      </div>
      <p className="coming-soon-credit">
        Gebouwd door MNRV. <span>&quot;Veel projecten bouw ik met m&apos;n hoofd, deze bouw ik met m&apos;n hart&quot;</span>
      </p>
    </section>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  if (activeSiteMode === "live") {
    return <Onepager signupStatus={params?.signup ?? null} />;
  }

  return <ComingSoonPage signupStatus={params?.signup ?? null} />;
}
