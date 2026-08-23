import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const mediaModulePath = resolve("src/lib/community-media.ts");

test("community image uploads have a tested 15 MB direct-upload contract", async () => {
  assert.equal(existsSync(mediaModulePath), true, "community-media.ts is missing");
  const media = await import(pathToFileURL(mediaModulePath).href);
  assert.equal(media.COMMUNITY_IMAGE_MAX_BYTES, 15 * 1024 * 1024);
  assert.deepEqual(
    media.validateCommunityImageDescriptor({ name: "foto.jpeg", type: "image/jpeg", size: 15 * 1024 * 1024 }),
    { ok: true, extension: "jpg" }
  );
  assert.deepEqual(
    media.validateCommunityImageDescriptor({ name: "foto.jpg", type: "image/jpeg", size: 15 * 1024 * 1024 + 1 }),
    { ok: false, error: "size" }
  );
  assert.deepEqual(
    media.validateCommunityImageDescriptor({ name: "foto.svg", type: "image/svg+xml", size: 10 }),
    { ok: false, error: "type" }
  );
});

test("community media paths are scoped to the authenticated user and purpose", async () => {
  assert.equal(existsSync(mediaModulePath), true, "community-media.ts is missing");
  const media = await import(pathToFileURL(mediaModulePath).href);
  const path = media.communityMediaObjectPath("user-123", "profile-avatar", "mijn foto.jpg", "jpg", "token-123");
  assert.match(path, /^user-123\/profile-avatar\/token-123-/);
  assert.equal(media.isOwnedCommunityMediaPath("user-123", "profile-avatar", path), true);
  assert.equal(media.isOwnedCommunityMediaPath("other-user", "profile-avatar", path), false);
  assert.equal(media.isOwnedCommunityMediaPath("user-123", "profile-cover", path), false);
  assert.equal(media.isOwnedCommunityMediaPath("user-123", "profile-avatar", "user-123/profile-avatar/../cover.jpg"), false);
});

test("magic-link login senders and login controls are removed", () => {
  const login = readFileSync("src/app/login/page.tsx", "utf8");
  const admin = readFileSync("src/app/admin/page.tsx", "utf8");
  const actions = readFileSync("src/lib/actions.ts", "utf8");
  const authRedirect = readFileSync("src/lib/auth-redirect.ts", "utf8");
  assert.doesNotMatch(login, /signInWithEmail|magic link|Magic link/i);
  assert.doesNotMatch(admin, /api\/admin\/magic-link|magic link/i);
  assert.doesNotMatch(actions, /signInWithOtp|export async function signInWithEmail/);
  assert.doesNotMatch(authRedirect, /verifyOtp|token_hash|access_token|magiclink/i);
  assert.equal(existsSync(resolve("src/app/api/admin/magic-link/route.ts")), false);
  assert.equal(existsSync(resolve("src/app/auth/session/route.ts")), false);
});

const moduleUrl = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
const mocks = {
  navigation: moduleUrl(`
    export function redirect(url) {
      const error = new Error("NEXT_REDIRECT");
      error.url = url;
      error.isRedirect = true;
      throw error;
    }
  `),
  cache: moduleUrl("export function revalidatePath() {}"),
  authRedirect: moduleUrl("export function encodeAuthNext(value) { return value; }"),
  sectionDesign: moduleUrl("export function normalizeSectionDesign(value) { return value; }"),
  requestGuard: moduleUrl(`
    export async function assertSameOriginRequest() { return true; }
    export async function consumeRateLimit() { return true; }
    export async function getRequestOrigin() { return "http://localhost"; }
    export async function requestIpAddress() { return "127.0.0.1"; }
  `),
  supabase: moduleUrl(`
    export function adminEmailList() { return []; }
    export function createSupabaseAdminClient() { return globalThis.__communityUploadMocks.admin; }
    export function createSupabasePublicClient() { return null; }
    export async function createSupabaseServerClient() { return globalThis.__communityUploadMocks.server; }
    export async function isEmailAdmin() { return false; }
  `),
  localAdmin: moduleUrl(`
    export async function hasLocalAdminSession() { return false; }
    export async function clearLocalAdminSession() {}
  `),
  pulse: moduleUrl("export function canUsePulseMoment() { return true; }"),
  push: moduleUrl("export async function sendPushToUser() {}")
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/navigation") return { url: mocks.navigation, shortCircuit: true };
    if (specifier === "next/cache") return { url: mocks.cache, shortCircuit: true };
    if (specifier === "next/headers") return nextResolve("next/headers.js", context);
    if (specifier === "next/server") return nextResolve("next/server.js", context);
    if (specifier === "@/lib/auth-redirect") return { url: mocks.authRedirect, shortCircuit: true };
    if (specifier === "@/lib/section-design") return { url: mocks.sectionDesign, shortCircuit: true };
    if (specifier === "@/lib/request-guard") return { url: mocks.requestGuard, shortCircuit: true };
    if (specifier === "@/lib/supabase") return { url: mocks.supabase, shortCircuit: true };
    if (specifier === "@/lib/local-admin") return { url: mocks.localAdmin, shortCircuit: true };
    if (specifier === "@/lib/pulse-moments") return { url: mocks.pulse, shortCircuit: true };
    if (specifier === "@/lib/push") return { url: mocks.push, shortCircuit: true };
    if (specifier.startsWith("@/")) return nextResolve(pathToFileURL(resolve("src", `${specifier.slice(2)}.ts`)).href, context);
    return nextResolve(specifier, context);
  }
});

globalThis.__communityUploadMocks = { admin: null, server: null };
const actions = await import("../src/lib/actions.ts");

test("profile media finalization rejects a path owned by another user before database writes", async () => {
  assert.equal(typeof actions.finalizeCommunityProfileMedia, "function");
  let databaseWrite = false;
  globalThis.__communityUploadMocks.server = {
    auth: { getUser: async () => ({ data: { user: { id: "user-123", email: "lid@example.test", user_metadata: {} } } }) }
  };
  globalThis.__communityUploadMocks.admin = {
    storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "https://example.test/photo.jpg" } }) }) },
    from() {
      databaseWrite = true;
      return {};
    }
  };
  const formData = new FormData();
  formData.set("return_to", "/community/profiel");
  formData.set("media_kind", "profile-avatar");
  formData.set("media_path", "other-user/profile-avatar/photo.jpg");
  await assert.rejects(
    actions.finalizeCommunityProfileMedia(formData),
    (error) => error?.isRedirect === true && error.url === "/community/profiel?error=invalid"
  );
  assert.equal(databaseWrite, false);
});
