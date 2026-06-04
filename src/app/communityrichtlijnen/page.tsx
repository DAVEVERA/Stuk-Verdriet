import { PageIntro } from "@/components/ui";

export default function CommunityGuidelinesPage() {
  return (
    <>
      <PageIntro eyebrow="Community" title="Richtlijnen">
        <p>De community is ondersteunend, maar geen vervanging voor professionele hulp.</p>
      </PageIntro>
      <section className="content-band">
        <div className="post-card">
          <ul>
            <li>Reageer respectvol.</li>
            <li>Stel geen medische diagnoses.</li>
            <li>Geen persoonlijke aanvallen.</li>
            <li>Geen haatdragende of kwetsende taal.</li>
            <li>Geen commerciële spam.</li>
            <li>Deel geen privacygevoelige gegevens van anderen.</li>
            <li>Zoek bij acute nood professionele hulp.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
