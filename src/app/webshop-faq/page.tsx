import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Webshop FAQ",
  description: "Veelgestelde juridische vragen over bestellen, retouren, garantie, privacy en cookies."
};

export default function WebshopFaqPage() {
  const text = readLegalDocument("Webshop FAQ wetgeving Stuk Verdriet.txt");
  return <LegalTextPage title="Veelgestelde juridische vragen webshop Stuk Verdriet" text={text} />;
}
