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

/**
 * Sends a push notification to every subscription a user has, honouring their
 * push_enabled and sound_enabled toggles. Best-effort: failures for one
 * subscription (e.g. an expired endpoint) don't block the others, and expired
 * (410/404) subscriptions are pruned.
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
            url: payload.url ?? "/community",
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

  return { sent, reason: "ok" as const };
}
