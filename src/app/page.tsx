import { Onepager } from "@/app/onepager";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type HomePageProps = {
  searchParams?: Promise<{ signup?: string }>;
};

export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  }
};

export default async function HomePage({ searchParams }: HomePageProps) {
  if (process.env.NEXT_PUBLIC_COMMUNITY_STANDALONE === "1") {
    redirect("/community");
  }

  const params = await searchParams;
  return <Onepager signupStatus={params?.signup ?? null} />;
}
