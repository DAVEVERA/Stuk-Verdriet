import { Onepager } from "@/app/onepager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archief",
  alternates: {
    canonical: "/themas"
  },
  robots: {
    index: false,
    follow: true
  }
};

export default function ArchiefPage() {
  return <Onepager initialPanel="archief" />;
}
