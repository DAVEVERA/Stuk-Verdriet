import Link from "next/link";
import { notFound } from "next/navigation";
import { createCommunityReply, reportCommunityContent, reportPost, supportPost } from "@/lib/actions";
import { getApprovedCommunityPostBySlug, getApprovedCommunityReplies } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { AuthorDisplayType, CommunityReply } from "@/types/content";

type CommunityPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function CommunityPostPage({ params }: CommunityPostPageProps) {
  const { slug } = await params;
  const post = await getApprovedCommunityPostBySlug(slug);
  if (!post) notFound();

  const [replies, supabase] = await Promise.all([getApprovedCommunityReplies(post.id), createSupabaseServerClient()]);
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const isLoggedIn = Boolean(user);

  return (
    <main className="content-band community-detail-page">
      <Link className="text-link" href="/community">Terug naar community</Link>
      <article className="post-card community-detail-card">
        <p className="eyebrow">{post.category}</p>
        <h1>{post.title}</h1>
        <p>{post.body}</p>
        {post.resource_url ? (
          <a className="community-resource-link" href={post.resource_url} target="_blank" rel="noopener noreferrer">
            {post.resource_label ?? "Bekijk gedeelde link"}
          </a>
        ) : null}
        {post.tags?.length ? (
          <div className="community-tag-list" aria-label="Tags">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
        <div className="post-meta">
          <span>{displayAuthor(post.author_name, post.author_display_type)}</span>
          <span>{formatDate(post.created_at)}</span>
          <span>{post.reply_count} reacties</span>
          <span>{post.support_count} steun</span>
        </div>
      </article>

      <section className="community-replies" aria-labelledby="community-replies-title">
        <h2 id="community-replies-title">Reacties</h2>
        {replies.map((reply) => (
          <CommunityReplyCard key={reply.id} reply={reply} />
        ))}
      </section>

      {isLoggedIn ? (
        <section className="community-action-panel" aria-label="Reageren en steunen">
          <form className="form-grid story-form" action={createCommunityReply.bind(null, post.id)}>
            <label>
              Zichtbare naam
              <select name="author_display_type" defaultValue="first_name">
                <option value="first_name">Voornaam</option>
                <option value="real_name">Volledige naam</option>
                <option value="anonymous">Anoniem</option>
              </select>
            </label>
            <label>
              Reactie
              <textarea name="body" required />
            </label>
            <input type="hidden" name="return_to" value={`/community/${post.slug}`} readOnly />
            <button className="button" type="submit">Verstuur ter goedkeuring</button>
          </form>
          <div className="community-post-actions">
            <form action={supportPost.bind(null, post.id)}>
              <input type="hidden" name="return_to" value={`/community/${post.slug}`} readOnly />
              <button className="button" type="submit">Steun dit bericht</button>
            </form>
            <form action={reportPost.bind(null, post.id)}>
              <input type="hidden" name="return_to" value={`/community/${post.slug}`} readOnly />
              <input type="hidden" name="report_category" value="ongepast" readOnly />
              <input type="hidden" name="reason" value="Gemeld vanuit community detailpagina" readOnly />
              <button className="text-link" type="submit">Melden</button>
            </form>
          </div>
        </section>
      ) : (
        <div className="story-form login-required-panel">
          <p>Je kunt dit bericht en de reacties lezen zonder account. Log in om te reageren, steun te geven of iets te melden.</p>
          <Link className="button" href={`/login?next=${encodeURIComponent(`/community/${post.slug}`)}`}>
            Log in om te reageren
          </Link>
        </div>
      )}
    </main>
  );
}

function CommunityReplyCard({ reply }: { reply: CommunityReply }) {
  return (
    <article className="community-reply-card">
      <p>{reply.body}</p>
      <div className="post-meta">
        <span>{displayAuthor(reply.author_name, reply.author_display_type)}</span>
        <span>{formatDate(reply.created_at)}</span>
      </div>
      <details className="community-reply-action">
        <summary>Reageer</summary>
        <form className="form-grid story-form" action={createCommunityReply.bind(null, reply.post_id)}>
          <input type="hidden" name="return_to" value={`/community`} readOnly />
          <input type="hidden" name="parent_reply_id" value={reply.id} readOnly />
          <input type="hidden" name="author_display_type" value="first_name" readOnly />
          <textarea name="body" required placeholder="Schrijf een antwoord..." />
          <button className="button" type="submit">Antwoord ter goedkeuring</button>
        </form>
      </details>
      <form action={reportCommunityContent.bind(null, "reply", reply.id)}>
        <input type="hidden" name="return_to" value="/community" readOnly />
        <input type="hidden" name="report_category" value="taalgebruik" readOnly />
        <button className="text-link" type="submit">Reactie melden</button>
      </form>
      {reply.replies?.length ? (
        <div className="community-reply-children">
          {reply.replies.map((child) => (
            <CommunityReplyCard key={child.id} reply={child} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function displayAuthor(name: string | null, type: AuthorDisplayType) {
  if (type === "anonymous" || !name) return "Anoniem";
  if (type === "first_name") return name.split(" ")[0] ?? name;
  return name;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}
