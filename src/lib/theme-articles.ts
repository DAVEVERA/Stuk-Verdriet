import fs from "node:fs";
import path from "node:path";
import type { ThemeArticle } from "@/types/content";
import { createSupabasePublicClient } from "@/lib/supabase";
import { parseIntroAndSections, recordToThemeArticle, type ThemeArticleRow } from "@/lib/theme-article-parse";

export { parseIntroAndSections, recordToThemeArticle };

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
  const { intro, sections } = parseIntroAndSections(contentLines.join("\n"));

  const seoLines = seoMarkdown.split("\n");
  const slug = readSeoField(seoLines, "URL slug").replace(/^\//, "") || fallback?.slug || "";

  return {
    slug,
    title,
    intro,
    sections,
    seo: {
      title: readSeoField(seoLines, "SEO titel") || fallback?.seoTitle || title,
      metaDescription: readSeoField(seoLines, "Meta description") || fallback?.metaDescription || "",
      slug: `/${slug}`,
      cardText: readSeoField(seoLines, "Kaarttekst") || fallback?.cardText || ""
    }
  };
}

/** Bundled markdown files — the fallback when the database is empty/unreachable. */
function getThemeArticlesFromFiles(): ThemeArticle[] {
  return themeArticleFiles.map((fileName) => {
    const markdown = fs.readFileSync(path.join(articlesDirectory, fileName), "utf8");
    return parseThemeArticle(markdown, themeArticleFallbacks[fileName]);
  });
}

/**
 * Published theme articles. Prefers the database (so the foundation can manage
 * them from the admin portal) and falls back to the bundled markdown files when
 * Supabase is unavailable or the table does not exist yet — the public site
 * therefore keeps working regardless of whether the migration has run.
 */
export async function getThemeArticles(): Promise<ThemeArticle[]> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return getThemeArticlesFromFiles();

  const { data, error } = await supabase
    .from("theme_articles")
    .select("slug, title, body_markdown, seo_title, meta_description, card_text")
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data) return getThemeArticlesFromFiles();
  return (data as ThemeArticleRow[]).map(recordToThemeArticle);
}

export async function getThemeArticleBySlug(slug: string | null | undefined): Promise<ThemeArticle | null> {
  if (!slug) return null;
  const normalized = slug.replace(/^\//, "");
  const articles = await getThemeArticles();
  return articles.find((article) => article.slug === normalized) ?? null;
}
