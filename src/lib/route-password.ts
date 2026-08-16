export const routeAccessCookie = "stukverdriet-route-access";

const protectedPrefixes = ["/shop", "/community/profiel"];

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

export function isShopRoute(pathname: string) {
  return pathname === "/shop" || pathname.startsWith("/shop/");
}

export function safeProtectedNext(value: string | null) {
  if (!value) return "/shop";
  const normalized = value.startsWith("/") ? value : `/${value}`;
  if (isShopRoute(normalized)) return normalized;
  return "/shop";
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

export async function verifyRoutePassword(password: string) {
  const configured = routePassword();
  if (!configured) return false;
  return password === configured;
}
