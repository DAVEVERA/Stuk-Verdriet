import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { PageIntro } from "@/components/ui";
import { fallbackEpisodes, fallbackSeasons } from "@/lib/fallback-data";
import { getSiteDesignSettings } from "@/lib/content";
import { adminEmailList, createSupabaseAdminClient, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import type { PodcastEpisode, PodcastSeason } from "@/types/content";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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
  const [{ data: pendingPosts }, { data: reports }, { data: seasons }, { data: episodes }] = admin
    ? await Promise.all([
        admin.from("community_posts").select("id,title,category,created_at,status").eq("status", "pending").order("created_at", { ascending: false }),
        admin.from("community_reports").select("id,reason,created_at,post_id,resolved_at").is("resolved_at", null).order("created_at", { ascending: false }),
        admin.from("podcast_seasons").select("*").order("season_number", { ascending: true }),
        admin.from("podcast_episodes").select("*").order("season_number", { ascending: true }).order("episode_number", { ascending: true })
      ])
    : [{ data: [] }, { data: [] }, { data: fallbackSeasons }, { data: fallbackEpisodes }];

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
        sectionDesign={sectionDesign}
        missingSupabase={!hasSupabaseEnv}
        savedMessage={saved ?? null}
        errorMessage={error ?? null}
      />
    </>
  );
}
