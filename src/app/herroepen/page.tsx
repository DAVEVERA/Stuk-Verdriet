import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Aankoop herroepen",
  description: "Herroepingsfunctie voor aankopen via de Stuk Verdriet webshop.",
  alternates: {
    canonical: "/herroepingsformulier"
  },
  robots: {
    index: false,
    follow: true
  }
};

export default function HerroepenPage() {
  const text = readLegalDocument("Model herroepingsformulier Stuk Verdriet.txt");
  return <LegalTextPage title="Aankoop herroepen" text={text} />;
}
