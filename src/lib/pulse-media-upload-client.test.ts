import assert from "node:assert/strict";
import test from "node:test";

import {
  pulseResumableEndpoint,
  pulseUploadKindForFile,
  shouldUsePulseResumableUpload
} from "./pulse-media-upload-client.ts";

test("uses resumable upload only above the standard six megabyte boundary", () => {
  assert.equal(shouldUsePulseResumableUpload(6 * 1024 * 1024), false);
  assert.equal(shouldUsePulseResumableUpload(6 * 1024 * 1024 + 1), true);
});

test("derives the Supabase storage resumable endpoint from the configured project URL", () => {
  assert.equal(
    pulseResumableEndpoint("https://example-project.supabase.co"),
    "https://example-project.storage.supabase.co/storage/v1/upload/resumable"
  );
  assert.equal(pulseResumableEndpoint("https://example.com"), null);
});

test("maps supported browser files to their upload kind", () => {
  assert.equal(pulseUploadKindForFile({ type: "image/webp" }), "image");
  assert.equal(pulseUploadKindForFile({ type: "video/mp4" }), "video");
  assert.equal(pulseUploadKindForFile({ type: "audio/mpeg" }), "audio");
  assert.equal(pulseUploadKindForFile({ type: "application/pdf" }), null);
});
