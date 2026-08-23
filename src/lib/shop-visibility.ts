const hiddenShopPrefixes = ["/shop", "/api/shop"] as const;

const hiddenShopPaths = new Set([
  "/toegang",
  "/api/route-access",
  "/webshop-faq",
  "/juridisch-memorandum-webshop",
  "/retourbeleid",
  "/herroepingsformulier",
  "/herroepen",
  "/levering-betaling",
  "/garantie-klachten"
]);

export function isHiddenShopPath(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return hiddenShopPaths.has(normalized)
    || hiddenShopPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}
