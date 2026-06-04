import { notFound } from "next/navigation";
import { createCommunityReply, reportPost, supportPost } from "@/lib/actions";
import { PageIntro } from "@/components/ui";
import { getApprovedCommunityPosts, getCommunityPostBySlug } from "@/lib/content";

export async function generateStaticParams() {
  const posts = await getApprovedCommunityPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function CommunityPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getCommunityPostBySlug(slug);
  if (!post) notFound();
  const supportAction = supportPost.bind(null, post.id);
  const reportAction = reportPost.bind(null, post.id);
  const replyAction = createCommunityReply.bind(null, post.id);

  return (
    <>
      <PageIntro eyebrow={post.category} title={post.title}>
        <p>{post.body}</p>
      </PageIntro>
      <section className="content-band">
        <form action={supportAction}>
          <button className="button" type="submit">
            Steun
          </button>
        </form>
        <form className="form-grid" action={replyAction}>
          <h2>Reageer</h2>
          <select name="author_display_type" defaultValue="first_name">
            <option value="first_name">Voornaam</option>
            <option value="real_name">Volledige naam</option>
            <option value="anonymous">Anoniem</option>
          </select>
          <textarea name="body" required />
          <button className="button" type="submit">
            Plaats reactie
          </button>
        </form>
        <form className="form-grid" action={reportAction}>
          <h2>Meld dit bericht</h2>
          <input name="reason" placeholder="Reden" />
          <button className="text-link" type="submit">
            Melden
          </button>
        </form>
      </section>
    </>
  );
}
