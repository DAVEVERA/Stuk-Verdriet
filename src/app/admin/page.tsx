import { redirect } from "next/navigation";
import { PageIntro } from "@/components/ui";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { fallbackEpisodes, fallbackSeasons } from "@/lib/fallback-data";
import { getSiteDesignSettings } from "@/lib/content";
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
  const server = await createSupabaseServerClient();
  const {
    data: { user }
  } = server ? await server.auth.getUser() : { data: { user: null } };
  const allowed = user?.email && adminEmailList().includes(user.email.toLowerCase());

  if (hasSupabaseEnv && !allowed) redirect("/login");

  const admin = createSupabaseAdminClient();
  const sectionDesign = await getSiteDesignSettings();
  const [{ data: pendingPosts }, { data: reports }, { data: seasons }, { data: episodes }, { data: pendingInterviewComments }] = admin
    ? await Promise.all([
        admin.from("community_posts").select("id,title,category,created_at,status").eq("status", "pending").order("created_at", { ascending: false }),
        admin.from("community_reports").select("id,reason,created_at,post_id,resolved_at").is("resolved_at", null).order("created_at", { ascending: false }),
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
    <>
      <PageIntro eyebrow="Beheer" title="Podcast admin portaal">
        <p>Maak afleveringen, upload audio en covers, plan publicaties en beheer de cards en socials die op de site verschijnen.</p>
      </PageIntro>
      <AdminDashboard
        episodes={(episodes ?? fallbackEpisodes) as PodcastEpisode[]}
        seasons={(seasons ?? fallbackSeasons) as PodcastSeason[]}
        pendingPosts={pendingPosts ?? []}
        reports={reports ?? []}
        pendingInterviewComments={normalizedPendingInterviewComments}
        sectionDesign={sectionDesign}
        missingSupabase={!hasSupabaseEnv}
        savedMessage={saved ?? null}
        errorMessage={error ?? null}
      />
    </>
  );
}
