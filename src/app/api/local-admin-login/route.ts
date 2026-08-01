import { NextResponse } from "next/server";
import { safeAuthNext } from "@/lib/auth-redirect";
import { adminEmailList, isEmailAdmin } from "@/lib/supabase";
import {
  adminSessionCookie,
  adminSessionMaxAge,
  createAdminSessionValue,
  isBuiltInAdminCredential,
  isLocalAdminEnabled,
  isValidAdminPassword,
  localAdminCookie,
  localAdminPassword,
  localAdminUser
} from "@/lib/local-admin";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const next = safeAuthNext(String(formData.get("next") ?? "/admin"));
  const loginErrorUrl = (error: string) =>
    next === "/admin"
      ? new URL(`/admin?error=${encodeURIComponent(error)}`, requestUrl.origin)
      : new URL(`/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error)}`, requestUrl.origin);

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const isBuiltInAdmin = isBuiltInAdminCredential(username, password);
  const isDevFallback = isLocalAdminEnabled() && username === localAdminUser && password === localAdminPassword;
  const isDevPasswordLogin = isLocalAdminEnabled() && !process.env.ADMIN_PASSWORD && password === localAdminPassword;
  const adminAllowed = isBuiltInAdmin || isDevPasswordLogin || adminEmailList().includes(username) || (await isEmailAdmin(username));

  if (!isBuiltInAdmin && !isDevFallback && !isDevPasswordLogin && (!isValidAdminPassword(password) || !adminAllowed)) {
    return NextResponse.redirect(loginErrorUrl("local-admin"), 303);
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin), 303);
  if (isDevFallback) {
    response.cookies.set(localAdminCookie, "1", {
      httpOnly: true,
      maxAge: adminSessionMaxAge,
      path: "/",
      sameSite: "lax",
      secure: false
    });
  } else {
    response.cookies.set(adminSessionCookie, createAdminSessionValue(username), {
      httpOnly: true,
      maxAge: adminSessionMaxAge,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }
  return response;
}
