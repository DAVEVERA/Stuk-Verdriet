import { NextResponse } from "next/server";
import { safeAuthNext } from "@/lib/auth-redirect";
import { adminEmailList, isEmailAdmin } from "@/lib/supabase";
import {
  adminSessionCookie,
  adminSessionMaxAge,
  createAdminSessionValue,
  isAdminPasswordLoginEnabled,
  isBuiltInAdminCredential,
  isLocalAdminEnabled,
  isValidAdminPassword,
  localAdminCookie,
  localAdminPassword,
  localAdminUser
} from "@/lib/local-admin";
import { communityAccessCookie } from "@/lib/route-password";

type LoginAttempt = {
  count: number;
  resetAt: number;
};

const loginAttemptWindowMs = 10 * 60 * 1000;
const loginAttemptLimit = 5;
const globalLoginState = globalThis as typeof globalThis & {
  stukVerdrietAdminLoginAttempts?: Map<string, LoginAttempt>;
};
const loginAttempts = globalLoginState.stukVerdrietAdminLoginAttempts ?? new Map<string, LoginAttempt>();
globalLoginState.stukVerdrietAdminLoginAttempts = loginAttempts;

function loginAttemptKey(request: Request, username: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientAddress = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  return `${clientAddress}:${username || "missing"}`;
}

function isRateLimited(key: string) {
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;
  if (attempt.resetAt <= Date.now()) {
    loginAttempts.delete(key);
    return false;
  }
  return attempt.count >= loginAttemptLimit;
}

function recordFailedAttempt(key: string) {
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= Date.now()) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + loginAttemptWindowMs });
    return;
  }
  current.count += 1;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const next = safeAuthNext(String(formData.get("next") ?? "/admin"));
  const isCommunityEntrance = next === "/community" || next.startsWith("/community/");
  const loginErrorUrl = (error: string) =>
    next === "/admin"
      ? new URL(`/admin?error=${encodeURIComponent(error)}`, requestUrl.origin)
      : isCommunityEntrance
        ? new URL(`/toegang?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error)}`, requestUrl.origin)
      : new URL(`/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error)}`, requestUrl.origin);

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const attemptKey = loginAttemptKey(request, username);
  if (isRateLimited(attemptKey)) {
    return NextResponse.redirect(loginErrorUrl("rate-limited"), 303);
  }
  if (!isAdminPasswordLoginEnabled()) {
    return NextResponse.redirect(loginErrorUrl("missing-secret"), 303);
  }
  const isBuiltInAdmin = isBuiltInAdminCredential(username, password);
  const isDevFallback = isLocalAdminEnabled() && username === localAdminUser && password === localAdminPassword;
  const isDevPasswordLogin = isLocalAdminEnabled() && !process.env.ADMIN_PASSWORD && password === localAdminPassword;
  const adminAllowed = isBuiltInAdmin || isDevPasswordLogin || adminEmailList().includes(username) || (await isEmailAdmin(username));

  if (isCommunityEntrance && !isBuiltInAdmin) {
    recordFailedAttempt(attemptKey);
    return NextResponse.redirect(loginErrorUrl("local-admin"), 303);
  }

  if (!isBuiltInAdmin && !isDevFallback && !isDevPasswordLogin && (!isValidAdminPassword(password) || !adminAllowed)) {
    recordFailedAttempt(attemptKey);
    return NextResponse.redirect(loginErrorUrl("local-admin"), 303);
  }

  loginAttempts.delete(attemptKey);

  const response = NextResponse.redirect(new URL(next, requestUrl.origin), 303);
  let adminSessionValue = "";
  if (isDevFallback) {
    response.cookies.set(localAdminCookie, "1", {
      httpOnly: true,
      maxAge: adminSessionMaxAge,
      path: "/",
      sameSite: "lax",
      secure: false
    });
  } else {
    adminSessionValue = createAdminSessionValue(username);
    response.cookies.set(adminSessionCookie, adminSessionValue, {
      httpOnly: true,
      maxAge: adminSessionMaxAge,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }
  if (isCommunityEntrance) {
    response.cookies.set(communityAccessCookie, adminSessionValue, {
      httpOnly: true,
      maxAge: adminSessionMaxAge,
      path: "/community",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }
  return response;
}
