"use server";

import { assertSameOriginRequest, consumeRateLimit, requestIpAddress } from "@/lib/request-guard";
import { createSupabaseServerClient } from "@/lib/supabase";

// Zonder geconfigureerde Supabase-omgeving (of zonder ingelogde gebruiker bij
// likes) doen deze acties stilletjes niets: de kaart toont de interactie
// optimistisch en de site blijft gewoon werken.

// Anti-abuse limieten per IP. Bij overschrijding doet de actie stilletjes niets,
// zodat de UI blijft werken maar spam/floods (o.a. richting de e-mailtabel
// interview_subscribers) worden afgeremd.
const engagementWindowMs = 60 * 1000;
const engagementMax = 40; // hartjes/deel-acties per minuut per IP
const commentWindowMs = 10 * 60 * 1000;
const commentMax = 8; // reacties per 10 minuten per IP

async function allowEngagement(kind: string) {
  const ip = await requestIpAddress();
  return consumeRateLimit(`interview:${kind}:${ip}`, engagementWindowMs, engagementMax);
}

export async function likeInterview(interviewId: string, shouldLike?: boolean) {
  if (!(await allowEngagement("like"))) return;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    // Anonieme bezoeker: gecontroleerde +/-1 via de RPC (nooit onder 0, alleen
    // gepubliceerde interviews). Directe UPDATE op de tellerkolom is ingetrokken.
    const delta = shouldLike === false ? -1 : 1;
    await supabase.rpc("bump_interview_like", { p_interview_id: interviewId, p_delta: delta });
    return;
  }

  const { data: existingLike } = await supabase
    .from("interview_likes")
    .select("id")
    .eq("interview_id", interviewId)
    .eq("user_id", user.user.id)
    .maybeSingle();

  if (existingLike) {
    await supabase.from("interview_likes").delete().eq("id", existingLike.id);
  } else {
    await supabase.from("interview_likes").insert({
      interview_id: interviewId,
      user_id: user.user.id
    });
  }

  // Exacte hertelling server-side uit interview_likes (RPC), niet client-bepaald.
  await supabase.rpc("recount_interview_likes", { p_interview_id: interviewId });
}

export async function shareInterview(interviewId: string) {
  if (!(await allowEngagement("share"))) return;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  // Gecontroleerde +1 via de RPC (alleen gepubliceerd). Directe UPDATE op de
  // tellerkolom is ingetrokken zodat de teller niet naar willekeur te zetten is.
  await supabase.rpc("bump_interview_share", { p_interview_id: interviewId });
}

export async function submitInterviewComment(
  interviewId: string,
  body: string,
  parentCommentId?: string,
  authorName?: string,
  authorEmail?: string
) {
  const trimmedBody = body.trim();
  if (!trimmedBody) return;
  if (trimmedBody.length > 4000) return;

  // Reacties komen (ook anoniem) van bezoekers en slaan naam/e-mail op in
  // interview_subscribers. Alleen same-origin verzoeken toestaan en het aantal
  // per IP begrenzen om spam en het volpompen van de e-mailtabel te voorkomen.
  if (!(await assertSameOriginRequest())) return;
  const ip = await requestIpAddress();
  if (!consumeRateLimit(`interview:comment:${ip}`, commentWindowMs, commentMax)) return;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const { data: user } = await supabase.auth.getUser();
  const name = authorName?.trim().slice(0, 120) || user.user?.user_metadata?.full_name || null;
  // E-mail is optioneel. Een ongeldig adres mag de reactie NIET blokkeren:
  // we bewaren het adres dan simpelweg niet, maar plaatsen de reactie wel.
  const rawEmail = authorEmail?.trim().toLowerCase() || null;
  const email = rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : null;

  // Naam/e-mail bewaren zodat we bezoekers op de hoogte kunnen houden.
  // De tabel is insert-only voor bezoekers; lezen kan alleen via de admin.
  if (email) {
    await supabase
      .from("interview_subscribers")
      .upsert(
        { name, email, interview_id: interviewId },
        { onConflict: "email", ignoreDuplicates: true }
      );
  }

  const { error } = await supabase.from("interview_comments").insert({
    interview_id: interviewId,
    author_name: name,
    author_display_type: name ? "first_name" : "anonymous",
    body: trimmedBody,
    parent_comment_id: parentCommentId ?? null,
    status: "pending"
  });

  if (error) return;

  // Exacte hertelling van goedgekeurde top-level reacties via de RPC.
  await supabase.rpc("recount_interview_comments", { p_interview_id: interviewId });
}

export async function likeComment(commentId: string) {
  if (!(await allowEngagement("comment-like"))) return;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return;

  const { data: existingLike } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.user.id)
    .maybeSingle();

  if (existingLike) {
    await supabase.from("comment_likes").delete().eq("id", existingLike.id);
  } else {
    await supabase.from("comment_likes").insert({
      comment_id: commentId,
      user_id: user.user.id
    });
  }

  // Exacte hertelling server-side uit comment_likes (RPC), niet client-bepaald.
  await supabase.rpc("recount_comment_likes", { p_comment_id: commentId });
}
