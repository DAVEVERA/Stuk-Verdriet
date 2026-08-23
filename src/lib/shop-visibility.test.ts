import assert from "node:assert/strict";
import test from "node:test";
import { isHiddenShopPath } from "./shop-visibility.ts";

test("shop storefront, checkout and shop-only legal routes remain hidden", () => {
  for (const pathname of [
    "/shop",
    "/shop/product",
    "/api/shop/checkout",
    "/toegang",
    "/api/route-access",
    "/webshop-faq",
    "/juridisch-memorandum-webshop",
    "/retourbeleid",
    "/herroepingsformulier",
    "/herroepen",
    "/levering-betaling",
    "/garantie-klachten"
  ]) {
    assert.equal(isHiddenShopPath(pathname), true, pathname);
  }

  for (const pathname of ["/", "/admin", "/community", "/privacy", "/bedrijfsgegevens"]) {
    assert.equal(isHiddenShopPath(pathname), false, pathname);
  }
});
