"use client";

import Image from "next/image";
import { X, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { CommentsSection } from "@/components/CommentsSection";
import { formatDate } from "@/components/ui";
import type { Interview, InterviewComment } from "@/types/interview";

type InterviewPopoutProps = {
  interview: Interview;
  comments: InterviewComment[];
  isLoggedIn: boolean;
  onClose: () => void;
  onCommentSubmit: (body: string, parentCommentId?: string) => Promise<void>;
  onCommentLike: (commentId: string) => Promise<void>;
  onInterviewLike: () => Promise<void>;
  onInterviewShare: () => Promise<void>;
};

export function InterviewPopout({
  interview,
  comments,
  isLoggedIn,
  onClose,
  onCommentSubmit,
  onCommentLike,
  onInterviewLike,
  onInterviewShare
}: InterviewPopoutProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await onInterviewLike();
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onInterviewShare();
      if (navigator.share) {
        await navigator.share({
          title: interview.title,
          text: interview.excerpt,
          url: window.location.href
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="interview-popout-layer" role="dialog" aria-modal="true" aria-labelledby="interview-title">
      <button className="interview-popout-backdrop" onClick={onClose} aria-label="Sluit interview" />
      <div className="interview-popout-panel">
        <button className="interview-popout-close" onClick={onClose} aria-label="Sluit">
          <X size={24} aria-hidden />
        </button>

        <div className="interview-popout-content">
          {interview.cover_image_url && (
            <div className="interview-popout-image">
              <Image
                src={interview.cover_image_url}
                alt={interview.title}
                fill
                sizes="(max-width: 760px) 100vw, 720px"
              />
            </div>
          )}

          <div className="interview-popout-header">
            <p className="eyebrow">Interview</p>
            <h2 id="interview-title">{interview.title}</h2>
            <p className="interview-popout-interviewee">{interview.interviewee_name}</p>
            <p className="interview-popout-date">{formatDate(interview.publication_date)}</p>

            {interview.tags.length > 0 && (
              <div className="interview-popout-tags">
                {interview.tags.map((tag) => (
                  <span key={tag} className="interview-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="interview-popout-body">
            {interview.full_content.split("\n").map((paragraph, index) => {
              if (paragraph.startsWith("#")) {
                return <h3 key={index}>{paragraph.replace(/^#+\s/, "")}</h3>;
              }
              if (paragraph.trim()) {
                return <p key={index}>{paragraph}</p>;
              }
              return null;
            })}
          </div>

          <div className="interview-popout-actions">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="interview-action"
              aria-label="Geef hartje voor dit interview"
            >
              <Heart size={18} aria-hidden /> {interview.like_count}
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="interview-action"
              aria-label="Deel dit interview"
            >
              <Share2 size={18} aria-hidden /> {interview.share_count}
            </button>
          </div>

          <CommentsSection
            interviewId={interview.id}
            comments={comments}
            isLoggedIn={isLoggedIn}
            onCommentSubmit={onCommentSubmit}
            onCommentLike={onCommentLike}
          />
        </div>
      </div>
    </div>
  );
}
