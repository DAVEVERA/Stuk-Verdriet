import { LegalTextPage } from "@/components/LegalTextPage";
import { cookiePolicyText } from "@/lib/legal";

export default function CookiesPage() {
  return <LegalTextPage title="Cookieverklaring Stuk Verdriet" text={cookiePolicyText} />;
}
