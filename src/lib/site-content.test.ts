import assert from "node:assert/strict";
import test from "node:test";
import { defaultSiteContent, normalizeSiteContent, normalizeSocialLinks, parseSiteContent } from "./site-content.ts";

test("normalizeSiteContent preserves defaults for missing content", () => {
  assert.deepEqual(normalizeSiteContent(undefined), defaultSiteContent);
});

test("normalizeSiteContent accepts copy and safe hero changes", () => {
  const content = normalizeSiteContent({
    hostsTitle: "  Ons team  ",
    heroSlides: [{ image: "https://demo.supabase.co/storage/v1/object/public/site-branding/hero.jpg", slogan: ["Regel een", "Regel twee"], enabled: false }]
  });
  assert.equal(content.hostsTitle, "Ons team");
  assert.equal(content.heroSlides[0].image, "https://demo.supabase.co/storage/v1/object/public/site-branding/hero.jpg");
  assert.deepEqual(content.heroSlides[0].slogan, ["Regel een", "Regel twee"]);
  assert.equal(content.heroSlides[0].enabled, false);
  assert.equal(content.heroSlides.length, 3);
});

test("normalizeSiteContent rejects unsafe image protocols and empty required copy", () => {
  const content = normalizeSiteContent({
    communityTitle: "   ",
    heroSlides: [{ image: "https://unsupported.example.com/hero.jpg" }]
  });
  assert.equal(content.communityTitle, defaultSiteContent.communityTitle);
  assert.equal(content.heroSlides[0].image, defaultSiteContent.heroSlides[0].image);
});

test("parseSiteContent safely handles malformed JSON", () => {
  assert.deepEqual(parseSiteContent("not json"), defaultSiteContent);
});

test("normalizeSocialLinks strips unrelated settings keys", () => {
  const links = normalizeSocialLinks({ instagram_url: " https://instagram.com/stukverdriet ", section_styles: { hero: {} } });
  assert.equal(links.instagram_url, "https://instagram.com/stukverdriet");
  assert.equal("section_styles" in links, false);
});

test("normalizeSocialLinks rejects unsafe and non-HTTPS links", () => {
  const links = normalizeSocialLinks({ facebook_url: "javascript:alert(1)", spotify_url: "http://example.com" });
  assert.equal(links.facebook_url, null);
  assert.equal(links.spotify_url, null);
});
