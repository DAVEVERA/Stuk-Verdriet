import { NextResponse, type NextRequest } from "next/server";
import {
  communityAccessCookie,
  hasCommunityAccess,
  hasRouteAccess,
  isProtectedRoute,
  routeAccessCookie
} from "@/lib/route-password";

export async function middleware(request: NextRequest) {
  if (!isProtectedRoute(request.nextUrl.pathname)) return NextResponse.next();

  const isCommunityRoute =
    request.nextUrl.pathname === "/community" || request.nextUrl.pathname.startsWith("/community/");
  const hasAccess = isCommunityRoute
    ? await hasCommunityAccess(request.cookies.get(communityAccessCookie)?.value)
    : await hasRouteAccess(request.cookies.get(routeAccessCookie)?.value);

  if (hasAccess) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const loginUrl = new URL("/toegang", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(loginUrl);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/shop", "/shop/:path*", "/community", "/community/:path*"]
};
