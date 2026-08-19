import Link from "next/link";
import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { CommunityChatWidget } from "@/components/CommunityChatWidget";
import { fallbackEpisodes, fallbackSeasons, fallbackLegalDocuments } from "@/lib/fallback-data";
import { canAccessAdminPortal } from "@/lib/admin-access";
import { getSiteDesignSettings, getSiteSettings } from "@/lib/content";
import { getAdminCustomers, getAdminLogisticsEvents, getAdminOrders, getAdminReturns, getAdminReviews, getAdminServiceQuestions, getAdminUsers, getLegalDocuments, getAdminFaqs, getAdminHosts, getAdminMarketingItems, getAISettings, getAdminAutomations } from "@/lib/admin-operations";
import { hasLocalAdminSession, isLocalAdminEnabled } from "@/lib/local-admin";
import { buildRegistrationAnalyticsRows, getAmsterdamDayRange, summarizeAuthUsers, type AuthUserTiming } from "@/lib/registration-analytics";
import { getAdminShopOrders, getAdminShopProducts, getAdminShopSettings } from "@/lib/shop";
import { getAdminRole, createSupabaseAdminClient, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import type { AdminAnalyticsRow, AdminAnalyticsSource } from "@/features/admin/AdminDashboard";
import type { PodcastEpisode, PodcastSeason } from "@/types/content";

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

  if (!canAccessAdminPortal(adminRole, localAdminAllowed)) {
    return <AdminAccessGate error={error ?? null} signedInEmail={user?.email ?? null} />;
  }

  const admin = createSupabaseAdminClient();
  const sectionDesign = await getSiteDesignSettings();
  const siteSettings = await getSiteSettings();
  const [
    pendingPostsResult,
    reportsResult,
    seasonsResult,
    episodesResult,
    pendingInterviewCommentsResult,
    shopProducts,
    shopOrders,
    shopSettings,
    customers,
    orders,
    returns,
    reviews,
    logisticsEvents,
    serviceQuestions
  ] = admin
    ? await Promise.all([
        admin.from("community_posts").select("id,title,category,created_at,status").eq("status", "pending").order("created_at", { ascending: false }),
        admin.from("community_reports").select("*").is("resolved_at", null).order("created_at", { ascending: false }),
        admin.from("podcast_seasons").select("*").order("season_number", { ascending: true }),
        admin.from("podcast_episodes").select("*").order("season_number", { ascending: true }).order("episode_number", { ascending: true }),
        admin
          .from("interview_comments")
          .select("id,interview_id,author_name,author_display_type,body,created_at,status,interviews(title,slug)")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        getAdminShopProducts(),
        getAdminShopOrders(),
        getAdminShopSettings(),
        getAdminCustomers(),
        getAdminOrders(),
        getAdminReturns(),
        getAdminReviews(),
        getAdminLogisticsEvents(),
        getAdminServiceQuestions()
      ])
    : [
        { data: [] },
        { data: [] },
        { data: fallbackSeasons },
        { data: fallbackEpisodes },
        { data: [] },
        await getAdminShopProducts(),
        [],
        await getAdminShopSettings(),
        await getAdminCustomers(),
        await getAdminOrders(),
        await getAdminReturns(),
        await getAdminReviews(),
        await getAdminLogisticsEvents(),
        await getAdminServiceQuestions()
      ];
  const pendingPosts = pendingPostsResult.data;
  const reports = reportsResult.data;
  const seasons = seasonsResult.data;
  const episodes = episodesResult.data;
  const pendingInterviewComments = pendingInterviewCommentsResult.data;
  const normalizedPendingInterviewComments = ((pendingInterviewComments ?? []) as RawPendingInterviewComment[]).map((comment) => ({
    ...comment,
    interviews: Array.isArray(comment.interviews) ? (comment.interviews[0] ?? null) : (comment.interviews ?? null)
  }));
  const analyticsRows = admin
    ? await getSupabaseAnalyticsRows(admin, {
        episodes: ((episodes ?? []) as PodcastEpisode[]),
        pendingPosts: pendingPosts ?? [],
        reports: reports ?? [],
        pendingInterviewComments: normalizedPendingInterviewComments
      })
    : [];
  const analyticsSources = getAnalyticsSources(Boolean(admin));

  const adminUsers = admin ? await getAdminUsers() : [];
  const legalDocuments = admin ? await getLegalDocuments() : fallbackLegalDocuments;
  const faqs = admin ? await getAdminFaqs() : [];
  const hosts = admin ? await getAdminHosts() : [];
  const marketingItems = admin ? await getAdminMarketingItems() : [];
  const aiSettings = admin ? await getAISettings() : null;
  const automations = admin ? await getAdminAutomations() : [];

  return (
    <>
      <AdminDashboard
        episodes={(episodes ?? fallbackEpisodes) as PodcastEpisode[]}
        seasons={(seasons ?? fallbackSeasons) as PodcastSeason[]}
        pendingPosts={pendingPosts ?? []}
        reports={reports ?? []}
        pendingInterviewComments={normalizedPendingInterviewComments}
        analyticsRows={analyticsRows}
        analyticsSources={analyticsSources}
        shopProducts={shopProducts}
        shopOrders={shopOrders}
        shopSettings={shopSettings}
        customers={customers}
        orders={orders}
        returns={returns}
        reviews={reviews}
        logisticsEvents={logisticsEvents}
        serviceQuestions={serviceQuestions}
        stripeConfigured={Boolean(process.env.STRIPE_SECRET_KEY)}
        sectionDesign={sectionDesign}
        siteSettings={siteSettings}
        missingSupabase={!hasSupabaseEnv}
        localPreview={localAdminAllowed && !adminRole && isLocalAdminEnabled()}
        savedMessage={saved ?? null}
        errorMessage={error ?? null}
        initialTab={tab ?? null}
        adminUsers={adminUsers}
        legalDocuments={legalDocuments}
        faqs={faqs}
        hosts={hosts}
        marketingItems={marketingItems}
        aiSettings={aiSettings ?? undefined}
        automations={automations}
      />
      <CommunityChatWidget />
    </>
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

async function getAllAuthUserTimings(admin: AdminDataClient) {
  const users: AuthUserTiming[] = [];
  const perPage = 1000;

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return { users: [], error: error.message };

    users.push(
      ...data.users.map((user) => ({
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
    communityLoginsToday
  ] = await Promise.all([
    getAllAuthUserTimings(admin),
    getSupabaseCount(admin, "community_profiles", "Communityprofielen"),
    getFilteredSupabaseCount(admin, "community_profiles", "Communityprofielen vandaag", today("created_at")),
    getSupabaseCount(admin, "episode_signups", "Podcastinschrijvingen"),
    getFilteredSupabaseCount(admin, "episode_signups", "Podcastinschrijvingen vandaag", today("created_at")),
    getSupabaseCount(admin, "interview_subscribers", "Interviewvolgers"),
    getFilteredSupabaseCount(admin, "interview_subscribers", "Interviewvolgers vandaag", today("created_at")),
    getFilteredSupabaseCount(admin, "auth_login_events", "Admin-inlogdoel", today("occurred_at", "admin")),
    getFilteredSupabaseCount(admin, "auth_login_events", "Community-inlogdoel", today("occurred_at", "community"))
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
    }),
    failedSources
  };
}

async function getSupabaseAnalyticsRows(
  admin: AdminDataClient,
  context: {
    episodes: PodcastEpisode[];
    pendingPosts: PendingCommunityPost[];
    reports: OpenCommunityReport[];
    pendingInterviewComments: PendingInterviewComment[];
  }
): Promise<AdminAnalyticsRow[]> {
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
  const publishedEpisodes = context.episodes.filter((episode) => episode.status === "published").length;
  const openModeration = context.pendingPosts.length + context.pendingInterviewComments.length + context.reports.length;

  const rows: AdminAnalyticsRow[] = [
    ...registrationAnalytics.rows,
    {
      metric: "Gepubliceerde afleveringen",
      value: formatAdminNumber(publishedEpisodes),
      detail: `${context.episodes.length} totaal in beheer`,
      source: "Supabase podcast_episodes"
    },
    {
      metric: "Community posts",
      value: formatAdminNumber(countValue("Community posts")),
      detail: `${formatAdminNumber(openModeration)} open moderatie-items`,
      source: "Supabase community_posts"
    },
    {
      metric: "Reacties",
      value: formatAdminNumber(countValue("Community reacties")),
      detail: "Feed- en replyactiviteit",
      source: "Supabase community_replies"
    },
    {
      metric: "Steunbetuigingen",
      value: formatAdminNumber(countValue("Steunbetuigingen")),
      detail: "Aantal geplaatste hartreacties",
      source: "Supabase community_supports"
    },
    {
      metric: "Privéberichten",
      value: formatAdminNumber(countValue("Privéberichten")),
      detail: "Messenger berichten opgeslagen",
      source: "Supabase community_messages"
    },
    {
      metric: "Aan de pols",
      value: formatAdminNumber(countValue("Aan de pols momenten")),
      detail: "Aangemaakte momenten",
      source: "Supabase community_pulse_moments"
    },
    {
      metric: "Profielmedia",
      value: formatAdminNumber(countValue("Profiel foto's")),
      detail: `${formatAdminNumber(countValue("Profiel momenten"))} profielmomenten`,
      source: "Supabase profielmodules"
    }
  ];

  if (failedSources.length) {
    rows.push({
      metric: "Niet opgehaalde bronnen",
      value: formatAdminNumber(failedSources.length),
      detail: failedSources.join(", "),
      source: "Supabase schema check"
    });
  }

  return rows;
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
