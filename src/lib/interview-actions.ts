"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export async function likeInterview(interviewId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

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

  const { count } = await supabase
    .from("interview_likes")
    .select("*", { count: "exact" })
    .eq("interview_id", interviewId);

  await supabase
    .from("interviews")
    .update({ like_count: count ?? 0 })
    .eq("id", interviewId);
}

export async function shareInterview(interviewId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: interview, error } = await supabase
    .from("interviews")
    .select("share_count")
    .eq("id", interviewId)
    .maybeSingle();

  if (error || !interview) throw error || new Error("Interview not found");

  await supabase
    .from("interviews")
    .update({ share_count: interview.share_count + 1 })
    .eq("id", interviewId);
}

export async function submitInterviewComment(
  interviewId: string,
  body: string,
  parentCommentId?: string
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: user } = await supabase.auth.getUser();

  const { error } = await supabase.from("interview_comments").insert({
    interview_id: interviewId,
    author_name: user.user?.user_metadata?.full_name ?? null,
    author_display_type: "first_name",
    body: body.trim(),
    parent_comment_id: parentCommentId ?? null,
    status: "pending"
  });

  if (error) throw error;

  const { count } = await supabase
    .from("interview_comments")
    .select("*", { count: "exact" })
    .eq("interview_id", interviewId)
    .eq("status", "approved")
    .is("parent_comment_id", null);

  await supabase
    .from("interviews")
    .update({ comment_count: count ?? 0 })
    .eq("id", interviewId);
}

export async function likeComment(commentId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

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

  const { count } = await supabase
    .from("comment_likes")
    .select("*", { count: "exact" })
    .eq("comment_id", commentId);

  await supabase
    .from("interview_comments")
    .update({ like_count: count ?? 0 })
    .eq("id", commentId);
}
