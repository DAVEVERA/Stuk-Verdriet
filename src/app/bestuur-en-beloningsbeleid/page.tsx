import type { Metadata } from "next";
import { GovernanceSections } from "@/components/governance/GovernanceSections";
import { GovernanceShell } from "@/components/governance/GovernanceShell";
import { bestuurSections } from "@/lib/governance";

export const metadata: Metadata = {
  title: "Bestuur en beloningsbeleid",
  description:
    "De samenstelling van het bestuur van Stichting Stuk Verdriet, de taken en verantwoordelijkheden en het beloningsbeleid.",
  alternates: {
    canonical: "/bestuur-en-beloningsbeleid"
  }
};

export default function BestuurEnBeloningsbeleidPage() {
  return (
    <GovernanceShell
      current="/bestuur-en-beloningsbeleid"
      label="Stichting Stuk Verdriet"
      title="Bestuur en beloningsbeleid"
      lede="Wie het bestuur vormen, waarvoor zij verantwoordelijk zijn en waarom geen van hen een beloning ontvangt."
    >
      <GovernanceSections sections={bestuurSections} />
    </GovernanceShell>
  );
}
