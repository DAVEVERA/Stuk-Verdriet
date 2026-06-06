import { notFound } from "next/navigation";
import { Onepager } from "@/app/onepager";
import { getThemeArticleBySlug, getThemeArticles } from "@/lib/theme-articles";

type ThemeArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getThemeArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ThemeArticlePageProps) {
  const { slug } = await params;
  const article = getThemeArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.seo.title,
    description: article.seo.metaDescription,
    alternates: {
      canonical: `/themas/${article.slug}`
    },
    openGraph: {
      title: article.seo.title,
      description: article.seo.metaDescription,
      url: `/themas/${article.slug}`
    }
  };
}

export default async function ThemeArticlePage({ params }: ThemeArticlePageProps) {
  const { slug } = await params;
  const article = getThemeArticleBySlug(slug);
  if (!article) notFound();

  return <Onepager initialPanel="themas" initialTheme={article.slug} />;
}
