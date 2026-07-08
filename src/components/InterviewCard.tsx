import Image from "next/image";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import type { Interview } from "@/types/interview";

type InterviewCardProps = {
  interview: Interview;
  onClick: () => void;
};

export function InterviewCard({ interview, onClick }: InterviewCardProps) {
  return (
    <button
      onClick={onClick}
      className="interview-card"
      aria-label={`Lees interview met ${interview.interviewee_name}: ${interview.title}`}
    >
      <div className="interview-card-image">
        {interview.cover_image_url ? (
          <Image
            src={interview.cover_image_url}
            alt={interview.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="interview-card-placeholder" aria-hidden>
            <span>{interview.title}</span>
          </div>
        )}
      </div>
      <div className="interview-card-content">
        <p className="eyebrow">Interview</p>
        <h3>{interview.title}</h3>
        <p className="interview-interviewee">{interview.interviewee_name}</p>
        <p>{interview.excerpt}</p>
        {interview.tags.length > 0 && (
          <div className="interview-tags">
            {interview.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="interview-tag">
                {tag}
              </span>
            ))}
            {interview.tags.length > 2 && <span className="interview-tag-more">+{interview.tags.length - 2}</span>}
          </div>
        )}
      </div>
      <div className="interview-card-footer">
        <div className="interview-engagement">
          <span className="engagement-stat">
            <Heart size={16} aria-hidden /> {interview.like_count}
          </span>
          <span className="engagement-stat">
            <MessageCircle size={16} aria-hidden /> {interview.comment_count}
          </span>
          <span className="engagement-stat">
            <Share2 size={16} aria-hidden /> {interview.share_count}
          </span>
        </div>
      </div>
    </button>
  );
}
