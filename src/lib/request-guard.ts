import { headers } from "next/headers";

// Gedeelde server-side anti-abuse helpers voor alle publieke server actions.
// Dit bestand importeert next/headers en is daarmee uitsluitend server-side
// bruikbaar; importeren vanuit een client component faalt tijdens de build.
//
// LET OP: deze rate limiter houdt state in het geheugen van één server-instantie.
// Op Vercel (serverless) draaien meerdere instanties, dus dit is een eerste
// verdedigingslaag tegen spam/floods, geen harde garantie. De echte bescherming
// van bezoekersgegevens komt van Row Level Security in Supabase (leesrechten op
// e-mailtabellen liggen uitsluitend bij de service role). Voor sterkere limieten
// over instanties heen: verplaats deze state later naar een gedeelde store
// (bijv. een Supabase-tabel of Upstash Redis).

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Verbruikt één "token" voor de gegeven sleutel binnen het tijdvenster.
 * Retourneert false zodra de limiet binnen het venster is bereikt.
 */
export function consumeRateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);

  // Periodiek verlopen buckets opruimen zodat de map niet ongelimiteerd groeit.
  if (rateLimitBuckets.size > 5000) {
    for (const [bucketKey, bucket] of rateLimitBuckets) {
      if (bucket.resetAt <= now) rateLimitBuckets.delete(bucketKey);
    }
  }

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= max) return false;
  current.count += 1;
  return true;
}

export async function getRequestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";
}

/**
 * Controleert dat een POST/actie van dezelfde origin komt (CSRF-mitigatie).
 * Ontbreekt de Origin-header (sommige legitieme clients), dan laten we door.
 */
export async function assertSameOriginRequest() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (!origin) return true;
  return origin === (await getRequestOrigin());
}

export async function requestIpAddress() {
  const headerStore = await headers();
  // Vercel zet x-real-ip op het echte client-IP: één waarde die de client niet
  // zelf kan vervalsen. Daarom die eerst gebruiken. Pas als die ontbreekt vallen
  // we terug op de eerste X-Forwarded-For entry (let op: die is wél spoofbaar).
  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return (
    headerStore
      .get("x-forwarded-for")
      ?.split(",")
      .map((part) => part.trim())
      .find(Boolean) ??
    "unknown"
  );
}
