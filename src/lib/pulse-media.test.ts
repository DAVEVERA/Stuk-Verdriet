import assert from "node:assert/strict";
import test from "node:test";

import {
  canUseLegacyPulseImageBucket,
  derivePulseTitle,
  isPulseComposerSchemaError,
  isMissingPulseMediaBucketError,
  pulseUploadObjectPath,
  sanitizePulseBackgroundStyle,
  sanitizePulseLayers,
  sanitizePulseMediaManifest,
  validatePulseUploadDescriptor
} from "./pulse-media.ts";

test("text is optional and no fallback overlay is manufactured", () => {
  assert.deepEqual(sanitizePulseLayers("", "fade"), []);
  assert.deepEqual(sanitizePulseLayers("[]", "fade"), []);
});

test("text controls keep safe alignment and font choices", () => {
  const layers = sanitizePulseLayers(JSON.stringify([{
    id: "quote",
    kind: "text",
    text: "  Je hoeft dit niet alleen te dragen.  ",
    x: 78,
    y: 93,
    size: 19,
    color: "#ffffff",
    rotation: 0,
    animation: "pulse",
    align: "right",
    fontFamily: "display"
  }]), "fade");

  assert.equal(layers.length, 1);
  assert.equal(layers[0]?.text, "Je hoeft dit niet alleen te dragen.");
  assert.equal(layers[0]?.align, "right");
  assert.equal(layers[0]?.fontFamily, "display");
});

test("media-only moments receive a private implementation title", () => {
  assert.equal(derivePulseTitle("", "", [], true), "Nieuw moment");
  assert.equal(derivePulseTitle(" Mijn avond ", "", [], true), "Mijn avond");
});

test("media manifest keeps safe provider and uploaded URLs and rejects blob URLs", () => {
  const manifest = sanitizePulseMediaManifest(JSON.stringify({
    layout: "grid",
    items: [
      { id: "one", type: "image", url: "https://images.unsplash.com/photo-1", cropX: 60, cropY: 40, zoom: 1.4, provider: "unsplash" },
      { id: "two", type: "gif", url: "https://media.giphy.com/media/demo/giphy.gif", provider: "giphy" },
      { id: "three", type: "image", url: "blob:http://localhost/private", provider: "upload" }
    ]
  }));

  assert.equal(manifest.layout, "grid");
  assert.equal(manifest.items.length, 2);
  assert.equal(manifest.items[0]?.cropX, 60);
  assert.equal(manifest.items[0]?.zoom, 1.4);
});

test("background styles are restricted to curated solids and gradients", () => {
  assert.equal(sanitizePulseBackgroundStyle("gradient-sage-dusk"), "gradient-sage-dusk");
  assert.equal(sanitizePulseBackgroundStyle("linear-gradient(red, blue)"), "solid-pine");
});

test("upload descriptors enforce media-specific type and size limits", () => {
  assert.deepEqual(
    validatePulseUploadDescriptor({ name: "avond.jpg", type: "image/jpeg", size: 2_000_000, kind: "image" }),
    { ok: true, extension: "jpg" }
  );
  assert.deepEqual(
    validatePulseUploadDescriptor({ name: "film.exe", type: "video/mp4", size: 2_000_000, kind: "video" }),
    { ok: false, error: "type" }
  );
  assert.deepEqual(
    validatePulseUploadDescriptor({ name: "film.mp4", type: "video/mp4", size: 50 * 1024 * 1024, kind: "video" }),
    { ok: true, extension: "mp4" }
  );
  assert.deepEqual(
    validatePulseUploadDescriptor({ name: "film.mp4", type: "video/mp4", size: 50 * 1024 * 1024 + 1, kind: "video" }),
    { ok: false, error: "size" }
  );
  assert.deepEqual(
    validatePulseUploadDescriptor({ name: "beeld.webp", type: "image/webp", size: 15 * 1024 * 1024, kind: "image" }),
    { ok: true, extension: "webp" }
  );
  assert.deepEqual(
    validatePulseUploadDescriptor({ name: "geluid.mp3", type: "audio/mpeg", size: 25 * 1024 * 1024, kind: "audio" }),
    { ok: true, extension: "mp3" }
  );
});

test("upload object paths stay in the authenticated user folder", () => {
  const path = pulseUploadObjectPath("user-123", "../../avond.jpg", "jpg", "token-1");
  assert.equal(path, "user-123/aan-de-pols/token-1-avond.jpg");
});

test("recognizes only missing Pulse composer columns as a safe legacy retry", () => {
  assert.equal(isPulseComposerSchemaError({ code: "PGRST204", message: "Could not find the 'media_manifest' column" }), true);
  assert.equal(isPulseComposerSchemaError({ code: "42703", message: "column background_style does not exist" }), true);
  assert.equal(isPulseComposerSchemaError({ code: "42501", message: "permission denied" }), false);
  assert.equal(isPulseComposerSchemaError({ code: "PGRST204", message: "Could not find another column" }), false);
});

test("legacy image storage fallback is narrow and only used for a missing bucket", () => {
  assert.equal(canUseLegacyPulseImageBucket({ type: "image/webp", size: 5 * 1024 * 1024, kind: "image" }), true);
  assert.equal(canUseLegacyPulseImageBucket({ type: "image/gif", size: 1_000, kind: "image" }), false);
  assert.equal(canUseLegacyPulseImageBucket({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1, kind: "image" }), false);
  assert.equal(canUseLegacyPulseImageBucket({ type: "video/mp4", size: 1_000, kind: "video" }), false);
  assert.equal(isMissingPulseMediaBucketError({ message: "Bucket not found", status: 400 }), true);
  assert.equal(isMissingPulseMediaBucketError({ message: "network error", status: 503 }), false);
});
