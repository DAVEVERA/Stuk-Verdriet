import type { Metadata } from "next";
import { GovernanceSections } from "@/components/governance/GovernanceSections";
import { GovernanceShell } from "@/components/governance/GovernanceShell";
import styles from "@/components/governance/Governance.module.css";
import { beleidsplanAdoption, beleidsplanSections } from "@/lib/governance";

export const metadata: Metadata = {
  title: "Beleidsplan 2026–2028",
  description:
    "Het beleidsplan van Stichting Stuk Verdriet: doelstelling, werkzaamheden, werving van inkomsten en de besteding van het vermogen.",
  alternates: {
    canonical: "/beleidsplan"
  }
};

export default function BeleidsplanPage() {
  return (
    <GovernanceShell
      current="/beleidsplan"
      label="Beleidsperiode 2026–2028"
      title="Beleidsplan"
      lede="Waar de stichting voor staat, wat zij doet, hoe zij aan inkomsten komt en waaraan die inkomsten worden besteed."
      meta={`${beleidsplanAdoption.statement} ${beleidsplanAdoption.label}: ${beleidsplanAdoption.date}.`}
    >
      <GovernanceSections sections={beleidsplanSections} />
      <div className={styles.adoption}>
        <p className={styles.adoptionStatement}>{beleidsplanAdoption.statement}</p>
        <p className={styles.adoptionDate}>
          {beleidsplanAdoption.label}: <b>{beleidsplanAdoption.date}</b>
        </p>
      </div>
    </GovernanceShell>
  );
}
