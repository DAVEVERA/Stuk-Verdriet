import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

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

  const admin = createSupabaseAdminClient();
  const dataClient = admin ?? supabase;

  const [profile, posts, replies, pulseMoments, photos, albums, events] = await Promise.all([
    dataClient.from("community_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    dataClient.from("community_posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    dataClient.from("community_replies").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    dataClient.from("community_pulse_moments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    dataClient.from("community_profile_photos").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    dataClient.from("community_profile_albums").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    dataClient.from("community_profile_events").select("*").eq("user_id", user.id).order("starts_at", { ascending: false })
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    account_email: user.email ?? null,
    profile: profile.data ?? null,
    posts: posts.data ?? [],
    replies: replies.data ?? [],
    pulse_moments: pulseMoments.data ?? [],
    photos: photos.data ?? [],
    albums: albums.data ?? [],
    events: events.data ?? []
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="snaar-gegevens-${user.id}.json"`
    }
  });
}
