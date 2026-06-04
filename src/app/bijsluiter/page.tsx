import { Onepager } from "@/app/onepager";

type BijsluiterPageProps = {
  searchParams?: Promise<{ submitted?: string; error?: string; missing?: string }>;
};

export default async function BijsluiterPage({ searchParams }: BijsluiterPageProps) {
  const params = await searchParams;
  return <Onepager initialPanel="bijsluiter" submitted={params?.submitted === "pending"} error={params?.error ?? params?.missing ?? null} />;
}
