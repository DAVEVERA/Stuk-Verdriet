import fs from "node:fs";
import path from "node:path";
import type { ThemeArticle, ThemeArticleBlock, ThemeArticleSection } from "@/types/content";

const themeArticleFiles = [
  "01-Rouw-algemeen.md",
  "02-Voor-ouders.md",
  "03-Voor-AYAs.md",
  "04-Naasten-en-familie.md",
  "05-Praktische-steun.md",
  "06-Vragen-en-antwoorden.md",
  "07-Verhalen-en-herkenning.md",
  "08-Podcast.md",
  "09-Hulp-en-ondersteuning.md",
  "10-Herinneren.md",
  "11-Leven-na-verlies.md",
  "12-Voor-de-omgeving.md"
] as const;

const themeArticleFallbacks: Partial<Record<(typeof themeArticleFiles)[number], {
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  cardText: string;
}>> = {
  "01-Rouw-algemeen.md": {
    title: "Rouw algemeen",
    slug: "rouw-algemeen",
    seoTitle: "Rouw algemeen | Herkenning en steun bij verlies",
    metaDescription: "Lees over rouw, verlies en verder leven. Vind herkenning, praktische houvast en ruimte voor alles wat gemis met je doet.",
    cardText: "Herkenning, uitleg en steun voor wie leeft met rouw en gemis."
  },
  "09-Hulp-en-ondersteuning.md": {
    title: "Hulp en ondersteuning",
    slug: "hulp-en-ondersteuning",
    seoTitle: "Hulp bij rouw en verlies | Luisterlijnen en ondersteuning",
    metaDescription: "Vind betrouwbare hulp bij rouw, verlies en kanker. Bekijk luisterlijnen, lotgenotencontact en organisaties waar je terechtkunt.",
    cardText: "Betrouwbare plekken voor een luisterend oor, begeleiding en lotgenotencontact."
  }
};

const articlesDirectory = path.join(process.cwd(), "assets", "StukVerdriet-Themas");

function pushParagraph(target: ThemeArticleBlock[], lines: string[]) {
  const content = lines.join(" ").trim();
  if (content) target.push({ type: "paragraph", content });
  lines.length = 0;
}

function parseBlocks(lines: string[]) {
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

function readSeoField(lines: string[], label: string) {
  const prefix = `${label}:`;
  const found = lines.find((line) => line.trim().startsWith(prefix));
  return found?.trim().slice(prefix.length).trim() ?? "";
}

function parseThemeArticle(
  markdown: string,
  fallback?: (typeof themeArticleFallbacks)[keyof typeof themeArticleFallbacks]
): ThemeArticle {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const [articleMarkdown, seoMarkdown = ""] = normalized.split(/\n## SEO\s*\n/);
  const articleLines = articleMarkdown.split("\n");
  const titleLine = articleLines.find((line) => line.startsWith("# "));
  const htmlTitle = articleMarkdown.match(/<h1>(.*?)<\/h1>/i)?.[1]?.trim();
  const title = titleLine?.replace(/^#\s+/, "").trim() || htmlTitle || fallback?.title || "Thema";

  const contentLines = articleLines.filter((line) => !line.startsWith("# ") && !/<h1>.*<\/h1>/i.test(line));
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

  for (const rawLine of contentLines) {
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

  const seoLines = seoMarkdown.split("\n");
  const slug = readSeoField(seoLines, "URL slug").replace(/^\//, "") || fallback?.slug || "";

  return {
    slug,
    title,
    intro: parseBlocks(introLines)
      .filter((block): block is Extract<ThemeArticleBlock, { type: "paragraph" }> => block.type === "paragraph")
      .map((block) => block.content),
    sections,
    seo: {
      title: readSeoField(seoLines, "SEO titel") || fallback?.seoTitle || title,
      metaDescription: readSeoField(seoLines, "Meta description") || fallback?.metaDescription || "",
      slug: `/${slug}`,
      cardText: readSeoField(seoLines, "Kaarttekst") || fallback?.cardText || ""
    }
  };
}

export function getThemeArticles(): ThemeArticle[] {
  return themeArticleFiles.map((fileName) => {
    const markdown = fs.readFileSync(path.join(articlesDirectory, fileName), "utf8");
    return parseThemeArticle(markdown, themeArticleFallbacks[fileName]);
  });
}

export function getThemeArticleBySlug(slug: string | null | undefined) {
  if (!slug) return null;
  return getThemeArticles().find((article) => article.slug === slug.replace(/^\//, "")) ?? null;
}
