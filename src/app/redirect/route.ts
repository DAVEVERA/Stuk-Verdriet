import { handleAuthRedirect } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleAuthRedirect(request);
}
