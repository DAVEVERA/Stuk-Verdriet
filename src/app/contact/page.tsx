import { Mail } from "lucide-react";
import { PageIntro, SocialLinksList } from "@/components/ui";
import { getSocialLinks } from "@/lib/content";
import { site } from "@/lib/site";

export default async function ContactPage() {
  const socialLinks = await getSocialLinks();
  return (
    <>
      <PageIntro eyebrow="Contact" title="Contact">
        <p>Contact loopt rustig en overzichtelijk via e-mail. Er worden geen telefoonnummers, adressen of persoonsgegevens getoond.</p>
      </PageIntro>
      <section className="content-band">
        <a className="button" href={`mailto:${site.email}`}>
          <Mail size={18} aria-hidden /> {site.email}
        </a>
        <SocialLinksList links={socialLinks} />
      </section>
    </>
  );
}
