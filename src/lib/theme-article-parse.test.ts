import assert from "node:assert/strict";
import test from "node:test";
import { parseIntroAndSections, recordToThemeArticle } from "./theme-article-parse.ts";

test("parseIntroAndSections splits intro paragraphs from heading sections", () => {
  const { intro, sections } = parseIntroAndSections(
    [
      "Eerste inleidende alinea.",
      "",
      "Tweede inleidende alinea.",
      "",
      "## Wat is rouw",
      "Rouw komt in golven.",
      "- Geen vaste volgorde",
      "- Het heeft tijd nodig",
      "",
      "## Waar vind je steun",
      "Je hoeft het niet alleen te doen."
    ].join("\n")
  );

  assert.deepEqual(intro, ["Eerste inleidende alinea.", "Tweede inleidende alinea."]);
  assert.equal(sections.length, 2);
  assert.equal(sections[0].heading, "Wat is rouw");
  assert.deepEqual(sections[0].blocks[0], { type: "paragraph", content: "Rouw komt in golven." });
  assert.deepEqual(sections[0].blocks[1], { type: "list", items: ["Geen vaste volgorde", "Het heeft tijd nodig"] });
  assert.equal(sections[1].heading, "Waar vind je steun");
});

test("parseIntroAndSections handles content without any heading", () => {
  const { intro, sections } = parseIntroAndSections("Alleen een inleiding zonder kopjes.");
  assert.deepEqual(intro, ["Alleen een inleiding zonder kopjes."]);
  assert.deepEqual(sections, []);
});

test("recordToThemeArticle maps a database row to the public shape", () => {
  const article = recordToThemeArticle({
    slug: "rouw-algemeen",
    title: "Rouw algemeen",
    body_markdown: "Inleiding.\n\n## Een kopje\nTekst.",
    seo_title: "Rouw algemeen | Steun",
    meta_description: "Over rouw.",
    card_text: "Herkenning en steun."
  });

  assert.equal(article.slug, "rouw-algemeen");
  assert.equal(article.title, "Rouw algemeen");
  assert.deepEqual(article.intro, ["Inleiding."]);
  assert.equal(article.sections[0].heading, "Een kopje");
  assert.equal(article.seo.title, "Rouw algemeen | Steun");
  assert.equal(article.seo.slug, "/rouw-algemeen");
  assert.equal(article.seo.cardText, "Herkenning en steun.");
});

test("recordToThemeArticle falls back to title and strips a leading slash", () => {
  const article = recordToThemeArticle({
    slug: "/voor-ouders",
    title: "Voor ouders",
    body_markdown: null,
    seo_title: "   ",
    meta_description: null,
    card_text: null
  });

  assert.equal(article.slug, "voor-ouders");
  assert.equal(article.seo.slug, "/voor-ouders");
  assert.equal(article.seo.title, "Voor ouders");
  assert.equal(article.seo.metaDescription, "");
  assert.deepEqual(article.intro, []);
  assert.deepEqual(article.sections, []);
});
