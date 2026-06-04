import { Onepager } from "@/app/onepager";

type CommunityPageProps = {
  searchParams?: Promise<{ submitted?: string; error?: string }>;
};

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = await searchParams;
  return <Onepager initialPanel="community" submitted={params?.submitted === "pending"} error={params?.error ?? null} />;
}
