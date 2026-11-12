import type { Metadata } from "next";
import { BoardGrid } from "@/components/governance/BoardGrid";
import { GovernanceShell } from "@/components/governance/GovernanceShell";
import { PersonalIntroduction } from "@/components/governance/PersonalIntroduction";
import { getBoardMembers } from "@/lib/governance-data";

export const metadata: Metadata = {
  title: "Wie zijn wij",
  description:
    "Maak kennis met het bestuur van Stichting Stuk Verdriet: Susan, Daniela en Anita.",
  alternates: {
    canonical: "/wie-zijn-wij"
  }
};

export default async function WieZijnWijPage() {
  const members = await getBoardMembers();
  return (
    <GovernanceShell
      current="/wie-zijn-wij"
      label="Stichting Stuk Verdriet"
      title="Wie zijn wij"
      lede="Stichting Stuk Verdriet is opgericht door ouders die zelf weten hoe stil het kan worden na het verlies van een kind. Het bestuur bestaat uit drie vrijwilligers, die geen van allen een beloning ontvangen."
    >
      <BoardGrid members={members} />
      <PersonalIntroduction />
    </GovernanceShell>
  );
}
