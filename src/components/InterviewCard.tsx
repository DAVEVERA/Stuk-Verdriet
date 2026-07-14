"use client";

import Image from "next/image";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { useRef, useState } from "react";
import type { Interview } from "@/types/interview";

type InterviewCardProps = {
  interview: Interview;
  isLoggedIn: boolean;
  onOpen: () => void;
  onLike: (shouldLike: boolean) => Promise<void>;
  onShare: () => Promise<void>;
  onCommentSubmit: (body: string) => Promise<void>;
};

function formatCardDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function InterviewCard({
  interview,
  isLoggedIn,
  onOpen,
  onLike,
  onShare,
  onCommentSubmit
}: InterviewCardProps) {
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(interview.like_count);
  const [shareCount, setShareCount] = useState(interview.share_count);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);

  const formattedDate = formatCardDate(interview.publication_date);
  const isContentAwareCover = interview.cover_image_url === "/img/DV.jpeg";

  const handleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
    onLike(nextLiked).catch(() => {
      // Niet ingelogd of database niet bereikbaar: de voorkeur blijft
      // lokaal zichtbaar voor deze sessie.
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/#interviews`;
    try {
      if (navigator.share) {
        await navigator.share({ title: interview.title, text: interview.excerpt, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Link gekopieerd!");
        setTimeout(() => setShareFeedback(null), 2500);
      }
      setShareCount((count) => count + 1);
      onShare().catch(() => {});
    } catch {
      // Delen geannuleerd door de gebruiker.
    }
  };

  const handleCommentSubmit = async () => {
    const body = comment.trim();
    if (!body || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCommentSubmit(body);
      setComment("");
      setCommentFeedback("Bedankt! Je reactie wacht op goedkeuring.");
    } catch {
      setCommentFeedback("Reageren is op dit moment niet mogelijk.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setCommentFeedback(null), 4000);
    }
  };

  return (
    <>
    <article className={expanded ? "interview-card expanded" : "interview-card"}>
      <header className="interview-card-header">
        <span className="interview-card-avatar">
          <Image src="/brand/sverdriet_logo.webp" alt="" width={40} height={40} />
        </span>
        <span className="interview-card-account">
          <strong>stukverdrietdepodcast</strong>
          <span>{interview.interviewee_name}</span>
        </span>
        <button type="button" className="interview-card-profile-button" onClick={onOpen}>
          Bekijk interview
        </button>
      </header>

      <button
        type="button"
        className={isContentAwareCover ? "interview-card-media interview-card-media-content-aware" : "interview-card-media"}
        onClick={onOpen}
        aria-label={`Lees interview: ${interview.title}`}
      >
        {interview.cover_image_url ? (
          <Image
            src={interview.cover_image_url}
            alt={interview.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <span className="interview-card-media-fallback">{interview.title}</span>
        )}
      </button>

      <button type="button" className="interview-card-viewmore" onClick={onOpen}>
        Lees het volledige interview
      </button>

      <div className="interview-card-actions">
        <button
          type="button"
          onClick={handleLike}
          aria-label={liked ? "Verwijder je medeleven" : "Toon je medeleven"}
          aria-pressed={liked ? "true" : "false"}
          className={liked ? "interview-like liked" : "interview-like"}
        >
          <Heart size={24} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => commentInputRef.current?.focus()}
          aria-label="Schrijf een reactie"
        >
          <MessageCircle size={24} aria-hidden />
        </button>
        <button type="button" onClick={handleShare} aria-label="Deel dit interview">
          <Send size={24} aria-hidden />
        </button>
        <button
          type="button"
          className="interview-card-bookmark"
          onClick={onOpen}
          aria-label="Open het interview"
        >
          <Bookmark size={24} aria-hidden />
        </button>
      </div>

      <div className="interview-card-body">
        <p className="interview-card-likes">
          {likeCount > 0
            ? `${likeCount} ${likeCount === 1 ? "iemand toonde" : "mensen toonden"} hun medeleven`
            : "Toon als eerste je medeleven"}
          {shareCount > 0 && <span className="interview-card-sharecount"> · {shareCount}x gedeeld</span>}
        </p>
        {shareFeedback && <p className="interview-card-feedback">{shareFeedback}</p>}
        {expanded ? (
          <div className="interview-card-caption-full">
            <p>
              <strong>stukverdrietdepodcast</strong> {interview.title}
            </p>
            {interview.full_content.split("\n").map((line, index) => {
              const text = line.replace(/^#+\s*/, "").trim();
              if (!text) return null;
              return line.startsWith("#") ? (
                <p key={index}>
                  <strong>{text}</strong>
                </p>
              ) : (
                <p key={index}>{text}</p>
              );
            })}
          </div>
        ) : (
          <p className="interview-card-caption">
            <strong>stukverdrietdepodcast</strong> {interview.title} — {interview.excerpt}
          </p>
        )}
        {formattedDate && <p className="interview-card-date">Datum: {formattedDate}</p>}
      </div>

      <div className="interview-card-comment-row">
        <input
          ref={commentInputRef}
          type="text"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleCommentSubmit();
          }}
          placeholder={isLoggedIn ? "Een opmerking toevoegen…" : "Een opmerking toevoegen (anoniem)…"}
          aria-label="Een opmerking toevoegen"
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={handleCommentSubmit}
          disabled={!comment.trim() || isSubmitting}
        >
          Plaatsen
        </button>
      </div>
      {commentFeedback && <p className="interview-card-comment-feedback">{commentFeedback}</p>}
    </article>
    <button
      type="button"
      className="insta-embed-toggle"
      onClick={() => setExpanded((value) => !value)}
    >
      {expanded ? "Toon minder" : "Lees meer…"}
    </button>
    </>
  );
}
