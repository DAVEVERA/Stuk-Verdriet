import type { Metadata } from "next";
import Link from "next/link";
import { FactGroup } from "@/components/governance/FactGroup";
import { GovernanceShell } from "@/components/governance/GovernanceShell";
import styles from "@/components/governance/Governance.module.css";
import type { GovernanceFact } from "@/lib/governance";
import { getGovernanceFacts } from "@/lib/governance-data";

export const metadata: Metadata = {
  title: "Stichtingsgegevens en ANBI",
  description:
    "De officiële gegevens van Stichting Stuk Verdriet: KVK-nummer, RSIN, vestigingsadres, rekeningnummer en ANBI-status.",
  alternates: {
    canonical: "/stichtingsgegevens"
  }
};

/**
 * ANBI-publicatieplicht. Statisch zodat de wettelijk vereiste gegevens altijd
 * zichtbaar zijn, los van de governance-CMS-staat. RSIN en contactgegevens
 * staan al in de groepen hierboven; dit vult de ANBI-specifieke velden aan.
 */
const anbiFacts: GovernanceFact[] = [
  { label: "Publieksnaam", value: "Stichting Stuk Verdriet" },
  {
    label: "ANBI-status",
    value: "Erkend door de Belastingdienst",
    hint: "Algemeen Nut Beogende Instelling"
  }
];

export default async function StichtingsgegevensPage() {
  const facts = await getGovernanceFacts();
  return (
    <GovernanceShell
      current="/stichtingsgegevens"
      label="Stichting Stuk Verdriet"
      title="Stichtingsgegevens"
      lede="De gegevens waarmee de stichting is geregistreerd, en het rekeningnummer waarop donaties binnenkomen."
    >
      <FactGroup facts={facts.organisation} title="Registratie" />
      <FactGroup facts={facts.contact} title="Contact en vestiging" />
      <FactGroup facts={facts.banking} title="Donaties" />
      <FactGroup facts={anbiFacts} title="ANBI" />
      <div className={styles.note}>
        <p>
          Stichting Stuk Verdriet is door de Belastingdienst aangemerkt als Algemeen Nut Beogende Instelling (ANBI). De
          stichting zet zich voor minimaal 90% in voor het algemeen belang en heeft geen winstoogmerk.
        </p>
        <p>
          Dankzij deze ANBI-status zijn giften aan de stichting aftrekbaar bij de aangifte inkomstenbelasting of
          vennootschapsbelasting, binnen de regels van de Belastingdienst. De stichting betaalt zelf geen schenk- of
          erfbelasting over ontvangen schenkingen en erfenissen.
        </p>
        <p>
          De doelstelling en de besteding van de middelen staan in het{" "}
          <Link href="/beleidsplan">beleidsplan</Link>; het beloningsbeleid leest u bij{" "}
          <Link href="/bestuur-en-beloningsbeleid">bestuur en beloningsbeleid</Link>. Giften komen volledig ten goede aan
          de doelstelling en bestuurders ontvangen geen beloning voor hun bestuurlijke werkzaamheden.
        </p>
        <p>
          De stichting publiceert de wettelijk vereiste gegevens en legt jaarlijks verantwoording af over haar
          activiteiten en financiële situatie.
        </p>
      </div>
    </GovernanceShell>
  );
}
