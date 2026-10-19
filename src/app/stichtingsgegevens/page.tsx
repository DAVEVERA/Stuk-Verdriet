import type { Metadata } from "next";
import { FactGroup } from "@/components/governance/FactGroup";
import { GovernanceShell } from "@/components/governance/GovernanceShell";
import styles from "@/components/governance/Governance.module.css";
import { bankingFacts, contactFacts, organisationFacts } from "@/lib/governance";

export const metadata: Metadata = {
  title: "Stichtingsgegevens",
  description:
    "De officiële gegevens van Stichting Stuk Verdriet: KVK-nummer, RSIN, vestigingsadres en rekeningnummer.",
  alternates: {
    canonical: "/stichtingsgegevens"
  }
};

export default function StichtingsgegevensPage() {
  return (
    <GovernanceShell
      current="/stichtingsgegevens"
      label="Stichting Stuk Verdriet"
      title="Stichtingsgegevens"
      lede="De gegevens waarmee de stichting is geregistreerd, en het rekeningnummer waarop donaties binnenkomen."
    >
      <FactGroup facts={organisationFacts} title="Registratie" />
      <FactGroup facts={contactFacts} title="Contact en vestiging" />
      <FactGroup facts={bankingFacts} title="Donaties" />
      <div className={styles.note}>
        <p>
          Giften komen volledig ten goede aan de doelstelling van de stichting. Bestuurders ontvangen geen beloning voor
          hun bestuurlijke werkzaamheden.
        </p>
        <p>
          De stichting publiceert de wettelijk vereiste gegevens en legt jaarlijks verantwoording af over haar
          activiteiten en financiële situatie.
        </p>
      </div>
    </GovernanceShell>
  );
}
