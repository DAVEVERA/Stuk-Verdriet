import { Heart, Reply, Share2 } from "lucide-react";
import type { InterviewComment } from "@/types/interview";
import { formatDate } from "@/components/ui";

type CommentCardProps = {
  comment: InterviewComment;
  onReply: (parentCommentId: string) => void;
  onLike: (commentId: string) => void;
};

function displayAuthor(name: string | null, type: string) {
  if (type === "anonymous") return "Anoniem";
  if (type === "first_name" && name) return name.split(" ")[0];
  return name ?? "Communitylid";
}

export function CommentCard({ comment, onReply, onLike }: CommentCardProps) {
  return (
    <article className={`comment-card${comment.parent_comment_id ? " reply" : ""}`}>
      <div className="comment-header">
        <strong>{displayAuthor(comment.author_name, comment.author_display_type)}</strong>
        <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
      </div>
      <p className="comment-body">{comment.body}</p>
      <div className="comment-actions">
        <button
          className="comment-action-button"
          onClick={() => onLike(comment.id)}
          aria-label="Geef hartje voor deze reactie"
        >
          <Heart size={16} aria-hidden /> {comment.like_count}
        </button>
        <button
          className="comment-action-button"
          onClick={() => onReply(comment.id)}
          aria-label="Reageer op deze opmerking"
        >
          <Reply size={16} aria-hidden /> Reageer
        </button>
        <button className="comment-action-button" aria-label="Deel deze opmerking">
          <Share2 size={16} aria-hidden /> Deel
        </button>
      </div>
    </article>
  );
}
