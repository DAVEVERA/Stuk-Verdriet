import assert from "node:assert/strict";
import test from "node:test";
import { getLoginIntent } from "./login-intent.ts";

test("only the admin destination is registered as an admin login", () => {
  assert.equal(getLoginIntent("/admin"), "admin");
  assert.equal(getLoginIntent("/community"), "community");
  assert.equal(getLoginIntent("/community/profiel"), "community");
  assert.equal(getLoginIntent("/shop"), "community");
});
