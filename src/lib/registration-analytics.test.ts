import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRegistrationAnalyticsRows,
  getAmsterdamDayRange,
  summarizeAuthUsers,
  type RegistrationAnalyticsSnapshot
} from "./registration-analytics.ts";

test("Amsterdam day bounds follow local midnight in summer and across DST", () => {
  const summer = getAmsterdamDayRange(new Date("2026-08-19T16:00:00.000Z"));
  assert.deepEqual(summer, {
    start: "2026-08-18T22:00:00.000Z",
    end: "2026-08-19T22:00:00.000Z"
  });

  const dstStart = getAmsterdamDayRange(new Date("2026-03-29T12:00:00.000Z"));
  assert.deepEqual(dstStart, {
    start: "2026-03-28T23:00:00.000Z",
    end: "2026-03-29T22:00:00.000Z"
  });
});

test("returning logins exclude accounts created on the same Amsterdam day", () => {
  const range = getAmsterdamDayRange(new Date("2026-08-19T16:00:00.000Z"));
  const summary = summarizeAuthUsers(
    [
      { created_at: "2026-08-19T07:00:00.000Z", last_sign_in_at: "2026-08-19T07:00:00.000Z" },
      { created_at: "2026-08-18T19:00:00.000Z", last_sign_in_at: "2026-08-19T15:34:00.000Z" },
      { created_at: "2026-08-17T08:00:00.000Z", last_sign_in_at: "2026-08-19T15:40:00.000Z" },
      { created_at: "2026-08-12T08:00:00.000Z", last_sign_in_at: "2026-08-18T10:00:00.000Z" }
    ],
    range
  );

  assert.deepEqual(summary, {
    totalAccounts: 4,
    newAccountsToday: 1,
    returningLoginsToday: 2
  });
});

test("registration analytics expose five separate figures and the login intent split", () => {
  const snapshot: RegistrationAnalyticsSnapshot = {
    totalAccounts: 39,
    newAccountsToday: 2,
    returningLoginsToday: 7,
    totalCommunityProfiles: 10,
    newCommunityProfilesToday: 1,
    totalPodcastSignups: 183,
    newPodcastSignupsToday: 3,
    totalInterviewFollowers: 4,
    newInterviewFollowersToday: 1,
    adminLoginEventsToday: 2,
    communityLoginEventsToday: 8
  };

  assert.deepEqual(buildRegistrationAnalyticsRows(snapshot), [
    {
      metric: "Nieuwe SNAAR-accounts",
      value: "2",
      detail: "39 accounts totaal",
      source: "Supabase Auth"
    },
    {
      metric: "Terugkerende logins",
      value: "7",
      detail: "Bestaande accounts vandaag",
      source: "Supabase Auth"
    },
    {
      metric: "Communityprofielen",
      value: "10",
      detail: "1 vandaag aangemaakt",
      source: "Supabase community_profiles"
    },
    {
      metric: "Podcastinschrijvingen",
      value: "183",
      detail: "3 vandaag aangemeld",
      source: "Supabase episode_signups"
    },
    {
      metric: "Interviewvolgers",
      value: "4",
      detail: "1 vandaag aangemeld",
      source: "Supabase interview_subscribers"
    },
    {
      metric: "Google-inlogdoel",
      value: "10",
      detail: "Admin 2 - community 8 vandaag",
      source: "Supabase auth_login_events"
    }
  ]);
});
