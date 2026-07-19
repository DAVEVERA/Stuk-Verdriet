import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Garantie en klachten",
  description: "Wettelijke garantie en klachtenafhandeling voor de Stuk Verdriet webshop."
};

export default function GarantieKlachtenPage() {
  const text = readLegalDocument("Garantie en klachten Stuk Verdriet.txt");
  return <LegalTextPage title="Garantie en klachten Stuk Verdriet" text={text} />;
}
