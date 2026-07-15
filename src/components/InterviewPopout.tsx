"use client";

import Image from "next/image";
import { X, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { CommentsSection } from "@/components/CommentsSection";
import { formatDate } from "@/components/ui";
import type { Interview, InterviewComment } from "@/types/interview";

type InterviewFooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const interviewFooterLinks: Record<string, InterviewFooterLink[]> = {
  "ik-ben-vooral-ik": [
    { label: "Podcast", href: "#podcast" },
    { label: "Instagram", href: "https://www.instagram.com/stukverdrietdepodcast/", external: true },
    { label: "Waar heb je nu behoefte aan?", href: "#themas" }
  ],
  "mijn-verhaal-mag-erbij": [
    { label: "GoFundMe", href: "#gofundme" },
    { label: "Podcast", href: "#podcast" },
    { label: "TikTok", href: "https://www.tiktok.com/@stuk.verdriet", external: true },
    { label: "Instagram", href: "https://www.instagram.com/stukverdrietdepodcast/", external: true }
  ]
};

type InterviewPopoutProps = {
  interview: Interview;
  comments: InterviewComment[];
  isLoggedIn: boolean;
  onClose: () => void;
  onCommentSubmit: (
    body: string,
    parentCommentId?: string,
    authorName?: string,
    authorEmail?: string
  ) => Promise<void>;
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
  const isContentAwareCover = interview.cover_image_url === "/img/DV.jpeg";
  const footerLinks = interviewFooterLinks[interview.slug] ?? [];

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
      <button type="button" className="interview-popout-backdrop" onClick={onClose} aria-label="Sluit interview" />
      <div className="interview-popout-panel">
        <button type="button" className="interview-popout-close" onClick={onClose} aria-label="Sluit">
          <X size={24} aria-hidden />
        </button>

        <div className="interview-popout-content">
          {interview.cover_image_url && (
            <div className={isContentAwareCover ? "interview-popout-image interview-popout-image-content-aware" : "interview-popout-image"}>
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

          {footerLinks.length ? (
            <footer className="interview-popout-link-footer" aria-label="Verder lezen en volgen">
              {footerLinks.map((link) => (
                <a
                  className="interview-popout-link"
                  href={link.href}
                  key={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  onClick={link.external ? undefined : onClose}
                >
                  {link.label}
                </a>
              ))}
            </footer>
          ) : null}

          <div className="interview-popout-actions">
            <button
              type="button"
              onClick={handleLike}
              disabled={isLiking}
              className="interview-action"
              aria-label="Geef hartje voor dit interview"
            >
              <Heart size={18} aria-hidden /> {interview.like_count}
            </button>
            <button
              type="button"
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
