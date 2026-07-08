"use client";

import { useState } from "react";
import { CommentCard } from "@/components/CommentCard";
import type { InterviewComment } from "@/types/interview";

type CommentsSectionProps = {
  interviewId: string;
  comments: InterviewComment[];
  isLoggedIn: boolean;
  onCommentSubmit: (body: string, parentCommentId?: string) => Promise<void>;
  onCommentLike: (commentId: string) => Promise<void>;
};

export function CommentsSection({
  interviewId,
  comments,
  isLoggedIn,
  onCommentSubmit,
  onCommentLike
}: CommentsSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCommentSubmit(newComment, replyTo ?? undefined);
      setNewComment("");
      setReplyTo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedComments = comments.filter((c) => c.status === "approved");
  const topLevelComments = approvedComments.filter((c) => !c.parent_comment_id);

  return (
    <section className="comments-section" aria-labelledby="comments-title">
      <h3 id="comments-title">Reacties ({comments.length})</h3>

      {!isLoggedIn && (
        <p className="comment-login-prompt">
          Log in om een reactie achter te laten.
        </p>
      )}

      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="comment-form">
          <label htmlFor="comment-input" className="sr-only">
            {replyTo ? "Reageer op opmerking" : "Laat een reactie achter"}
          </label>
          <textarea
            id="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Schrijf je antwoord..." : "Laat een reactie achter..."}
            className="comment-input"
            disabled={isSubmitting}
          />
          <div className="comment-form-actions">
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="comment-form-cancel"
                disabled={isSubmitting}
              >
                Annuleer antwoord
              </button>
            )}
            <button
              type="submit"
              className="button"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? "Versturen..." : "Verstuur"}
            </button>
          </div>
        </form>
      )}

      <div className="comments-list">
        {topLevelComments.length === 0 ? (
          <p className="comments-empty">Nog geen reacties. Wees de eerste!</p>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id}>
              <CommentCard
                comment={comment}
                onReply={() => setReplyTo(comment.id)}
                onLike={() => onCommentLike(comment.id)}
              />
              {comment.reply_count > 0 && (
                <div className="comment-replies">
                  {approvedComments
                    .filter((c) => c.parent_comment_id === comment.id)
                    .map((reply) => (
                      <CommentCard
                        key={reply.id}
                        comment={reply}
                        onReply={() => setReplyTo(reply.id)}
                        onLike={() => onCommentLike(reply.id)}
                      />
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
