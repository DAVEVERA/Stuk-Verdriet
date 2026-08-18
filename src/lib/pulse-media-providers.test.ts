import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPulseProviderRequest,
  buildUnsplashDownloadRequest,
  mapGiphyResults,
  mapIcons8Results,
  mapUnsplashResults
} from "./pulse-media-providers.ts";

test("provider requests require their own configured key", () => {
  assert.equal(buildPulseProviderRequest("unsplash", "rust", {}), null);
  assert.equal(buildPulseProviderRequest("giphy", "troost", {}), null);
  assert.equal(buildPulseProviderRequest("icons8", "hart", {}), null);
});

test("provider request URLs encode the exact bounded query", () => {
  const request = buildPulseProviderRequest("giphy", "een hart & rust", { GIPHY_API_KEY: "test-key" });
  assert.ok(request);
  const url = new URL(request.url);
  assert.equal(url.searchParams.get("q"), "een hart & rust");
  assert.equal(url.searchParams.get("rating"), "g");
  assert.equal(url.searchParams.get("limit"), "12");
});

test("Unsplash mapping preserves attribution and download tracking URL", () => {
  const results = mapUnsplashResults({ results: [{
    id: "photo-1",
    alt_description: "Stille zee",
    urls: { regular: "https://images.unsplash.com/photo-1", small: "https://images.unsplash.com/photo-1-small" },
    links: { html: "https://unsplash.com/photos/photo-1", download_location: "https://api.unsplash.com/photos/photo-1/download" },
    user: { name: "Fotograaf", links: { html: "https://unsplash.com/@fotograaf" } }
  }] });

  assert.equal(results[0]?.type, "image");
  assert.equal(results[0]?.attribution.name, "Fotograaf");
  assert.equal(results[0]?.downloadLocation, "https://api.unsplash.com/photos/photo-1/download");
});

test("GIPHY and Icons8 mappings provide mandatory attribution labels", () => {
  const gifs = mapGiphyResults({ data: [{ id: "gif-1", title: "Steun", images: { fixed_width: { url: "https://media.giphy.com/a.gif" }, fixed_width_small: { url: "https://media.giphy.com/a-small.gif" } } }] });
  const icons = mapIcons8Results({ icons: [{ id: "icon-1", name: "heart", previewUrl: "https://img.icons8.com/heart.png" }] });
  assert.equal(gifs[0]?.attribution.label, "Powered by GIPHY");
  assert.equal(icons[0]?.attribution.label, "Icons8");
});

test("Unsplash download tracking only accepts its exact API host and route", () => {
  const request = buildUnsplashDownloadRequest(
    "https://api.unsplash.com/photos/photo-1/download?ixid=tracking",
    "secret-key"
  );
  assert.ok(request);
  assert.equal(request.headers.Authorization, "Client-ID secret-key");
  assert.equal(buildUnsplashDownloadRequest("https://evil.example/photos/photo-1/download", "secret-key"), null);
  assert.equal(buildUnsplashDownloadRequest("https://api.unsplash.com/search/photos", "secret-key"), null);
  assert.equal(buildUnsplashDownloadRequest("https://api.unsplash.com/photos/photo-1/download", ""), null);
});
