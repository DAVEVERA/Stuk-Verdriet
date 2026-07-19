import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Bewaartermijnen",
  description: "Bewaartermijnen voor webshop-, privacy-, community- en contactgegevens bij Stuk Verdriet."
};

export default function BewaartermijnenPage() {
  const text = readLegalDocument("Bewaartermijnen Stuk Verdriet.txt");
  return <LegalTextPage title="Bewaartermijnen Stuk Verdriet" text={text} />;
}
