import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export function safeAuthNext(value: string | null) {
  return value === "/bijsluiter" || value === "/community" ? value : "/community";
}

export async function handleAuthRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeAuthNext(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { error: null };
    if (error) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=callback`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
