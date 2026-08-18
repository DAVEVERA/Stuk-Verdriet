import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

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
  authRedirect: moduleUrl(`
    export function encodeAuthNext(value) { return value; }
    export function safeAuthNext(value) { return value; }
  `),
  sectionDesign: moduleUrl("export function normalizeSectionDesign(value) { return value; }"),
  requestGuard: moduleUrl(`
    export async function assertSameOriginRequest() { return true; }
    export async function consumeRateLimit() { return true; }
    export async function getRequestOrigin() { return "http://localhost"; }
    export async function requestIpAddress() { return "127.0.0.1"; }
  `),
  supabase: moduleUrl(`
    export function adminEmailList() { return []; }
    export function createSupabaseAdminClient() { return globalThis.__securityProfileMocks.admin; }
    export function createSupabasePublicClient() { return null; }
    export async function createSupabaseServerClient() { return globalThis.__securityProfileMocks.server; }
    export async function isEmailAdmin(email) { return globalThis.__securityProfileMocks.adminEmails.has(email); }
  `),
  localAdmin: moduleUrl(`
    export async function hasLocalAdminSession() { return globalThis.__securityProfileMocks.localAdmin; }
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
    if (specifier === "@/lib/local-admin" && context.parentURL?.endsWith("/actions.ts")) {
      return { url: mocks.localAdmin, shortCircuit: true };
    }
    if (specifier === "@/lib/pulse-moments") return { url: mocks.pulse, shortCircuit: true };
    if (specifier === "@/lib/push") return { url: mocks.push, shortCircuit: true };
    if (specifier.startsWith("@/")) {
      return nextResolve(pathToFileURL(resolve("src", `${specifier.slice(2)}.ts`)).href, context);
    }
    return nextResolve(specifier, context);
  }
});

globalThis.__securityProfileMocks = {
  admin: null,
  adminEmails: new Set(),
  localAdmin: false,
  server: null
};

const localAdmin = await import("../src/lib/local-admin.ts");
const actions = await import("../src/lib/actions.ts");
const localAdminRoute = await import("../src/app/api/local-admin-login/route.ts");

function withAdminEnvironment(values, callback) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function withAdminEnvironmentAsync(values, callback) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return await callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("predictable development credentials never enable admin password login", () => {
  withAdminEnvironment(
    { NODE_ENV: "development", ADMIN_PASSWORD: undefined, ADMIN_SESSION_SECRET: undefined, STUK_VERDRIET_ROUTE_SECRET: undefined },
    () => {
      assert.equal(localAdmin.isAdminPasswordLoginEnabled(), false);
      assert.equal(localAdmin.isValidAdminPassword("admin123"), false);
      assert.equal(localAdmin.isBuiltInAdminCredential("susan", "admin123"), false);
    }
  );
});

test("password login requires both an explicit password and a dedicated session secret", () => {
  withAdminEnvironment(
    {
      NODE_ENV: "development",
      ADMIN_PASSWORD: undefined,
      ADMIN_SESSION_SECRET: undefined,
      STUK_VERDRIET_ROUTE_SECRET: "unrelated-route-secret"
    },
    () => {
      assert.equal(localAdmin.isAdminPasswordLoginEnabled(), false);
      assert.throws(() => localAdmin.createAdminSessionValue("susan"), /not configured/);
    }
  );
  withAdminEnvironment(
    {
      NODE_ENV: "development",
      ADMIN_PASSWORD: "configured-password",
      ADMIN_SESSION_SECRET: "configured-session-secret",
      STUK_VERDRIET_ROUTE_SECRET: undefined
    },
    () => {
      assert.equal(localAdmin.isAdminPasswordLoginEnabled(), true);
      assert.equal(localAdmin.isBuiltInAdminCredential("susan", "configured-password"), true);
    }
  );
});

test("the login route rejects the old fallback and issues only a signed cookie for configured credentials", async () => {
  await withAdminEnvironmentAsync(
    { NODE_ENV: "development", ADMIN_PASSWORD: undefined, ADMIN_SESSION_SECRET: undefined, STUK_VERDRIET_ROUTE_SECRET: undefined },
    async () => {
      const rejectedForm = new FormData();
      rejectedForm.set("username", "susan");
      rejectedForm.set("password", "admin123");
      const rejected = await localAdminRoute.POST(new Request("http://localhost/api/local-admin-login", {
        method: "POST",
        body: rejectedForm
      }));
      assert.equal(rejected.status, 303);
      assert.match(rejected.headers.get("location") ?? "", /error=missing-secret/);
      assert.equal(rejected.headers.has("set-cookie"), false);
    }
  );

  await withAdminEnvironmentAsync(
    { NODE_ENV: "development", ADMIN_PASSWORD: "configured-password", ADMIN_SESSION_SECRET: "configured-session-secret" },
    async () => {
      const acceptedForm = new FormData();
      acceptedForm.set("username", "susan");
      acceptedForm.set("password", "configured-password");
      const accepted = await localAdminRoute.POST(new Request("http://localhost/api/local-admin-login", {
        method: "POST",
        body: acceptedForm
      }));
      const setCookie = accepted.headers.get("set-cookie") ?? "";
      assert.equal(accepted.status, 303);
      assert.match(setCookie, /stukverdriet-admin-session=/);
      assert.doesNotMatch(setCookie, /stukverdriet-local-admin=/);
    }
  );
});

test("a local preview session cannot authorize a service-role mutation", async () => {
  let writeAttempted = false;
  globalThis.__securityProfileMocks.localAdmin = true;
  globalThis.__securityProfileMocks.server = null;
  globalThis.__securityProfileMocks.admin = {
    from() {
      writeAttempted = true;
      return { update: () => ({ eq: async () => ({ error: null }) }) };
    }
  };

  await assert.rejects(
    actions.moderatePost("post-id", "approved"),
    (error) => error?.isRedirect === true && error.url === "/admin?error=unauthorized"
  );
  assert.equal(writeAttempted, false);
});

test("profile media storage exceptions become a controlled Dutch profile redirect", async () => {
  globalThis.__securityProfileMocks.localAdmin = false;
  globalThis.__securityProfileMocks.server = {
    auth: { getUser: async () => ({ data: { user: { id: "user-id", email: "lid@example.test", user_metadata: {} } } }) }
  };
  globalThis.__securityProfileMocks.admin = {
    storage: {
      from() {
        return {
          upload: async () => {
            throw new TypeError("fetch failed with token=do-not-log");
          },
          getPublicUrl: () => ({ data: { publicUrl: "https://example.test/avatar.jpg" } })
        };
      }
    }
  };
  const formData = new FormData();
  formData.set("return_to", "/community/profiel");
  formData.set("avatar_file", new File([new Uint8Array([1, 2, 3])], "avatar.jpg", { type: "image/jpeg" }));

  const originalConsoleError = console.error;
  const logged = [];
  console.error = (...values) => logged.push(values);
  try {
    await assert.rejects(
      actions.updateCommunityProfileMedia(formData),
      (error) => error?.isRedirect === true && error.url === "/community/profiel?error=profile-storage"
    );
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(logged.length, 1);
  assert.equal(JSON.stringify(logged).includes("do-not-log"), false);
});

test("profile media database exceptions become a controlled Dutch profile redirect", async () => {
  globalThis.__securityProfileMocks.server = {
    auth: { getUser: async () => ({ data: { user: { id: "user-id", email: "lid@example.test", user_metadata: {} } } }) }
  };
  globalThis.__securityProfileMocks.admin = {
    storage: {
      from() {
        return {
          upload: async () => ({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "https://example.test/cover.jpg" } })
        };
      }
    },
    from() {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => {
              throw new TypeError("database request failed with password=do-not-log");
            }
          })
        })
      };
    }
  };
  const formData = new FormData();
  formData.set("return_to", "/community/profiel");
  formData.set("cover_file", new File([new Uint8Array([1, 2, 3])], "cover.jpg", { type: "image/jpeg" }));

  const originalConsoleError = console.error;
  const logged = [];
  console.error = (...values) => logged.push(values);
  try {
    await assert.rejects(
      actions.updateCommunityProfileMedia(formData),
      (error) => error?.isRedirect === true && error.url === "/community/profiel?error=profile-storage"
    );
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(logged.length, 1);
  assert.equal(JSON.stringify(logged).includes("do-not-log"), false);
});

test("profile media database error results are logged safely and redirected", async () => {
  globalThis.__securityProfileMocks.server = {
    auth: { getUser: async () => ({ data: { user: { id: "user-id", email: "lid@example.test", user_metadata: {} } } }) }
  };
  let databaseCall = 0;
  globalThis.__securityProfileMocks.admin = {
    storage: {
      from() {
        return {
          upload: async () => ({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "https://example.test/cover.jpg" } })
        };
      }
    },
    from() {
      databaseCall += 1;
      if (databaseCall === 1) {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: { display_name: "Lid" }, error: null }) })
          })
        };
      }
      return {
        upsert: async () => ({ error: { code: "PGRST500", message: "password=do-not-log" } })
      };
    }
  };
  const formData = new FormData();
  formData.set("return_to", "/community/profiel");
  formData.set("cover_file", new File([new Uint8Array([1, 2, 3])], "cover.jpg", { type: "image/jpeg" }));

  const originalConsoleError = console.error;
  const logged = [];
  console.error = (...values) => logged.push(values);
  try {
    await assert.rejects(
      actions.updateCommunityProfileMedia(formData),
      (error) => error?.isRedirect === true && error.url === "/community/profiel?error=profile-storage"
    );
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(logged.length, 1);
  assert.match(JSON.stringify(logged), /PGRST500/);
  assert.equal(JSON.stringify(logged).includes("do-not-log"), false);
});
