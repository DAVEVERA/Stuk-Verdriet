export type LoginIntent = "admin" | "community";

export function getLoginIntent(next: string): LoginIntent {
  return next === "/admin" ? "admin" : "community";
}
