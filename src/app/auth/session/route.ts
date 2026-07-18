import { NextResponse } from "next/server";
import { safeAuthNext } from "@/lib/auth-redirect";
import { createSupabaseRouteClient } from "@/lib/supabase";

type SessionPayload = {
  access_token?: unknown;
  refresh_token?: unknown;
  next?: unknown;
};

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");

  if (origin && origin !== requestUrl.origin) {
    return NextResponse.json({ error: "invalid-origin" }, { status: 403 });
  }

  let payload: SessionPayload;
  try {
    payload = (await request.json()) as SessionPayload;
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const accessToken = typeof payload.access_token === "string" ? payload.access_token : "";
  const refreshToken = typeof payload.refresh_token === "string" ? payload.refresh_token : "";
  const next = safeAuthNext(typeof payload.next === "string" ? payload.next : null);

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "missing-session" }, { status: 400 });
  }

  const response = NextResponse.json({ next });
  const supabase = await createSupabaseRouteClient(response);
  if (!supabase) {
    return NextResponse.json({ error: "missing-supabase" }, { status: 503 });
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (error) {
    return NextResponse.json({ error: "invalid-session" }, { status: 401 });
  }

  return response;
}
