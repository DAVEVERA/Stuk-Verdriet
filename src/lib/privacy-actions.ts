"use server";

import { redirect } from "next/navigation";
import { assertSameOriginRequest, consumeRateLimit, requestIpAddress } from "@/lib/request-guard";
import { createSupabaseAdminClient } from "@/lib/supabase";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const deleteWindowMs = 10 * 60 * 1000;
const deleteMax = 10; // verzoeken per 10 minuten per IP

// AVG-verwijdering: haalt een e-mailadres volledig uit beide mailinglijsten.
// Draait server-side met de service role (anon heeft geen lees-, laat staan
// verwijderrechten op deze tabellen). Het antwoord is altijd neutraal: we geven
// nooit prijs of het adres bij ons bekend was.
export async function requestDataDeletion(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);

  if (!(await assertSameOriginRequest())) redirect("/afmelden?status=invalid");
  if (!emailPattern.test(email)) redirect("/afmelden?status=invalid");

  const ip = await requestIpAddress();
  if (!consumeRateLimit(`delete:ip:${ip}`, deleteWindowMs, deleteMax)) {
    redirect("/afmelden?status=rate-limited");
  }

  const admin = createSupabaseAdminClient();
  if (admin) {
    try {
      await admin.from("episode_signups").delete().eq("email", email);
      await admin.from("interview_subscribers").delete().eq("email", email);
    } catch {
      // best-effort; hieronder tonen we altijd de neutrale uitkomst
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.warn("[afmelden] geen service-role client (lokaal): verwijdering overgeslagen");
  }

  redirect("/afmelden?status=done");
}
