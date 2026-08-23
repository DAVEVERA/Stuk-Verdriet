import Link from "next/link";
import type { Metadata } from "next";
import type { User } from "@supabase/supabase-js";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { fallbackEpisodes, fallbackSeasons, fallbackLegalDocuments } from "@/lib/fallback-data";
import { canAccessAdminPortal } from "@/lib/admin-access";
import { getSiteDesignSettings, getSiteSettings } from "@/lib/content";
import { getAdminUsersWithStatus, getLegalDocuments, getAdminFaqs, getAdminHosts, getAdminMarketingItems, getAISettings, getAdminAutomations } from "@/lib/admin-operations";
import { hasLocalAdminSession, isLocalAdminEnabled } from "@/lib/local-admin";
import { buildRegistrationAnalyticsRows, getAmsterdamDayRange, summarizeAuthUsers, type AuthUserTiming } from "@/lib/registration-analytics";
import { getAdminRole, createSupabaseAdminClient, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import type { AdminAnalyticsRow, AdminAnalyticsSource, AdminDataState, AdminIdentity, AdminLoginActivity } from "@/features/admin/AdminDashboard";
import type { CommunityPost, CommunityProfile, CommunityPulseMoment, CommunityReply, PodcastEpisode, PodcastSeason } from "@/types/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beheer",
  robots: {
    index: false,
    follow: false
  }
};

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

type PendingCommunityPost = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  status: string;
};

type OpenCommunityReport = {
  id: string;
  reason: string;
  created_at: string;
  post_id: string | null;
  reply_id?: string | null;
  status?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  category?: string | null;
  details?: string | null;
  resolved_at?: string | null;
};

type PendingCommunityReply = {
  id: string;
  post_id: string;
  author_name: string | null;
  author_display_type: string;
  body: string;
  created_at: string;
  status: string;
  community_posts?: {
    title: string;
    slug: string;
  } | null;
};

type RawPendingCommunityReply = Omit<PendingCommunityReply, "community_posts"> & {
  community_posts?: PendingCommunityReply["community_posts"] | PendingCommunityReply["community_posts"][];
};

function getAdminDisplayName(user: User | null, localAdminAllowed: boolean) {
  if (!user) return localAdminAllowed ? "Lokale beheerder" : "Beheerder";
  const metadata = user.user_metadata as Record<string, unknown>;
  const candidate = metadata.full_name ?? metadata.name ?? metadata.display_name;
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return user.email?.split("@")[0] || "Beheerder";
}

function getAdminProvider(user: User | null, localAdminAllowed: boolean) {
  if (!user) return localAdminAllowed ? "Lokaal" : "Onbekend";
  const provider = user.app_metadata?.provider;
  return typeof provider === "string" && provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Google";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const saved = Array.isArray(params.saved) ? params.saved[0] : params.saved;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const server = await createSupabaseServerClient();
  const {
    data: { user }
  } = server ? await server.auth.getUser() : { data: { user: null } };
  const adminRole = user?.email ? await getAdminRole(user.email) : null;
  const localAdminAllowed = await hasLocalAdminSession();
  const hasGoogleAdminSession = Boolean(adminRole);

  if (!canAccessAdminPortal(adminRole, localAdminAllowed)) {
    return <AdminAccessGate error={error ?? null} signedInEmail={user?.email ?? null} />;
  }

  const admin = createSupabaseAdminClient();
  const sectionDesign = await getSiteDesignSettings();
  const siteSettings = await getSiteSettings();
  const [
    pendingPostsResult,
    pendingCommunityRepliesResult,
    reportsResult,
    seasonsResult,
    episodesResult,
    pendingInterviewCommentsResult,
    recentPostsResult,
    recentRepliesResult,
    communityProfilesResult,
    pulseMomentsResult
  ] = admin
    ? await Promise.all([
        admin.from("community_posts").select("id,title,category,created_at,status").eq("status", "pending").order("created_at", { ascending: false }),
        admin
          .from("community_replies")
          .select("id,post_id,author_name,author_display_type,body,created_at,status,community_posts(title,slug)")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        admin.from("community_reports").select("*").is("resolved_at", null).order("created_at", { ascending: false }),
        admin.from("podcast_seasons").select("*").order("season_number", { ascending: true }),
        admin.from("podcast_episodes").select("*").order("season_number", { ascending: true }).order("episode_number", { ascending: true }),
        admin
          .from("interview_comments")
          .select("id,interview_id,author_name,author_display_type,body,created_at,status,interviews(title,slug)")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        admin.from("community_posts").select("*").order("created_at", { ascending: false }).limit(50),
        admin.from("community_replies").select("*").order("created_at", { ascending: false }).limit(50),
        admin.from("community_profiles").select("*").order("created_at", { ascending: false }).limit(50),
        admin.from("community_pulse_moments").select("*").order("created_at", { ascending: false }).limit(50)
      ])
    : [
        { data: [] },
        { data: [] },
        { data: [] },
        { data: fallbackSeasons },
        { data: fallbackEpisodes },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] }
      ];
  const pendingPosts = pendingPostsResult.data;
  const pendingCommunityReplies = pendingCommunityRepliesResult.data;
  const reports = reportsResult.data;
  const seasons = seasonsResult.data;
  const episodes = episodesResult.data;
  const pendingInterviewComments = pendingInterviewCommentsResult.data;
  const communityDataError = [recentPostsResult, recentRepliesResult, communityProfilesResult, pulseMomentsResult]
    .map((result) => "error" in result ? result.error?.message : null)
    .filter(Boolean)
    .join(" · ") || null;
  const normalizedPendingInterviewComments = ((pendingInterviewComments ?? []) as RawPendingInterviewComment[]).map((comment) => ({
    ...comment,
    interviews: Array.isArray(comment.interviews) ? (comment.interviews[0] ?? null) : (comment.interviews ?? null)
  }));
  const normalizedPendingCommunityReplies = ((pendingCommunityReplies ?? []) as RawPendingCommunityReply[]).map((reply) => ({
    ...reply,
    community_posts: Array.isArray(reply.community_posts) ? (reply.community_posts[0] ?? null) : (reply.community_posts ?? null)
  }));
  const analyticsSnapshot = admin
    ? await getSupabaseAnalyticsRows(admin, {
        episodes: ((episodes ?? []) as PodcastEpisode[]),
        pendingPosts: pendingPosts ?? [],
        pendingCommunityReplies: normalizedPendingCommunityReplies,
        reports: reports ?? [],
        pendingInterviewComments: normalizedPendingInterviewComments
      })
    : { rows: [] as AdminAnalyticsRow[], loginActivity: [] as AdminLoginActivity[], loginActivityState: "unknown" as const };
  const analyticsRows = analyticsSnapshot.rows;
  const analyticsSources = getAnalyticsSources(Boolean(admin));

  const adminUsersResult = admin && hasGoogleAdminSession
    ? await getAdminUsersWithStatus()
    : {
        users: [],
        error: admin
          ? "Beheerders en rollen zijn alleen beschikbaar na een geautoriseerde Google-login."
          : "Supabase is niet gekoppeld."
      };
  const adminUsers = adminUsersResult.users;
  const legalDocuments = admin && hasGoogleAdminSession ? await getLegalDocuments() : fallbackLegalDocuments;
  const faqs = admin && hasGoogleAdminSession ? await getAdminFaqs() : [];
  const hosts = admin && hasGoogleAdminSession ? await getAdminHosts() : [];
  const marketingItems = admin && hasGoogleAdminSession ? await getAdminMarketingItems() : [];
  const aiSettings = admin && hasGoogleAdminSession ? await getAISettings() : null;
  const automations = admin && hasGoogleAdminSession ? await getAdminAutomations() : [];
  const adminIdentity: AdminIdentity = {
    displayName: getAdminDisplayName(user, localAdminAllowed),
    email: user?.email ?? "Lokale beheersessie",
    role: adminRole ?? "local_admin",
    provider: getAdminProvider(user, localAdminAllowed)
  };
  const dataCheckedAt = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

  return (
      <AdminDashboard
        episodes={(episodes ?? fallbackEpisodes) as PodcastEpisode[]}
        seasons={(seasons ?? fallbackSeasons) as PodcastSeason[]}
        pendingPosts={pendingPosts ?? []}
        reports={reports ?? []}
        pendingInterviewComments={normalizedPendingInterviewComments}
        pendingCommunityReplies={normalizedPendingCommunityReplies}
        communityPosts={(recentPostsResult.data ?? []) as CommunityPost[]}
        communityReplies={(recentRepliesResult.data ?? []) as CommunityReply[]}
        communityProfiles={(communityProfilesResult.data ?? []) as CommunityProfile[]}
        communityPulseMoments={(pulseMomentsResult.data ?? []) as CommunityPulseMoment[]}
        communityDataError={communityDataError}
        analyticsRows={analyticsRows}
        analyticsSources={analyticsSources}
        sectionDesign={sectionDesign}
        siteSettings={siteSettings}
        missingSupabase={!hasSupabaseEnv}
        localPreview={localAdminAllowed && !adminRole && isLocalAdminEnabled()}
        savedMessage={saved ?? null}
        errorMessage={error ?? null}
        initialTab={tab ?? null}
        adminUsers={adminUsers}
        adminUsersError={adminUsersResult.error}
        legalDocuments={legalDocuments}
        faqs={faqs}
        hosts={hosts}
        marketingItems={marketingItems}
        aiSettings={aiSettings ?? undefined}
        automations={automations}
        adminIdentity={adminIdentity}
        dataCheckedAt={dataCheckedAt}
        loginActivity={analyticsSnapshot.loginActivity}
        loginActivityState={analyticsSnapshot.loginActivityState}
      />
  );
}

type AdminDataClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

async function getSupabaseCount(admin: AdminDataClient, table: string, label: string) {
  const { count, error } = await admin.from(table).select("*", { count: "exact", head: true });
  if (error) return { label, count: null, error: error.message };
  return { label, count: count ?? 0, error: null };
}

async function getFilteredSupabaseCount(
  admin: AdminDataClient,
  table: string,
  label: string,
  filters: { timestampColumn: string; start: string; end: string; intent?: "admin" | "community" }
) {
  let query = admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte(filters.timestampColumn, filters.start)
    .lt(filters.timestampColumn, filters.end);

  if (filters.intent) query = query.eq("intent", filters.intent);
  const { count, error } = await query;
  if (error) return { label, count: null, error: error.message };
  return { label, count: count ?? 0, error: null };
}

type AdminAuthUserTiming = AuthUserTiming & {
  id: string;
  email: string;
  provider: string;
};

type RawLoginActivity = {
  id: string;
  user_id: string;
  intent: "admin" | "community";
  occurred_at: string;
};

async function getAllAuthUserTimings(admin: AdminDataClient) {
  const users: AdminAuthUserTiming[] = [];
  const perPage = 1000;

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return { users: [], error: error.message };

    users.push(
      ...data.users.map((user) => ({
        id: user.id,
        email: user.email ?? "Onbekend account",
        provider: typeof user.app_metadata?.provider === "string" ? user.app_metadata.provider : "Google",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }))
    );

    if (data.users.length < perPage) return { users, error: null };
  }
}

async function getRegistrationAnalyticsRows(admin: AdminDataClient) {
  const range = getAmsterdamDayRange();
  const today = (timestampColumn: string, intent?: "admin" | "community") => ({
    timestampColumn,
    start: range.start,
    end: range.end,
    intent
  });

  const [
    authUsers,
    profilesTotal,
    profilesToday,
    podcastTotal,
    podcastToday,
    interviewTotal,
    interviewToday,
    adminLoginsToday,
    communityLoginsToday,
    recentLoginEvents
  ] = await Promise.all([
    getAllAuthUserTimings(admin),
    getSupabaseCount(admin, "community_profiles", "Communityprofielen"),
    getFilteredSupabaseCount(admin, "community_profiles", "Communityprofielen vandaag", today("created_at")),
    getSupabaseCount(admin, "episode_signups", "Podcastinschrijvingen"),
    getFilteredSupabaseCount(admin, "episode_signups", "Podcastinschrijvingen vandaag", today("created_at")),
    getSupabaseCount(admin, "interview_subscribers", "Interviewvolgers"),
    getFilteredSupabaseCount(admin, "interview_subscribers", "Interviewvolgers vandaag", today("created_at")),
    getFilteredSupabaseCount(admin, "auth_login_events", "Admin-inlogdoel", today("occurred_at", "admin")),
    getFilteredSupabaseCount(admin, "auth_login_events", "Community-inlogdoel", today("occurred_at", "community")),
    admin
      .from("auth_login_events")
      .select("id,user_id,intent,occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(8)
  ]);
  const authSummary = authUsers.error
    ? { totalAccounts: 0, newAccountsToday: 0, returningLoginsToday: 0 }
    : summarizeAuthUsers(authUsers.users, range);
  const count = (result: { count: number | null }) => result.count ?? 0;
  const queryResults = [
    profilesTotal,
    profilesToday,
    podcastTotal,
    podcastToday,
    interviewTotal,
    interviewToday,
    adminLoginsToday,
    communityLoginsToday
  ];
  const failedSources = [
    ...(authUsers.error ? ["Supabase Auth"] : []),
    ...queryResults.filter((result) => result.error).map((result) => result.label)
  ];

  const stateForMetric = (metric: string): AdminAnalyticsRow["state"] => {
    if (["Nieuwe SNAAR-accounts", "Terugkerende logins"].includes(metric)) return authUsers.error ? "error" : "verified";
    if (metric === "Communityprofielen") return profilesTotal.error || profilesToday.error ? "error" : "verified";
    if (metric === "Podcastinschrijvingen") return podcastTotal.error || podcastToday.error ? "error" : "verified";
    if (metric === "Interviewvolgers") return interviewTotal.error || interviewToday.error ? "error" : "verified";
    if (metric === "Google-inlogdoel") return adminLoginsToday.error || communityLoginsToday.error ? "error" : "verified";
    return "unknown";
  };
  const usersById = new Map(authUsers.users.map((authUser) => [authUser.id, authUser]));
  const loginActivity: AdminLoginActivity[] = recentLoginEvents.error
    ? []
    : ((recentLoginEvents.data ?? []) as RawLoginActivity[]).map((event) => {
        const authUser = usersById.get(event.user_id);
        return {
          id: event.id,
          intent: event.intent,
          occurredAt: event.occurred_at,
          identity: authUser?.email ?? "Onbekend account",
          provider: authUser?.provider ? authUser.provider.charAt(0).toUpperCase() + authUser.provider.slice(1) : "Google"
        };
      });

  return {
    rows: buildRegistrationAnalyticsRows({
      ...authSummary,
      totalCommunityProfiles: count(profilesTotal),
      newCommunityProfilesToday: count(profilesToday),
      totalPodcastSignups: count(podcastTotal),
      newPodcastSignupsToday: count(podcastToday),
      totalInterviewFollowers: count(interviewTotal),
      newInterviewFollowersToday: count(interviewToday),
      adminLoginEventsToday: count(adminLoginsToday),
      communityLoginEventsToday: count(communityLoginsToday)
    }).map((row) => ({ ...row, state: stateForMetric(row.metric) })),
    failedSources: recentLoginEvents.error ? [...failedSources, "Recente inlogactiviteit"] : failedSources,
    loginActivity,
    loginActivityState: recentLoginEvents.error ? "error" as const : "verified" as const
  };
}

async function getSupabaseAnalyticsRows(
  admin: AdminDataClient,
  context: {
    episodes: PodcastEpisode[];
    pendingPosts: PendingCommunityPost[];
    pendingCommunityReplies: PendingCommunityReply[];
    reports: OpenCommunityReport[];
    pendingInterviewComments: PendingInterviewComment[];
  }
): Promise<{ rows: AdminAnalyticsRow[]; loginActivity: AdminLoginActivity[]; loginActivityState: AdminDataState }> {
  const [registrationAnalytics, counts] = await Promise.all([
    getRegistrationAnalyticsRows(admin),
    Promise.all([
    getSupabaseCount(admin, "community_posts", "Community posts"),
    getSupabaseCount(admin, "community_replies", "Community reacties"),
    getSupabaseCount(admin, "community_supports", "Steunbetuigingen"),
    getSupabaseCount(admin, "community_messages", "Privéberichten"),
    getSupabaseCount(admin, "community_pulse_moments", "Aan de pols momenten"),
    getSupabaseCount(admin, "community_profile_photos", "Profiel foto's"),
    getSupabaseCount(admin, "community_profile_events", "Profiel momenten")
    ])
  ]);
  const byLabel = new Map(counts.map((item) => [item.label, item]));
  const failedSources = [
    ...registrationAnalytics.failedSources,
    ...counts.filter((item) => item.error).map((item) => item.label)
  ];
  const countValue = (label: string) => byLabel.get(label)?.count ?? 0;
  const countState = (label: string): AdminAnalyticsRow["state"] => byLabel.get(label)?.error ? "error" : "verified";
  const formattedCount = (label: string) => countState(label) === "error" ? "—" : formatAdminNumber(countValue(label));
  const publishedEpisodes = context.episodes.filter((episode) => episode.status === "published").length;
  const openModeration = context.pendingPosts.length + context.pendingCommunityReplies.length + context.pendingInterviewComments.length + context.reports.length;

  const rows: AdminAnalyticsRow[] = [
    ...registrationAnalytics.rows,
    {
      metric: "Gepubliceerde afleveringen",
      value: formatAdminNumber(publishedEpisodes),
      detail: `${context.episodes.length} totaal in beheer`,
      source: "Supabase podcast_episodes",
      state: "verified"
    },
    {
      metric: "Community posts",
      value: formattedCount("Community posts"),
      detail: `${formatAdminNumber(openModeration)} open moderatie-items`,
      source: "Supabase community_posts",
      state: countState("Community posts")
    },
    {
      metric: "Reacties",
      value: formattedCount("Community reacties"),
      detail: "Feed- en replyactiviteit",
      source: "Supabase community_replies",
      state: countState("Community reacties")
    },
    {
      metric: "Steunbetuigingen",
      value: formattedCount("Steunbetuigingen"),
      detail: "Aantal geplaatste hartreacties",
      source: "Supabase community_supports",
      state: countState("Steunbetuigingen")
    },
    {
      metric: "Privéberichten",
      value: formattedCount("Privéberichten"),
      detail: "Messenger berichten opgeslagen",
      source: "Supabase community_messages",
      state: countState("Privéberichten")
    },
    {
      metric: "Aan de pols",
      value: formattedCount("Aan de pols momenten"),
      detail: "Aangemaakte momenten",
      source: "Supabase community_pulse_moments",
      state: countState("Aan de pols momenten")
    },
    {
      metric: "Profielmedia",
      value: formattedCount("Profiel foto's"),
      detail: countState("Profiel momenten") === "error" ? "Profielmomenten niet beschikbaar" : `${formatAdminNumber(countValue("Profiel momenten"))} profielmomenten`,
      source: "Supabase profielmodules",
      state: countState("Profiel foto's") === "error" || countState("Profiel momenten") === "error" ? "error" : "verified"
    }
  ];

  if (failedSources.length) {
    rows.push({
      metric: "Niet opgehaalde bronnen",
      value: formatAdminNumber(failedSources.length),
      detail: failedSources.join(", "),
      source: "Supabase schema check",
      state: "error"
    });
  }

  return {
    rows,
    loginActivity: registrationAnalytics.loginActivity,
    loginActivityState: registrationAnalytics.loginActivityState
  };
}

function getAnalyticsSources(hasAdminClient: boolean): AdminAnalyticsSource[] {
  return [
    {
      platform: "Supabase",
      state: hasAdminClient ? "Live" : "Niet gekoppeld",
      owner: "Supabase service role",
      note: hasAdminClient ? "Adminportaal haalt engagement-, community- en profielcijfers live op." : "Service role ontbreekt, daardoor kunnen server-side analytics niet worden gelezen."
    },
    {
      platform: "Google Analytics",
      state: process.env.GA4_PROPERTY_ID && process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL && process.env.GOOGLE_ANALYTICS_PRIVATE_KEY ? "API klaar" : "Data API ontbreekt",
      owner: "GA4 Data API",
      note: process.env.NEXT_PUBLIC_GA_ID ? "Measurement-id staat aan, maar voor rapportage zijn GA4_PROPERTY_ID en service-account credentials nodig." : "GA4 measurement-id ontbreekt."
    },
    {
      platform: "Instagram",
      state: process.env.META_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ? "API klaar" : "Token ontbreekt",
      owner: "Meta Graph API",
      note: "Vereist META_ACCESS_TOKEN en INSTAGRAM_BUSINESS_ACCOUNT_ID voor bereik, profielweergaven en mediastatistieken."
    },
    {
      platform: "Facebook",
      state: process.env.META_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID ? "API klaar" : "Token ontbreekt",
      owner: "Meta Pages API",
      note: "Vereist META_ACCESS_TOKEN en FACEBOOK_PAGE_ID voor pagina- en poststatistieken."
    },
    {
      platform: "TikTok",
      state: process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET ? "API klaar" : "Token ontbreekt",
      owner: "TikTok Business API",
      note: "Vereist TikTok API credentials voordat kijktijd en bereik live kunnen worden opgehaald."
    },
    {
      platform: "Make",
      state: process.env.MAKE_WEBHOOK_URL ? "Webhook klaar" : "Webhook ontbreekt",
      owner: "Make automation",
      note: "Alleen beschikbaar zodra MAKE_WEBHOOK_URL is gezet."
    },
    {
      platform: "Canva",
      state: process.env.CANVA_BRAND_KIT_ID ? "Brand kit gekoppeld" : "Brand kit ontbreekt",
      owner: "Canva",
      note: "Alleen zichtbaar als CANVA_BRAND_KIT_ID is geconfigureerd."
    }
  ];
}

function formatAdminNumber(value: number) {
  return new Intl.NumberFormat("nl-NL").format(value);
}

function AdminAccessGate({
  error,
  signedInEmail
}: {
  error: string | null;
  signedInEmail: string | null;
}) {
  const messages: Record<string, string> = {
    "local-admin": "Controleer de gebruikersnaam en het wachtwoord.",
    "missing-supabase": "Supabase Auth is nog niet geconfigureerd voor deze omgeving.",
    "missing-secret": "De beveiligde beheerlogin is in deze omgeving nog niet geconfigureerd.",
    "rate-limited": "Er zijn te veel pogingen. Probeer het later opnieuw.",
    unauthorized: "Dit account heeft geen beheerrechten."
  };

  return (
    <section className="admin-access-page" aria-labelledby="admin-access-title">
      <div className="admin-access-panel">
        <p className="eyebrow">Stuk Verdriet beheer</p>
        <h1 id="admin-access-title">Beheeromgeving</h1>
        <p>
          Log in met Google of een toegestaan lokaal beheeraccount. Geen OTP of mailboxronde nodig.
        </p>

        <Link className="button" href="/auth/google?next=%2Fadmin" prefetch={false}>Verder met Google</Link>

        <form className="admin-magic-link-form" action="/api/local-admin-login" method="post">
          <input type="hidden" name="next" value="/admin" readOnly />
          <label>
            Gebruikersnaam
            <input name="username" autoComplete="username" required placeholder="susan of daniela" />
          </label>
          <label>
            Wachtwoord
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="button" type="submit">Inloggen</button>
        </form>

        {error ? <p className="notice">{messages[error] ?? "Inloggen lukte niet."}</p> : null}
        {signedInEmail ? (
          <p className="small-note">Je bent ingelogd als {signedInEmail}, maar dit account staat niet in `ADMIN_EMAILS`.</p>
        ) : null}
      </div>
    </section>
  );
}
