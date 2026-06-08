import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export default function AlgemeneVoorwaardenPage() {
  const text = readLegalDocument("Algemene Voorwaarden Stuk Verdriet.txt");
  return <LegalTextPage title="Algemene voorwaarden Stuk Verdriet" text={text} />;
}
