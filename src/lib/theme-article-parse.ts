import type { ThemeArticle, ThemeArticleBlock, ThemeArticleSection } from "@/types/content";

// Pure parsing/mapping helpers for theme articles. This module intentionally has
// no runtime imports (only erased type imports) so it can be unit-tested with the
// plain node test runner, and is shared by both the file-based fallback and the
// database-backed records so every path renders identically.

function pushParagraph(target: ThemeArticleBlock[], lines: string[]) {
  const content = lines.join(" ").trim();
  if (content) target.push({ type: "paragraph", content });
  lines.length = 0;
}

export function parseBlocks(lines: string[]): ThemeArticleBlock[] {
  const blocks: ThemeArticleBlock[] = [];
  const paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      pushParagraph(blocks, paragraphLines);
      flushList();
      continue;
    }

    if (line.startsWith("- ")) {
      pushParagraph(blocks, paragraphLines);
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  pushParagraph(blocks, paragraphLines);
  flushList();
  return blocks;
}

/**
 * Parse a body markdown string (intro paragraphs followed by `## heading`
 * sections) into the structured intro/sections used throughout the site.
 */
export function parseIntroAndSections(markdown: string): {
  intro: string[];
  sections: ThemeArticleSection[];
} {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections: ThemeArticleSection[] = [];
  const introLines: string[] = [];
  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  function flushSection() {
    if (!currentHeading) return;
    sections.push({
      heading: currentHeading,
      blocks: parseBlocks(currentLines)
    });
    currentLines = [];
  }

  for (const rawLine of lines) {
    if (rawLine.startsWith("## ")) {
      if (currentHeading) {
        flushSection();
      } else {
        introLines.push(...currentLines);
        currentLines = [];
      }
      currentHeading = rawLine.replace(/^##\s+/, "").trim();
      continue;
    }
    currentLines.push(rawLine);
  }

  if (currentHeading) {
    flushSection();
  } else {
    introLines.push(...currentLines);
  }

  const intro = parseBlocks(introLines)
    .filter((block): block is Extract<ThemeArticleBlock, { type: "paragraph" }> => block.type === "paragraph")
    .map((block) => block.content);

  return { intro, sections };
}

export type ThemeArticleRow = {
  slug: string;
  title: string;
  body_markdown: string | null;
  seo_title: string | null;
  meta_description: string | null;
  card_text: string | null;
};

/** Build the public ThemeArticle shape from a database row. */
export function recordToThemeArticle(row: ThemeArticleRow): ThemeArticle {
  const { intro, sections } = parseIntroAndSections(row.body_markdown ?? "");
  const slug = row.slug.replace(/^\//, "");
  return {
    slug,
    title: row.title,
    intro,
    sections,
    seo: {
      title: row.seo_title?.trim() || row.title,
      metaDescription: row.meta_description?.trim() || "",
      slug: `/${slug}`,
      cardText: row.card_text?.trim() || ""
    }
  };
}
