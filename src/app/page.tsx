import { Onepager } from "@/app/onepager";

type HomePageProps = {
  searchParams?: Promise<{ signup?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  return <Onepager signupStatus={params?.signup ?? null} />;
}
