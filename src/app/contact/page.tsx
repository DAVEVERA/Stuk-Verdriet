import { Onepager } from "@/app/onepager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met Stuk Verdriet over de podcast, de SNAAR-community, een persoonlijk verhaal of een samenwerking.",
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  return <Onepager initialPanel="contact" />;
}
