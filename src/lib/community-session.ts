import { createSupabaseServerClient } from "@/lib/supabase";
import type { CommunityProfile } from "@/types/content";

export type CommunityAccountSession = {
  isLoggedIn: boolean;
  email: string | null;
  currentUserId: string | null;
  currentProfile: CommunityProfile | null;
};

export async function getCommunityAccountSession(): Promise<CommunityAccountSession> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { isLoggedIn: false, email: null, currentUserId: null, currentProfile: null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { isLoggedIn: false, email: null, currentUserId: null, currentProfile: null };
  }

  const { data: profile } = await supabase
    .from("community_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    isLoggedIn: true,
    email: user.email ?? null,
    currentUserId: user.id,
    currentProfile: (profile as CommunityProfile | null) ?? null
  };
}
