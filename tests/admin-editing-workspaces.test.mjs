import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("site editor persists content that the homepage and community page render", async () => {
  const [editor, actions, onepager, community] = await Promise.all([
    read("src/features/admin/AdminSiteEditor.tsx"),
    read("src/lib/actions.ts"),
    read("src/app/onepager.tsx"),
    read("src/app/community/page.tsx")
  ]);

  assert.match(editor, /saveSiteContentSettings/);
  assert.match(editor, /Hero opslaan en publiceren/);
  assert.match(actions, /site_content: content/);
  assert.match(onepager, /slides=\{copy\.heroSlides\}/);
  assert.match(onepager, /copy\.communityTitle/);
  assert.match(community, /copy\.communityHeroLine1/);
  assert.match(community, /copy\.communityFeedTitle/);
});

test("admin workspaces receive persisted marketing, AI and community data", async () => {
  const [page, dashboard] = await Promise.all([
    read("src/app/admin/page.tsx"),
    read("src/features/admin/AdminDashboard.tsx")
  ]);

  assert.match(page, /recentPostsResult/);
  assert.match(page, /communityProfilesResult/);
  assert.match(page, /pulseMomentsResult/);
  assert.match(dashboard, /MarketingCalendar marketingItems=\{marketingItems\}/);
  assert.match(dashboard, /AIStudio aiSettings=\{aiSettings\} automations=\{automations\}/);
  assert.match(dashboard, /AdminCommunityManager posts=\{communityPosts\}/);
  assert.doesNotMatch(dashboard, /Automation blueprint/);
  assert.doesNotMatch(dashboard, /function ElementorBuilder/);
});
