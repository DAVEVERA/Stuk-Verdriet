import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { CommunityConversation, CommunityProfile } from "@/types/content";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "profile-storage" }, { status: 503 });
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const [profilesResult, conversationsResult] = await Promise.all([
    supabase
      .from("community_profiles")
      .select("*")
      .eq("is_discoverable", true)
      .neq("user_id", user.id)
      .limit(12),
    supabase
      .from("community_conversations")
      .select(
        "id,created_by,created_at,updated_at,community_conversation_participants(conversation_id,user_id,last_read_at,created_at,community_profiles(user_id,display_name,avatar_url,is_discoverable)),community_messages(id,conversation_id,sender_id,body,created_at)"
      )
      .order("updated_at", { ascending: false })
      .order("created_at", { referencedTable: "community_messages", ascending: true })
      .limit(6, { referencedTable: "community_messages" })
      .limit(8)
  ]);

  const discoverableProfiles = (profilesResult.data as CommunityProfile[] | null) ?? [];
  const conversations = (conversationsResult.data as CommunityConversation[] | null) ?? [];

  return NextResponse.json({ discoverableProfiles, conversations });
}
