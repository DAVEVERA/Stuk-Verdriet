import { NextResponse, type NextRequest } from "next/server";
import { shouldExposeCommunity } from "@/lib/community-visibility";

export function middleware(request: NextRequest) {
  if (shouldExposeCommunity(request.nextUrl.hostname)) return NextResponse.next();

  return new NextResponse(null, {
    status: 404,
    headers: {
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

export const config = {
  matcher: ["/community", "/community/:path*"]
};
