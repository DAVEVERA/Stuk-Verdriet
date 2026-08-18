import { NextResponse } from "next/server";
import {
  buildPulseProviderRequest,
  buildUnsplashDownloadRequest,
  mapGiphyResults,
  mapIcons8Results,
  mapUnsplashResults,
  type PulseMediaProviderName
} from "@/lib/pulse-media-providers";
import { assertSameOriginRequest, consumeRateLimit, requestIpAddress } from "@/lib/request-guard";
import { createSupabaseServerClient } from "@/lib/supabase";

const providers = new Set<PulseMediaProviderName>(["unsplash", "giphy", "icons8"]);

function responseBody(provider: string, configured: boolean, message: string, results: unknown[] = []) {
  return { provider, configured, results, message };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedProvider = url.searchParams.get("provider")?.trim() ?? "";
  const query = url.searchParams.get("q")?.trim().replace(/\s+/g, " ").slice(0, 50) ?? "";
  if (!providers.has(requestedProvider as PulseMediaProviderName) || query.length < 2) {
    return NextResponse.json(
      responseBody(requestedProvider, false, "Kies een geldige mediabron en zoek met minimaal twee tekens."),
      { status: 400 }
    );
  }
  const provider = requestedProvider as PulseMediaProviderName;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!user) {
    return NextResponse.json(responseBody(provider, false, "Log in om gratis media te zoeken."), { status: 401 });
  }

  const ip = await requestIpAddress();
  if (!consumeRateLimit(`pulse-media:${user.id}:${ip}`, 60_000, 30)) {
    return NextResponse.json(responseBody(provider, true, "Je zoekt te snel. Probeer het over een minuut opnieuw."), { status: 429 });
  }

  const providerRequest = buildPulseProviderRequest(provider, query, {
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
    GIPHY_API_KEY: process.env.GIPHY_API_KEY,
    ICONS8_API_KEY: process.env.ICONS8_API_KEY
  });
  if (!providerRequest) {
    return NextResponse.json(
      responseBody(provider, false, "Deze mediabron is nog niet geconfigureerd."),
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  try {
    const upstream = await fetch(providerRequest.url, {
      headers: providerRequest.headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });
    if (!upstream.ok) {
      console.warn("Pulse media provider rejected a search request", { provider, status: upstream.status });
      return NextResponse.json(responseBody(provider, true, "De mediabron is tijdelijk niet bereikbaar."), { status: 502 });
    }

    const payload: unknown = await upstream.json();
    const results = provider === "unsplash"
      ? mapUnsplashResults(payload)
      : provider === "giphy"
        ? mapGiphyResults(payload)
        : mapIcons8Results(payload);

    return NextResponse.json(responseBody(provider, true, results.length ? "" : "Geen resultaten gevonden.", results), {
      headers: { "cache-control": "private, max-age=30" }
    });
  } catch (error) {
    console.warn("Pulse media provider search failed", {
      provider,
      reason: error instanceof Error ? error.name : "unknown"
    });
    return NextResponse.json(responseBody(provider, true, "De mediabron is tijdelijk niet bereikbaar."), { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!(await assertSameOriginRequest())) {
    return NextResponse.json({ error: "invalid-origin" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const ip = await requestIpAddress();
  if (!consumeRateLimit(`pulse-unsplash-download:${user.id}:${ip}`, 60_000, 30)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  const payload = await request.json().catch(() => null) as { downloadLocation?: unknown } | null;
  const providerRequest = buildUnsplashDownloadRequest(
    String(payload?.downloadLocation ?? "").slice(0, 1_200),
    process.env.UNSPLASH_ACCESS_KEY ?? ""
  );
  if (!providerRequest) return NextResponse.json({ error: "invalid-download" }, { status: 400 });

  try {
    const upstream = await fetch(providerRequest.url, {
      headers: providerRequest.headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });
    if (!upstream.ok) {
      console.warn("Unsplash download tracking was rejected", { status: upstream.status });
      return NextResponse.json({ error: "tracking" }, { status: 502 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.warn("Unsplash download tracking failed", {
      reason: error instanceof Error ? error.name : "unknown"
    });
    return NextResponse.json({ error: "tracking" }, { status: 502 });
  }
}
