import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { normalizeAdminRole, resolveAdminRole } from "@/lib/admin-access";
import type { AdminUserRole } from "@/types/content";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabasePublicClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always set cookies; middleware/actions can.
        }
      }
    }
  });
}

export async function createSupabaseRouteClient(response: NextResponse) {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          response.cookies.set(name, value, options);
        });
      }
    }
  });
}

export function createSupabaseAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function adminEmailList() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminRole(email: string): Promise<AdminUserRole | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const environmentWhitelisted = adminEmailList().includes(normalizedEmail);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return resolveAdminRole({ databaseRole: null, environmentWhitelisted });
  }

  const { data, error } = await admin
    .from("admin_users")
    .select("role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  const databaseRole = error ? null : normalizeAdminRole(data?.role);
  return resolveAdminRole({ databaseRole, environmentWhitelisted });
}

export async function isEmailAdmin(email: string): Promise<boolean> {
  return Boolean(await getAdminRole(email));
}
