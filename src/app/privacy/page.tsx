import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export default function PrivacyPage() {
  const text = readLegalDocument("Privacyverklaring Stuk Verdriet.txt");
  return <LegalTextPage title="Privacyverklaring Stuk Verdriet" text={text} />;
}
