import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const behaviorPath = resolve("src/components/community-post-body.ts");

test("a feed body only offers inline expansion when its clamped text really overflows", async () => {
  assert.equal(existsSync(behaviorPath), true, "community post body behavior is missing");
  const { communityPostBodyOverflows, getCommunityPostBodyViewState } = await import(
    pathToFileURL(behaviorPath).href
  );

  assert.equal(communityPostBodyOverflows(96, 96), false);
  assert.equal(communityPostBodyOverflows(97, 96), true);

  assert.deepEqual(getCommunityPostBodyViewState(false, false), {
    bodyClassName: "community-post-body",
    bodyExpandsOnClick: false,
    toggleLabel: "Lees meer",
    toggleVisible: false,
  });
  assert.deepEqual(getCommunityPostBodyViewState(true, false), {
    bodyClassName: "community-post-body is-clipped",
    bodyExpandsOnClick: true,
    toggleLabel: "Lees meer",
    toggleVisible: true,
  });
  assert.deepEqual(getCommunityPostBodyViewState(true, true), {
    bodyClassName: "community-post-body is-expanded",
    bodyExpandsOnClick: false,
    toggleLabel: "Toon minder",
    toggleVisible: true,
  });
});
