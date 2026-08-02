export const routeAccessCookie = "stukverdriet-route-access";
export const communityAccessCookie = "stukverdriet-community-access";

const protectedPrefixes = ["/shop", "/community"];

function routePassword() {
  return process.env.STUK_VERDRIET_ROUTE_PASSWORD ?? "";
}

function routeSecret() {
  return process.env.STUK_VERDRIET_ROUTE_SECRET ?? "stukverdriet-route-access-v1";
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function safeProtectedNext(value: string | null) {
  if (!value) return "/community";
  const normalized = value.startsWith("/") ? value : `/${value}`;
  if (isProtectedRoute(normalized)) return normalized;
  return "/community";
}

export function hasRoutePasswordConfigured() {
  return Boolean(routePassword());
}

export async function createRouteAccessToken() {
  const password = routePassword();
  if (!password) return "";
  return sha256(`${password}:${routeSecret()}`);
}

export async function hasRouteAccess(cookieValue?: string | null) {
  if (!cookieValue) return false;
  const token = await createRouteAccessToken();
  return Boolean(token && cookieValue === token);
}

function adminSessionSecret() {
  const configuredSecret = process.env.ADMIN_SESSION_SECRET || process.env.STUK_VERDRIET_ROUTE_SECRET;
  if (configuredSecret) return configuredSecret;
  return process.env.NODE_ENV === "production" ? "" : "admin123:stukverdriet-admin-session";
}

function base64UrlBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function hasCommunityAccess(cookieValue?: string | null) {
  if (!cookieValue) return false;
  const secret = adminSessionSecret();
  if (!secret) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;

  try {
    const username = new TextDecoder().decode(base64UrlBytes(parts[1])).trim().toLowerCase();
    if (username !== "susan" && username !== "daniela") return false;
  } catch {
    return false;
  }

  const expiresAt = Number(parts[2]);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

  try {
    const payload = parts.slice(0, 3).join(".");
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlBytes(parts[3]),
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}

export async function verifyRoutePassword(password: string) {
  const configured = routePassword();
  if (!configured) return false;
  return password === configured;
}
