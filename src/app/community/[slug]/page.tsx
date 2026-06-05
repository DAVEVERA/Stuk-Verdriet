import { Onepager } from "@/app/onepager";
import { fallbackPosts } from "@/lib/fallback-data";

export function generateStaticParams() {
  return fallbackPosts.map((post) => ({ slug: post.slug }));
}

export default function CommunityPostPage() {
  return <Onepager initialPanel="community" />;
}
