import Image from "next/image";
import { Heart, MessageCircle, Send } from "lucide-react";
import type { Interview } from "@/types/interview";

type InterviewCardProps = {
  interview: Interview;
  onClick: () => void;
};

function formatCardDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function InterviewCard({ interview, onClick }: InterviewCardProps) {
  const formattedDate = formatCardDate(interview.publication_date);
  const sympathyLine =
    interview.like_count > 0
      ? `${interview.like_count} anderen toonden hun medeleven`
      : "Toon als eerste je medeleven";

  return (
    <article className="interview-card">
      <button
        type="button"
        className="interview-card-media"
        onClick={onClick}
        aria-label={`Lees interview: ${interview.title}`}
      >
        {interview.cover_image_url ? (
          <Image
            src={interview.cover_image_url}
            alt={interview.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <span className="interview-card-media-fallback">{interview.title}</span>
        )}
      </button>
      <div className="interview-card-bar">
        <div className="interview-card-icons">
          <Heart size={22} aria-hidden className="interview-icon-heart" />
          <MessageCircle size={22} aria-hidden />
          <Send size={22} aria-hidden />
          {formattedDate && <span className="interview-card-date">Datum: {formattedDate}</span>}
        </div>
        <p className="interview-card-sympathy">{sympathyLine}</p>
      </div>
      <div className="interview-card-buttons">
        <button type="button" onClick={onClick}>
          Een opmerking toevoegen…
        </button>
        <button type="button" onClick={onClick}>
          Plaatsen…
        </button>
      </div>
    </article>
  );
}
