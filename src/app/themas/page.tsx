import { Onepager } from "@/app/onepager";

type ThemasPageProps = {
  searchParams?: Promise<{ theme?: string }>;
};

export default async function ThemasPage({ searchParams }: ThemasPageProps) {
  const params = await searchParams;
  return <Onepager initialPanel="themas" initialTheme={params?.theme ?? null} />;
}
