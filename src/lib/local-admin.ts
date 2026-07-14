import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeAuthNext } from "@/lib/auth-redirect";

export const localAdminCookie = "stukverdriet-local-admin";
export const localAdminUser = "admin";
export const localAdminPassword = "admin123";

export function isLocalAdminEnabled() {
  return process.env.NODE_ENV !== "production";
}

export async function hasLocalAdminSession() {
  if (!isLocalAdminEnabled()) return false;
  const cookieStore = await cookies();
  return cookieStore.get(localAdminCookie)?.value === "1";
}

export async function signOutLocalAdmin(formData?: FormData) {
  const next = safeAuthNext(String(formData?.get("next") ?? "/"));
  const cookieStore = await cookies();
  cookieStore.delete(localAdminCookie);
  redirect(next);
}
