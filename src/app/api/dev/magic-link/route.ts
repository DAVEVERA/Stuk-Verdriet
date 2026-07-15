import { NextResponse } from "next/server";
import { encodeAuthNext, safeAuthNext } from "@/lib/auth-redirect";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function projectRefFromUrl(value: string | undefined) {
  try {
    return new URL(value ?? "").hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

async function getServiceRoleKey(projectRef: string) {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) return null;

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });

  if (!response.ok) return null;
  const keys = (await response.json()) as Array<{ name?: string; api_key?: string }>;
  return keys.find((key) => key.name === "service_role")?.api_key ?? null;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeAuthNext(String(formData.get("next") ?? "/community"));
  const requestUrl = new URL(request.url);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = projectRefFromUrl(supabaseUrl);

  if (!email || !email.includes("@") || !supabaseUrl || !projectRef) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=email`, requestUrl.origin), 303);
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? (await getServiceRoleKey(projectRef));
  if (!serviceRoleKey) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}&error=missing-supabase`, requestUrl.origin),
      303
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const redirectTo = new URL("/auth/callback", requestUrl.origin);
  redirectTo.searchParams.set("next", encodeAuthNext(next));

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: redirectTo.toString() }
  });

  if (error || !data.properties?.action_link) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&error=email-login`, requestUrl.origin), 303);
  }

  return NextResponse.redirect(data.properties.action_link, 303);
}
