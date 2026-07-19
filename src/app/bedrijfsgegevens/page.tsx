import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Bedrijfsgegevens",
  description: "Bedrijfsgegevens en contactinformatie van Stuk Verdriet voor webshopklanten."
};

export default function BedrijfsgegevensPage() {
  const text = readLegalDocument("Bedrijfsgegevens Stuk Verdriet.txt");
  return <LegalTextPage title="Bedrijfsgegevens Stuk Verdriet" text={text} />;
}
