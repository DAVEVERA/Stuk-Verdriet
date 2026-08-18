import assert from "node:assert/strict";
import test from "node:test";

import {
  beginPulsePointerSession,
  cancelPulsePointerSession,
  finishPulsePointerSession
} from "./communityPulseViewerGestures.ts";

test("a touch swipe restores playback after navigating", () => {
  const session = beginPulsePointerSession(7, "touch", 280, false);

  assert.deepEqual(finishPulsePointerSession(session, 7, 180), {
    navigationDelta: 1,
    paused: false
  });
});

test("a touch swipe preserves a manual pause", () => {
  const session = beginPulsePointerSession(8, "touch", 120, true);

  assert.deepEqual(finishPulsePointerSession(session, 8, 220), {
    navigationDelta: -1,
    paused: true
  });
});

test("a tap restores the playback state from before the pointer gesture", () => {
  const playing = beginPulsePointerSession(9, "touch", 160, false);
  const paused = beginPulsePointerSession(10, "mouse", 160, true);

  assert.equal(finishPulsePointerSession(playing, 9, 170)?.paused, false);
  assert.equal(finishPulsePointerSession(paused, 10, 170)?.paused, true);
});

test("cancel and unrelated pointer events do not invent a playback state", () => {
  const session = beginPulsePointerSession(11, "touch", 200, true);

  assert.equal(cancelPulsePointerSession(session, 12), null);
  assert.equal(finishPulsePointerSession(session, 12, 100), null);
  assert.equal(cancelPulsePointerSession(session, 11), true);
});
