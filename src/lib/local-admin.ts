import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { safeAuthNext } from "@/lib/auth-redirect";

export const localAdminCookie = "stukverdriet-local-admin";
export const localAdminUser = "admin";
export const localAdminPassword = "admin123";
export const adminCredentialUsers = ["susan", "daniela"];
export const adminSessionCookie = "stukverdriet-admin-session";

const sessionMaxAge = 60 * 60 * 8;

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function adminSessionSecret() {
  const configuredSecret = process.env.ADMIN_SESSION_SECRET || process.env.STUK_VERDRIET_ROUTE_SECRET;
  if (configuredSecret) return configuredSecret;
  return process.env.NODE_ENV === "production" ? "" : `${localAdminPassword}:stukverdriet-admin-session`;
}

export function isLocalAdminEnabled() {
  return process.env.NODE_ENV !== "production";
}

export function isAdminPasswordLoginEnabled() {
  return Boolean(adminSessionSecret());
}

export function isValidAdminPassword(password: string) {
  return password === (adminPassword() || localAdminPassword);
}

export function isBuiltInAdminCredential(username: string, password: string) {
  return adminCredentialUsers.includes(username.trim().toLowerCase()) && password === localAdminPassword;
}

function sessionSecret() {
  return adminSessionSecret();
}

function signSessionPayload(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAdminSessionValue(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = String(Math.floor(Date.now() / 1000) + sessionMaxAge);
  const payload = `v1.${Buffer.from(normalizedEmail, "utf8").toString("base64url")}.${expiresAt}`;
  return `${payload}.${signSessionPayload(payload)}`;
}

export function verifyAdminSessionValue(value: string | undefined) {
  if (!value || !isAdminPasswordLoginEnabled()) return false;
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const payload = parts.slice(0, 3).join(".");
  const signature = parts[3];
  if (!constantTimeEqual(signature, signSessionPayload(payload))) return false;
  const expiresAt = Number(parts[2]);
  return Number.isFinite(expiresAt) && expiresAt > Math.floor(Date.now() / 1000);
}

export async function hasLocalAdminSession() {
  const cookieStore = await cookies();
  if (verifyAdminSessionValue(cookieStore.get(adminSessionCookie)?.value)) return true;
  return isLocalAdminEnabled() && cookieStore.get(localAdminCookie)?.value === "1";
}

export async function signOutLocalAdmin(formData?: FormData) {
  const next = safeAuthNext(String(formData?.get("next") ?? "/"));
  const cookieStore = await cookies();
  cookieStore.delete(localAdminCookie);
  cookieStore.delete(adminSessionCookie);
  redirect(next);
}

export const adminSessionMaxAge = sessionMaxAge;
