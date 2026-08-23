import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminPage = readFileSync("src/app/admin/page.tsx", "utf8");
const dashboard = readFileSync("src/features/admin/AdminDashboard.tsx", "utf8");
const footer = readFileSync("src/components/ui.tsx", "utf8");
const proxy = readFileSync("src/proxy.ts", "utf8");

test("pending community replies are loaded, counted and actionable in the review inbox", () => {
  assert.match(adminPage, /from\("community_replies"\)[\s\S]*?eq\("status", "pending"\)/);
  assert.match(adminPage, /pendingCommunityReplies=\{normalizedPendingCommunityReplies\}/);
  assert.match(dashboard, /pendingCommunityReplies\.map\(\(reply\)/);
  assert.match(dashboard, /moderateCommunityReply\.bind\(null, reply\.id, "approved"\)/);
  assert.match(dashboard, /moderateCommunityReply\.bind\(null, reply\.id, "rejected"\)/);
  assert.match(dashboard, /pendingPosts\.length \+ pendingCommunityReplies\.length \+ pendingInterviewComments\.length \+ reports\.length/);
});

test("recent login activity has a status independent from the login count metrics", () => {
  assert.match(adminPage, /loginActivityState: recentLoginEvents\.error \? "error" as const : "verified" as const/);
  assert.match(adminPage, /loginActivityState=\{analyticsSnapshot\.loginActivityState\}/);
  assert.match(dashboard, /loginActivityState: AdminDataState/);
  assert.doesNotMatch(dashboard, /const loginActivityState = googleIntent\?\.state/);
});

test("shop surfaces and commerce queries stay out of the public and admin portals", () => {
  assert.doesNotMatch(adminPage, /getAdminShop|getAdminCustomers|getAdminOrders|getAdminReturns|getAdminReviews|getAdminLogisticsEvents|getAdminServiceQuestions/);
  assert.doesNotMatch(dashboard, /\["shop", "Shop"\]|activeTab === "shop"|ShopCommerceCenter|Aanmeldingen & shop/);
  assert.doesNotMatch(footer, /href="\/(?:shop|retourbeleid|herroepingsformulier|herroepen|levering-betaling|garantie-klachten|webshop-faq)"/);
  assert.match(proxy, /isHiddenShopPath\(request\.nextUrl\.pathname\)/);
  assert.match(proxy, /status: 404/);
});
