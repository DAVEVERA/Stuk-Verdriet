const AMSTERDAM_TIME_ZONE = "Europe/Amsterdam";
const DUTCH_NUMBER = new Intl.NumberFormat("nl-NL");

export type IsoDayRange = {
  start: string;
  end: string;
};

export type AuthUserTiming = {
  created_at: string;
  last_sign_in_at?: string | null;
};

export type AuthUserSummary = {
  totalAccounts: number;
  newAccountsToday: number;
  returningLoginsToday: number;
};

export type RegistrationAnalyticsSnapshot = AuthUserSummary & {
  totalCommunityProfiles: number;
  newCommunityProfilesToday: number;
  totalPodcastSignups: number;
  newPodcastSignupsToday: number;
  totalInterviewFollowers: number;
  newInterviewFollowersToday: number;
  adminLoginEventsToday: number;
  communityLoginEventsToday: number;
};

export type RegistrationAnalyticsRow = {
  metric: string;
  value: string;
  detail: string;
  source: string;
};

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getZonedParts(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second)
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone);
  const representedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const exactSecond = Math.floor(date.getTime() / 1000) * 1000;
  return representedAsUtc - exactSecond;
}

function getZonedMidnightUtc(year: number, month: number, day: number, timeZone: string) {
  const localMidnightAsUtc = Date.UTC(year, month - 1, day);
  let instant = localMidnightAsUtc;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    instant = localMidnightAsUtc - getTimeZoneOffsetMs(new Date(instant), timeZone);
  }

  return new Date(instant);
}

export function getAmsterdamDayRange(reference = new Date()): IsoDayRange {
  const localDate = getZonedParts(reference, AMSTERDAM_TIME_ZONE);
  const nextDate = new Date(Date.UTC(localDate.year, localDate.month - 1, localDate.day + 1));
  const start = getZonedMidnightUtc(localDate.year, localDate.month, localDate.day, AMSTERDAM_TIME_ZONE);
  const end = getZonedMidnightUtc(
    nextDate.getUTCFullYear(),
    nextDate.getUTCMonth() + 1,
    nextDate.getUTCDate(),
    AMSTERDAM_TIME_ZONE
  );

  return { start: start.toISOString(), end: end.toISOString() };
}

function isWithinRange(value: string | null | undefined, range: IsoDayRange) {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp >= Date.parse(range.start) && timestamp < Date.parse(range.end);
}

export function summarizeAuthUsers(users: AuthUserTiming[], range: IsoDayRange): AuthUserSummary {
  const rangeStart = Date.parse(range.start);

  return {
    totalAccounts: users.length,
    newAccountsToday: users.filter((user) => isWithinRange(user.created_at, range)).length,
    returningLoginsToday: users.filter((user) => {
      const createdAt = Date.parse(user.created_at);
      return Number.isFinite(createdAt) && createdAt < rangeStart && isWithinRange(user.last_sign_in_at, range);
    }).length
  };
}

function formatNumber(value: number) {
  return DUTCH_NUMBER.format(value);
}

export function buildRegistrationAnalyticsRows(snapshot: RegistrationAnalyticsSnapshot): RegistrationAnalyticsRow[] {
  const loginEventsToday = snapshot.adminLoginEventsToday + snapshot.communityLoginEventsToday;

  return [
    {
      metric: "Nieuwe SNAAR-accounts",
      value: formatNumber(snapshot.newAccountsToday),
      detail: `${formatNumber(snapshot.totalAccounts)} accounts totaal`,
      source: "Supabase Auth"
    },
    {
      metric: "Terugkerende logins",
      value: formatNumber(snapshot.returningLoginsToday),
      detail: "Bestaande accounts vandaag",
      source: "Supabase Auth"
    },
    {
      metric: "Communityprofielen",
      value: formatNumber(snapshot.totalCommunityProfiles),
      detail: `${formatNumber(snapshot.newCommunityProfilesToday)} vandaag aangemaakt`,
      source: "Supabase community_profiles"
    },
    {
      metric: "Podcastinschrijvingen",
      value: formatNumber(snapshot.totalPodcastSignups),
      detail: `${formatNumber(snapshot.newPodcastSignupsToday)} vandaag aangemeld`,
      source: "Supabase episode_signups"
    },
    {
      metric: "Interviewvolgers",
      value: formatNumber(snapshot.totalInterviewFollowers),
      detail: `${formatNumber(snapshot.newInterviewFollowersToday)} vandaag aangemeld`,
      source: "Supabase interview_subscribers"
    },
    {
      metric: "Google-inlogdoel",
      value: formatNumber(loginEventsToday),
      detail: `Admin ${formatNumber(snapshot.adminLoginEventsToday)} - community ${formatNumber(snapshot.communityLoginEventsToday)} vandaag`,
      source: "Supabase auth_login_events"
    }
  ];
}
