import { NextResponse } from "next/server";
import { safeAuthNext } from "@/lib/auth-redirect";
import { adminEmailList, createSupabasePublicClient, hasSupabaseEnv } from "@/lib/supabase";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const next = safeAuthNext(String(formData.get("next") ?? "/admin"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!emailPattern.test(email)) {
    return NextResponse.redirect(new URL("/admin?error=email", requestUrl.origin), 303);
  }

  if (!adminEmailList().includes(email)) {
    return NextResponse.redirect(new URL("/admin?sent=1", requestUrl.origin), 303);
  }

  if (!hasSupabaseEnv) {
    return NextResponse.redirect(new URL("/admin?error=missing-supabase", requestUrl.origin), 303);
  }

  const supabase = createSupabasePublicClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/admin?error=missing-supabase", requestUrl.origin), 303);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error) {
    return NextResponse.redirect(new URL("/admin?error=email-login", requestUrl.origin), 303);
  }

  return NextResponse.redirect(new URL("/admin?sent=1", requestUrl.origin), 303);
}
