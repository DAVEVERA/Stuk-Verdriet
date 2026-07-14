import { Onepager } from "@/app/onepager";

type PodcastPageProps = {
  searchParams?: Promise<{ signup?: string }>;
};

export default async function PodcastPage({ searchParams }: PodcastPageProps) {
  const params = await searchParams;
  return <Onepager initialPanel="podcast" signupStatus={params?.signup ?? null} />;
}
