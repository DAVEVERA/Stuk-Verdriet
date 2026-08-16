import { NextResponse } from "next/server";
import { assertSameOriginRequest } from "@/lib/request-guard";
import { canUsePulseMoment } from "@/lib/pulse-moments";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

type PulseAction = "react" | "unreact" | "save" | "unsave";

const pulseActions: PulseAction[] = ["react", "unreact", "save", "unsave"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await assertSameOriginRequest())) {
    return NextResponse.json({ error: "invalid-origin" }, { status: 403 });
  }

  const { id: momentId } = await params;
  if (!momentId) {
    return NextResponse.json({ error: "missing-moment" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { action?: string } | null;
  const action = body?.action;
  if (!action || !pulseActions.includes(action as PulseAction)) {
    return NextResponse.json({ error: "invalid-action" }, { status: 400 });
  }

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
  if (!admin) {
    return NextResponse.json({ error: "profile-storage" }, { status: 503 });
  }

  if (!(await canUsePulseMoment(admin, user.id, momentId))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (action === "react") {
    const { error } = await admin
      .from("community_pulse_reactions")
      .upsert({ moment_id: momentId, user_id: user.id }, { onConflict: "moment_id,user_id" });
    if (error) return NextResponse.json({ error: "pulse" }, { status: 500 });
  } else if (action === "unreact") {
    const { error } = await admin
      .from("community_pulse_reactions")
      .delete()
      .eq("moment_id", momentId)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: "pulse" }, { status: 500 });
  } else if (action === "save") {
    const { error } = await admin
      .from("community_pulse_saves")
      .upsert({ moment_id: momentId, user_id: user.id }, { onConflict: "moment_id,user_id" });
    if (error) return NextResponse.json({ error: "pulse" }, { status: 500 });
  } else {
    const { error } = await admin
      .from("community_pulse_saves")
      .delete()
      .eq("moment_id", momentId)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: "pulse" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
