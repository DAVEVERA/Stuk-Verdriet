import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { fallbackEpisodes, fallbackSeasons } from "@/lib/fallback-data";
import { getSiteDesignSettings } from "@/lib/content";
import { hasLocalAdminSession } from "@/lib/local-admin";
import { adminEmailList, createSupabaseAdminClient, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import type { PodcastEpisode, PodcastSeason } from "@/types/content";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PendingInterviewComment = {
  id: string;
  interview_id: string;
  author_name: string | null;
  author_display_type: string;
  body: string;
  created_at: string;
  status: string;
  interviews?: {
    title: string;
    slug: string;
  } | null;
};

type RawPendingInterviewComment = Omit<PendingInterviewComment, "interviews"> & {
  interviews?: PendingInterviewComment["interviews"] | PendingInterviewComment["interviews"][];
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const saved = Array.isArray(params.saved) ? params.saved[0] : params.saved;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const sent = Array.isArray(params.sent) ? params.sent[0] : params.sent;
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const server = await createSupabaseServerClient();
  const {
    data: { user }
  } = server ? await server.auth.getUser() : { data: { user: null } };
  const allowed = user?.email && adminEmailList().includes(user.email.toLowerCase());
  const localAdminAllowed = await hasLocalAdminSession();

  if (hasSupabaseEnv && !allowed && !localAdminAllowed) {
    return <AdminAccessGate sent={sent === "1"} error={error ?? null} signedInEmail={user?.email ?? null} />;
  }

  const admin = createSupabaseAdminClient();
  const sectionDesign = await getSiteDesignSettings();
  const [{ data: pendingPosts }, { data: reports }, { data: seasons }, { data: episodes }, { data: pendingInterviewComments }] = admin
    ? await Promise.all([
        admin.from("community_posts").select("id,title,category,created_at,status").eq("status", "pending").order("created_at", { ascending: false }),
        admin.from("community_reports").select("*").is("resolved_at", null).order("created_at", { ascending: false }),
        admin.from("podcast_seasons").select("*").order("season_number", { ascending: true }),
        admin.from("podcast_episodes").select("*").order("season_number", { ascending: true }).order("episode_number", { ascending: true }),
        admin
          .from("interview_comments")
          .select("id,interview_id,author_name,author_display_type,body,created_at,status,interviews(title,slug)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      ])
    : [{ data: [] }, { data: [] }, { data: fallbackSeasons }, { data: fallbackEpisodes }, { data: [] }];
  const normalizedPendingInterviewComments = ((pendingInterviewComments ?? []) as RawPendingInterviewComment[]).map((comment) => ({
    ...comment,
    interviews: Array.isArray(comment.interviews) ? (comment.interviews[0] ?? null) : (comment.interviews ?? null)
  }));

  return (
    <AdminDashboard
      episodes={(episodes ?? fallbackEpisodes) as PodcastEpisode[]}
      seasons={(seasons ?? fallbackSeasons) as PodcastSeason[]}
      pendingPosts={pendingPosts ?? []}
      reports={reports ?? []}
      pendingInterviewComments={normalizedPendingInterviewComments}
      sectionDesign={sectionDesign}
      missingSupabase={!hasSupabaseEnv}
      localPreview={localAdminAllowed && !allowed}
      savedMessage={saved ?? null}
      errorMessage={error ?? null}
      initialTab={tab ?? null}
    />
  );
}

function AdminAccessGate({
  sent,
  error,
  signedInEmail
}: {
  sent: boolean;
  error: string | null;
  signedInEmail: string | null;
}) {
  const messages: Record<string, string> = {
    callback: "De loginlink kon niet worden verwerkt. Vraag een nieuwe link aan.",
    email: "Vul een geldig e-mailadres in.",
    "email-login": "De magic link kon niet worden verzonden. Controleer Supabase Auth.",
    "missing-supabase": "Supabase Auth is nog niet geconfigureerd voor deze omgeving.",
    "rate-limited": "Er zijn te veel pogingen. Probeer het later opnieuw.",
    unauthorized: "Dit account heeft geen beheerrechten."
  };

  return (
    <section className="admin-access-page" aria-labelledby="admin-access-title">
      <div className="admin-access-panel">
        <p className="eyebrow">Stuk Verdriet beheer</p>
        <h1 id="admin-access-title">Beheeromgeving</h1>
        <p>
          Log in met het e-mailadres dat als beheerder is toegestaan. Je ontvangt een eenmalige magic link waarmee je
          direct terugkomt in het adminportaal.
        </p>

        <form className="admin-magic-link-form" action="/api/admin/magic-link" method="post">
          <input type="hidden" name="next" value="/admin" readOnly />
          <label>
            Beheer e-mailadres
            <input name="email" type="email" autoComplete="email" required placeholder="naam@domein.nl" />
          </label>
          <button className="button" type="submit">Stuur magic link</button>
        </form>

        {sent ? (
          <p className="notice">
            Als dit e-mailadres beheerrechten heeft, is er een loginlink verzonden. Controleer ook spam of ongewenste
            mail.
          </p>
        ) : null}
        {error ? <p className="notice">{messages[error] ?? "Inloggen lukte niet. Vraag een nieuwe link aan."}</p> : null}
        {signedInEmail ? (
          <p className="small-note">Je bent ingelogd als {signedInEmail}, maar dit account staat niet in `ADMIN_EMAILS`.</p>
        ) : null}
      </div>
    </section>
  );
}
