import { Onepager } from "@/app/onepager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Over Stuk Verdriet",
  description: "Lees wie er achter Stuk Verdriet staan en waarom deze podcast en community ruimte maken voor verhalen over rouw, verlies en herinneren.",
  alternates: {
    canonical: "/over"
  }
};

export default function OverPage() {
  return <Onepager initialPanel="over" />;
}
