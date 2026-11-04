import webpush from "web-push";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { site } from "@/lib/site";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

export const hasVapidEnv = Boolean(vapidPublicKey && vapidPrivateKey);

let configured = false;
function ensureConfigured() {
  if (configured || !hasVapidEnv) return;
  webpush.setVapidDetails(`mailto:${site.email}`, vapidPublicKey!, vapidPrivateKey!);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  keys: unknown;
  sound_enabled: boolean;
  push_enabled: boolean;
};

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

/**
 * Delivers a payload to a set of subscriptions. Best-effort: failures for one
 * subscription (e.g. an expired endpoint) don't block the others, and expired
 * (410/404) subscriptions are pruned. Returns how many were actually sent.
 */
async function deliverToSubscriptions(
  admin: AdminClient,
  subscriptions: PushSubscriptionRow[],
  payload: PushPayload,
  defaultUrl: string
) {
  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string }
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url ?? defaultUrl,
            tag: payload.tag,
            silent: !sub.sound_enabled
          })
        );
        sent += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    })
  );
  return sent;
}

/**
 * Sends a push notification to every subscription a user has, honouring their
 * push_enabled and sound_enabled toggles.
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!hasVapidEnv) return { sent: 0, reason: "vapid-not-configured" as const };
  ensureConfigured();

  const admin = createSupabaseAdminClient();
  if (!admin) return { sent: 0, reason: "no-admin-client" as const };

  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, keys, sound_enabled, push_enabled")
    .eq("user_id", userId)
    .eq("push_enabled", true);

  if (error || !subscriptions?.length) return { sent: 0, reason: "no-subscriptions" as const };

  const sent = await deliverToSubscriptions(admin, subscriptions as PushSubscriptionRow[], payload, "/community");
  return { sent, reason: "ok" as const };
}

/**
 * Broadcasts a push notification to every push-enabled subscription across all
 * users. Used by the admin push composer. Best-effort; prunes expired endpoints.
 */
export async function sendPushBroadcast(payload: PushPayload) {
  if (!hasVapidEnv) return { sent: 0, total: 0, reason: "vapid-not-configured" as const };
  ensureConfigured();

  const admin = createSupabaseAdminClient();
  if (!admin) return { sent: 0, total: 0, reason: "no-admin-client" as const };

  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, keys, sound_enabled, push_enabled")
    .eq("push_enabled", true);

  if (error) return { sent: 0, total: 0, reason: "query-failed" as const };
  if (!subscriptions?.length) return { sent: 0, total: 0, reason: "no-subscriptions" as const };

  const sent = await deliverToSubscriptions(admin, subscriptions as PushSubscriptionRow[], payload, "/");
  return { sent, total: subscriptions.length, reason: "ok" as const };
}
