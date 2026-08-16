import { Onepager } from "@/app/onepager";
import type { Metadata } from "next";

type HomePageProps = {
  searchParams?: Promise<{ signup?: string }>;
};

export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  }
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  return <Onepager signupStatus={params?.signup ?? null} />;
}
