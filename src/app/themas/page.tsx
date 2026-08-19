import { Onepager } from "@/app/onepager";
import { getThemeArticleBySlug } from "@/lib/theme-articles";

type ThemasPageProps = {
  searchParams?: Promise<{ theme?: string }>;
};

export async function generateMetadata({ searchParams }: ThemasPageProps) {
  const params = await searchParams;
  const article = getThemeArticleBySlug(params?.theme);
  if (!article) {
    return {
      title: "Thema's",
      description: "Kies een thema dat past bij jouw vraag, moment of herinnering.",
      alternates: {
        canonical: "/themas"
      }
    };
  }

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

export default async function ThemasPage({ searchParams }: ThemasPageProps) {
  const params = await searchParams;
  return <Onepager initialPanel="themas" initialTheme={params?.theme ?? null} />;
}
