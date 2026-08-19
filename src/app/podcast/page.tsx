import { Onepager } from "@/app/onepager";
import type { Metadata } from "next";

type PodcastPageProps = {
  searchParams?: Promise<{ signup?: string }>;
};

export const metadata: Metadata = {
  title: "Podcast over rouw, verlies en verder leven",
  description: "Luister naar Stuk Verdriet: open gesprekken over rouw, verlies, kanker, herinneringen en verder leven met gemis.",
  alternates: {
    canonical: "/podcast"
  },
  openGraph: {
    title: "Podcast over rouw, verlies en verder leven | Stuk Verdriet",
    description: "Open gesprekken over rouw, verlies, kanker, herinneringen en verder leven met gemis.",
    url: "/podcast"
  }
};

export default async function PodcastPage({ searchParams }: PodcastPageProps) {
  const params = await searchParams;
  return <Onepager initialPanel="podcast" signupStatus={params?.signup ?? null} />;
}
