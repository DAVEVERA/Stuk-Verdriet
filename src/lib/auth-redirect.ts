import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseRouteClient } from "@/lib/supabase";

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return "";
  }
}

export function safeAuthNext(value: string | null) {
  if (!value) return "/community";
  const decoded = value.startsWith("b64:") ? decodeBase64Url(value.slice(4)) : value;
  const normalized = decoded.startsWith("/") ? decoded : `/${decoded}`;
  if (normalized === "/admin" || normalized === "/community" || normalized.startsWith("/community/")) {
    return normalized;
  }
  return "/community";
}

export function encodeAuthNext(value: string) {
  return `b64:${encodeBase64Url(safeAuthNext(value))}`;
}

function safeEmailOtpType(value: string | null): EmailOtpType {
  const allowed: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];
  return allowed.includes(value as EmailOtpType) ? (value as EmailOtpType) : "email";
}

export async function handleAuthRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeAuthNext(requestUrl.searchParams.get("next"));
  const redirectResponse = NextResponse.redirect(new URL(next, requestUrl.origin), 303);

  // Magic link / email OTP confirm uses token_hash + type.
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");

  const supabase = await createSupabaseRouteClient(redirectResponse);
  if (!supabase) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=missing-supabase`, requestUrl.origin), 303);
  }

  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: safeEmailOtpType(type)
    });

    if (error) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=callback`, requestUrl.origin), 303);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=callback`, requestUrl.origin), 303);
    }
  }

  return redirectResponse;
}
