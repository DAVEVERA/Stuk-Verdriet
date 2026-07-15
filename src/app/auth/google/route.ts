import { NextResponse } from "next/server";
import { encodeAuthNext, safeAuthNext } from "@/lib/auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeAuthNext(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}&error=missing-supabase`, requestUrl.origin),
      303
    );
  }

  const redirectTo = new URL("/auth/callback", requestUrl.origin);
  redirectTo.searchParams.set("next", encodeAuthNext(next));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectTo.toString() }
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=oauth`, requestUrl.origin), 303);
  }

  return NextResponse.redirect(data.url, 303);
}
