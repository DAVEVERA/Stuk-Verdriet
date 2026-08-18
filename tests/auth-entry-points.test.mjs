import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const moduleUrl = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
const mocks = {
  link: moduleUrl(`
    export default function Link({ children, prefetch, ...props }) {
      return globalThis.__authEntryReact.createElement("a", props, children);
    }
  `),
  image: moduleUrl(`
    export default function Image(props) {
      return globalThis.__authEntryReact.createElement("img", props);
    }
  `),
  adminDashboard: moduleUrl("export function AdminDashboard() { return null; }"),
  chatWidget: moduleUrl("export function CommunityChatWidget() { return null; }"),
  fallbackData: moduleUrl("export const fallbackEpisodes = []; export const fallbackSeasons = []; export const fallbackLegalDocuments = [];"),
  content: moduleUrl("export async function getSiteDesignSettings() { return {}; } export async function getSiteSettings() { return {}; }"),
  adminOperations: moduleUrl(`
    export async function getAdminCustomers() { return []; }
    export async function getAdminLogisticsEvents() { return []; }
    export async function getAdminOrders() { return []; }
    export async function getAdminReturns() { return []; }
    export async function getAdminReviews() { return []; }
    export async function getAdminServiceQuestions() { return []; }
    export async function getAdminUsers() { return []; }
    export async function getLegalDocuments() { return []; }
    export async function getAdminFaqs() { return []; }
    export async function getAdminHosts() { return []; }
    export async function getAdminMarketingItems() { return []; }
    export async function getAISettings() { return null; }
    export async function getAdminAutomations() { return []; }
  `),
  localAdmin: moduleUrl(`
    export async function hasLocalAdminSession() { return false; }
    export function isLocalAdminEnabled() { return false; }
  `),
  shop: moduleUrl(`
    export async function getAdminShopOrders() { return []; }
    export async function getAdminShopProducts() { return []; }
    export async function getAdminShopSettings() { return {}; }
  `),
  supabase: moduleUrl(`
    export const hasSupabaseEnv = true;
    export async function createSupabaseServerClient() {
      return { auth: { getUser: async () => ({ data: { user: null } }) } };
    }
    export async function isEmailAdmin() { return false; }
    export function createSupabaseAdminClient() { return null; }
  `)
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "react/jsx-runtime") {
      return { url: pathToFileURL(resolve("node_modules/react/jsx-runtime.js")).href, shortCircuit: true };
    }
    if (specifier === "next/link") return { url: mocks.link, shortCircuit: true };
    if (specifier === "next/image") return { url: mocks.image, shortCircuit: true };
    if (specifier === "@/features/admin/AdminDashboard") return { url: mocks.adminDashboard, shortCircuit: true };
    if (specifier === "@/components/CommunityChatWidget") return { url: mocks.chatWidget, shortCircuit: true };
    if (specifier === "@/lib/fallback-data") return { url: mocks.fallbackData, shortCircuit: true };
    if (specifier === "@/lib/content") return { url: mocks.content, shortCircuit: true };
    if (specifier === "@/lib/admin-operations") return { url: mocks.adminOperations, shortCircuit: true };
    if (specifier === "@/lib/local-admin") return { url: mocks.localAdmin, shortCircuit: true };
    if (specifier === "@/lib/shop") return { url: mocks.shop, shortCircuit: true };
    if (specifier === "@/lib/supabase") return { url: mocks.supabase, shortCircuit: true };
    return nextResolve(specifier, context);
  }
});

globalThis.__authEntryReact = await import("react");

async function importTsx(filePath) {
  const source = readFileSync(filePath, "utf8");
  const { outputText, diagnostics } = ts.transpileModule(source, {
    fileName: filePath,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  });
  const errors = diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error) ?? [];
  assert.deepEqual(errors, [], `TSX transform failed for ${filePath}`);
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

function assertAdminLoginOptions(markup) {
  assert.match(markup, /<a[^>]*href="\/auth\/google\?next=%2Fadmin"[^>]*>Verder met Google<\/a>/);
  assert.match(markup, /<form[^>]*action="\/api\/local-admin-login"[^>]*>/);
  assert.match(markup, /<input[^>]*name="username"/);
  assert.match(markup, /<input(?=[^>]*name="password")(?=[^>]*type="password")[^>]*>/);
  assert.doesNotMatch(markup, /api\/admin\/magic-link|auth\/session|type="email"/i);

  const formStart = markup.indexOf("<form");
  const formEnd = markup.indexOf("</form>", formStart);
  const googleLink = markup.indexOf("Verder met Google");
  assert.equal((markup.match(/<form/g) ?? []).length, 1);
  assert.ok(googleLink < formStart || googleLink > formEnd, "Google OAuth must be a navigation link outside the form");
}

test("the direct admin access gate offers Google OAuth and configured local admin login", async () => {
  const adminPage = await importTsx(resolve("src/app/admin/page.tsx"));
  const element = await adminPage.default({ searchParams: Promise.resolve({}) });
  assertAdminLoginOptions(renderToStaticMarkup(element));
});

test("/login?next=/admin offers Google OAuth and configured local admin login", async () => {
  const loginPage = await importTsx(resolve("src/app/login/page.tsx"));
  const element = await loginPage.default({ searchParams: Promise.resolve({ next: "/admin" }) });
  assertAdminLoginOptions(renderToStaticMarkup(element));
});
