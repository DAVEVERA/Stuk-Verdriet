import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Retour- en herroepingsbeleid",
  description: "Retouren, herroepingsrecht, bedenktijd en terugbetaling voor de Stuk Verdriet webshop."
};

export default function RetourbeleidPage() {
  const text = readLegalDocument("Retour en herroepingsbeleid Stuk Verdriet.txt");
  return <LegalTextPage title="Retour- en herroepingsbeleid Stuk Verdriet" text={text} />;
}
