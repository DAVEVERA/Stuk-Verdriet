import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { hasRouteAccess, isProtectedRoute, isShopRoute, routeAccessCookie } from "@/lib/route-password";
import { isHiddenShopPath } from "@/lib/shop-visibility";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function proxy(request: NextRequest) {
  if (isHiddenShopPath(request.nextUrl.pathname)) {
    return new NextResponse(null, {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" }
    });
  }

  const legacyRedirectUrl = process.env.LEGACY_SITE_REDIRECT_URL;
  if (legacyRedirectUrl) {
    const targetUrl = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, legacyRedirectUrl);
    return NextResponse.redirect(targetUrl, 308);
  }

  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (isProtectedRoute(request.nextUrl.pathname)) {
    if (isShopRoute(request.nextUrl.pathname)) {
      const hasAccess = await hasRouteAccess(request.cookies.get(routeAccessCookie)?.value);
      if (!hasAccess) {
        const loginUrl = new URL("/toegang", request.url);
        loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
        return redirectResponse;
      }
    } else if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
      return redirectResponse;
    }

    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|wav|mp3|m4a)$).*)"]
};
