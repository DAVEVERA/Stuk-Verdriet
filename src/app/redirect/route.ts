import { handleAuthRedirect } from "@/lib/auth-redirect";

export const dynamic = "force-static";

export async function GET(request: Request) {
  return handleAuthRedirect(request);
}
