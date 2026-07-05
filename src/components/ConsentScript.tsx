"use client";

import Script from "next/script";
import { useCookieConsent } from "@/hooks/useCookieConsent";

type ConsentScriptProps = {
  id: string;
  src: string;
};

export function ConsentScript({ id, src }: ConsentScriptProps) {
  const consent = useCookieConsent();
  if (consent !== "all") return null;
  return <Script id={id} src={src} strategy="lazyOnload" />;
}
