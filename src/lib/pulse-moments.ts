import type { createSupabaseAdminClient } from "@/lib/supabase";

export async function canUsePulseMoment(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string,
  momentId: string
) {
  const { data: moment } = await admin
    .from("community_pulse_moments")
    .select("user_id,status,visibility,community_profiles(is_discoverable)")
    .eq("id", momentId)
    .maybeSingle();
  if (!moment) return false;
  if (moment.user_id === userId) return true;
  if (moment.status !== "published") return false;
  const profile = Array.isArray(moment.community_profiles) ? moment.community_profiles[0] : moment.community_profiles;
  if (moment.visibility === "community") return Boolean(profile?.is_discoverable);
  if (moment.visibility !== "connections") return false;
  const { data: friendship } = await admin
    .from("community_friendships")
    .select("id")
    .eq("status", "accepted")
    .or(`and(requester_id.eq.${userId},addressee_id.eq.${moment.user_id}),and(addressee_id.eq.${userId},requester_id.eq.${moment.user_id})`)
    .maybeSingle();
  return Boolean(friendship);
}
