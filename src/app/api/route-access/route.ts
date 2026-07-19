import { NextResponse } from "next/server";
import { createRouteAccessToken, hasRoutePasswordConfigured, routeAccessCookie, safeProtectedNext, verifyRoutePassword } from "@/lib/route-password";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const next = safeProtectedNext(String(formData.get("next") ?? "/community"));
  const password = String(formData.get("password") ?? "");

  if (!hasRoutePasswordConfigured() || !(await verifyRoutePassword(password))) {
    return NextResponse.redirect(new URL(`/toegang?next=${encodeURIComponent(next)}&error=1`, requestUrl.origin), 303);
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin), 303);
  response.cookies.set(routeAccessCookie, await createRouteAccessToken(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return response;
}
