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
  if (normalized === "/admin" || normalized === "/shop" || normalized === "/community" || normalized.startsWith("/community/")) {
    return normalized;
  }
  return "/community";
}

export function encodeAuthNext(value: string) {
  return `b64:${encodeBase64Url(safeAuthNext(value))}`;
}

function safeEmailOtpType(value: string | null): EmailOtpType {
  // Supabase deprecated "signup"/"magiclink" as verifyOtp types in favor of "email";
  // the value still arrives as "magiclink" in confirmation URLs, so it must be normalized here.
  if (value === "signup" || value === "magiclink") return "email";
  const allowed: EmailOtpType[] = ["invite", "recovery", "email_change", "email"];
  return allowed.includes(value as EmailOtpType) ? (value as EmailOtpType) : "email";
}

function authErrorUrl(origin: string, next: string, error: string) {
  if (next === "/admin") {
    return new URL(`/admin?error=${encodeURIComponent(error)}`, origin);
  }

  return new URL(`/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error)}`, origin);
}

function fragmentSessionBridge(next: string) {
  const callbackErrorPath = next === "/admin"
    ? `/admin?error=callback`
    : `/login?next=${encodeURIComponent(next)}&error=callback`;
  const html = `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Inloggen...</title>
  </head>
  <body>
    <p>Je wordt ingelogd...</p>
    <script>
      (async function () {
        var target = new URL(window.location.href);
        var next = ${JSON.stringify(next)};
        var hash = new URLSearchParams(window.location.hash.slice(1));
        var accessToken = hash.get("access_token");
        var refreshToken = hash.get("refresh_token");
        window.history.replaceState(null, "", target.pathname + target.search);

        if (!accessToken || !refreshToken) {
          window.location.replace(${JSON.stringify(callbackErrorPath)});
          return;
        }

        try {
          var response = await fetch("/auth/session", {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
              next: next
            })
          });
          var result = await response.json();
          if (!response.ok || !result.next) throw new Error("session");
          window.location.replace(result.next);
        } catch {
          window.location.replace(${JSON.stringify(callbackErrorPath)});
        }
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "no-referrer"
    }
  });
}

export async function handleAuthRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeAuthNext(requestUrl.searchParams.get("next"));
  const redirectResponse = NextResponse.redirect(new URL(next, requestUrl.origin), 303);

  // Magic link / email OTP confirm uses token_hash + type.
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");

  if (!token_hash && !code) {
    return fragmentSessionBridge(next);
  }

  const supabase = await createSupabaseRouteClient(redirectResponse);
  if (!supabase) {
    return NextResponse.redirect(authErrorUrl(requestUrl.origin, next, "missing-supabase"), 303);
  }

  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: safeEmailOtpType(type)
    });

    if (error) {
      console.error("[auth-callback] otp verification failed", { next, type, code: error.code });
      return NextResponse.redirect(authErrorUrl(requestUrl.origin, next, "callback"), 303);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth-callback] code exchange failed", { next, code: error.code });
      return NextResponse.redirect(authErrorUrl(requestUrl.origin, next, "callback"), 303);
    }
  }

  return redirectResponse;
}
