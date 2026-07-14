import { NextResponse } from "next/server";
import { safeAuthNext } from "@/lib/auth-redirect";
import { isLocalAdminEnabled, localAdminCookie, localAdminPassword, localAdminUser } from "@/lib/local-admin";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const next = safeAuthNext(String(formData.get("next") ?? "/admin"));

  if (!isLocalAdminEnabled()) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=local-disabled`, requestUrl.origin), 303);
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (username !== localAdminUser || password !== localAdminPassword) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=local-admin`, requestUrl.origin), 303);
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin), 303);
  response.cookies.set(localAdminCookie, "1", {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: false
  });
  return response;
}
