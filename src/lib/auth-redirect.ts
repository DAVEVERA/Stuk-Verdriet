import { NextResponse } from "next/server";
import { getLoginIntent } from "@/lib/login-intent";
import { createSupabaseAdminClient, createSupabaseRouteClient } from "@/lib/supabase";

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

function authErrorUrl(origin: string, next: string, error: string) {
  if (next === "/admin") {
    return new URL(`/admin?error=${encodeURIComponent(error)}`, origin);
  }

  return new URL(`/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error)}`, origin);
}

export async function handleAuthRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeAuthNext(requestUrl.searchParams.get("next"));
  const redirectResponse = NextResponse.redirect(new URL(next, requestUrl.origin), 303);

  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(authErrorUrl(requestUrl.origin, next, "callback"), 303);
  }

  const supabase = await createSupabaseRouteClient(redirectResponse);
  if (!supabase) {
    return NextResponse.redirect(authErrorUrl(requestUrl.origin, next, "missing-supabase"), 303);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth-callback] code exchange failed", { next, code: error.code });
    return NextResponse.redirect(authErrorUrl(requestUrl.origin, next, "callback"), 303);
  }

  if (data.user?.id) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { error: eventError } = await admin.from("auth_login_events").insert({
        user_id: data.user.id,
        intent: getLoginIntent(next)
      });

      if (eventError) {
        console.error("[auth-callback] login intent registration failed", { code: eventError.code });
      }
    }
  }

  return redirectResponse;
}
