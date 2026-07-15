import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

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

export async function handleAuthRedirect(request: Request) {
  const requestUrl = new URL(request.url);

  const next = safeAuthNext(requestUrl.searchParams.get("next"));

  // Magic link / email OTP confirm uses token_hash + type
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type"); // usually "email"
  const code = requestUrl.searchParams.get("code");

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=missing-supabase`, requestUrl.origin));
  }

  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: (type === "email" ? "email" : "email") // je kan dit ook strict maken
    });

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(next)}&error=callback`, requestUrl.origin)
      );
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(next)}&error=callback`, requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
