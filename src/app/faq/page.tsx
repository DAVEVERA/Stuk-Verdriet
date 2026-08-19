import { Onepager } from "@/app/onepager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thema's",
  alternates: {
    canonical: "/themas"
  },
  robots: {
    index: false,
    follow: true
  }
};

export default function FaqPage() {
  return <Onepager initialPanel="themas" />;
}
