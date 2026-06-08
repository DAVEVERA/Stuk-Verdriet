import { LegalTextPage } from "@/components/LegalTextPage";
import { readLegalDocument } from "@/lib/legal";

export default function CommunityGuidelinesPage() {
  const text = readLegalDocument("Communityrichtlijnen Stuk Verdriet.txt");
  return <LegalTextPage title="Communityrichtlijnen Stuk Verdriet" text={text} />;
}
