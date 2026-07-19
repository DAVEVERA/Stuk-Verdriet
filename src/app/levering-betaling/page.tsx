import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Levering en betaling",
  description: "Betaalmethoden, prijzen, levering en orderbevestiging voor de Stuk Verdriet webshop."
};

export default function LeveringBetalingPage() {
  const text = readLegalDocument("Levering en betaling Stuk Verdriet.txt");
  return <LegalTextPage title="Levering en betaling Stuk Verdriet" text={text} />;
}
