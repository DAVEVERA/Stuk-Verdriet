import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Verwerkers en persoonsgegevens",
  description: "Overzicht van verwerkers, dienstverleners en AVG-afspraken voor Stuk Verdriet."
};

export default function VerwerkersPage() {
  const text = readLegalDocument("Verwerkers en persoonsgegevens Stuk Verdriet.txt");
  return <LegalTextPage title="Verwerkers en persoonsgegevens Stuk Verdriet" text={text} />;
}
