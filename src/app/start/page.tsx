import { Onepager } from "@/app/onepager";

type StartPageProps = {
  searchParams?: Promise<{ signup?: string }>;
};

export default async function StartPage({ searchParams }: StartPageProps) {
  const params = await searchParams;
  return <Onepager signupStatus={params?.signup ?? null} />;
}
