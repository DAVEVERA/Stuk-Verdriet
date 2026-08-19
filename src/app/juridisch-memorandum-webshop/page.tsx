import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Juridisch memorandum webshop",
  description: "Juridisch memorandum over de benodigde documentenset voor de Stuk Verdriet webshop.",
  robots: {
    index: false,
    follow: false
  }
};

export default function JuridischMemorandumWebshopPage() {
  const text = readLegalDocument("Juridisch memorandum webshop Stuk Verdriet.txt");
  return <LegalTextPage title="Juridisch memorandum webshop Stuk Verdriet" text={text} />;
}
