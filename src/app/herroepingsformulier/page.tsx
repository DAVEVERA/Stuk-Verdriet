import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export const metadata = {
  title: "Model herroepingsformulier",
  description: "Model herroepingsformulier voor aankopen via de Stuk Verdriet webshop."
};

export default function HerroepingsformulierPage() {
  const text = readLegalDocument("Model herroepingsformulier Stuk Verdriet.txt");
  return <LegalTextPage title="Model herroepingsformulier Stuk Verdriet" text={text} />;
}
