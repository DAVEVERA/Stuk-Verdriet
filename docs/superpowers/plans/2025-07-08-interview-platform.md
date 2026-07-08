# Interview Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Transform the community section into a searchable, filterable interview platform with rich engagement features (likes, comments, shares) and a mobile-friendly popout modal for reading full interviews.

**Architecture:** 
- Create new `interviews` table in Supabase with metadata (tags, share_count, like_count, published_date)
- Build a client-side search + filter system with debounced search and sort options
- Replace community grid with interview cards (image + title + excerpt + engagement stats)
- Implement interview popout modal with full content, comments section, and interaction buttons
- Comments system allows nested replies with like/share functionality

**Tech Stack:** Next.js (React), TypeScript, Supabase, Lucide icons, Tailwind-adjacent CSS classes

## Global Constraints

- Mobile-first responsive design (320px minimum)
- Supabase public client for data fetching
- Maintain existing color palette (--pine, --sage, --sand, etc.)
- Interview images optimized with Next.js Image component
- Comment authentication via Supabase auth (existing)

---

## File Structure

**New files to create:**
- `src/types/interview.ts` – Interview and Comment type definitions
- `src/lib/interview-data.ts` – Data fetching functions for interviews
- `src/components/InterviewGrid.tsx` – Main grid layout with search/filter
- `src/components/InterviewCard.tsx` – Individual interview card component
- `src/components/InterviewPopout.tsx` – Popout modal with full interview
- `src/components/CommentsSection.tsx` – Comments display and form
- `src/components/CommentCard.tsx` – Individual comment with interactions
- `src/lib/interview-actions.ts` – Server actions for likes, comments, shares

**Files to modify:**
- `src/app/onepager.tsx` – Replace community section with interview section
- `src/app/globals.css` – Add styling for interview grid, search, filters, popout
- `src/lib/fallback-data.ts` – Add fallback interview data
- `src/types/content.ts` – Add Interview types to exports

---

## Task 1: Define Interview and Comment Types

**Files:**
- Create: `src/types/interview.ts`
- Modify: `src/types/content.ts`

**Interfaces:**
- Produces: `Interview`, `InterviewComment`, `InterviewEngagement` types for use in data fetching and components

- [ ] **Step 1: Create interview type definitions**

Create file `src/types/interview.ts`:

```typescript
export type Interview = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  full_content: string;
  cover_image_url: string | null;
  interviewee_name: string;
  publication_date: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  share_count: number;
  status: "published" | "draft";
};

export type InterviewComment = {
  id: string;
  interview_id: string;
  author_name: string | null;
  author_display_type: "anonymous" | "first_name" | "real_name";
  body: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  parent_comment_id: string | null;
  status: "approved" | "pending";
};

export type InterviewEngagement = {
  interview_id: string;
  user_id: string | null;
  has_liked: boolean;
  has_shared: boolean;
};
```

- [ ] **Step 2: Export Interview types from content.ts**

Edit `src/types/content.ts` and add at the bottom:

```typescript
export type { Interview, InterviewComment, InterviewEngagement } from "./interview";
```

- [ ] **Step 3: Commit**

```bash
git add src/types/interview.ts src/types/content.ts
git commit -m "feat: add interview and comment type definitions"
```

---

## Task 2: Create Fallback Interview Data

**Files:**
- Modify: `src/lib/fallback-data.ts`

**Interfaces:**
- Produces: `fallbackInterviews` array with 3-5 sample interviews for development/fallback

- [ ] **Step 1: Add fallback interviews array**

Edit `src/lib/fallback-data.ts` and add after the imports:

```typescript
import type { Interview } from "@/types/interview";

export const fallbackInterviews: Interview[] = [
  {
    id: "interview-1",
    title: "Leven na het verlies van mijn moeder",
    slug: "leven-na-verlies-moeder",
    excerpt: "Een eerlijk gesprek over rouw, herinnering en hoe je weitergaat zonder de persoon die je het meest dierbaar was.",
    full_content: `
# Leven na het verlies van mijn moeder

Dit is een diepgaand interview over het verliesproces en hoe we betekenis geven aan herinneringen.

## Het moment van afscheid

De eerste dagen waren surrealistisch. Ik kon niet geloven dat ze echt weg was...

## Hoe ik mezelf terug heb gevonden

Maanden gingen voorbij voordat ik kon lachen zonder me schuldig te voelen. Dat moment...
    `,
    cover_image_url: "https://images.unsplash.com/photo-1516979187457-635ffe35ff15?auto=format&fit=crop&w=800&q=80",
    interviewee_name: "Maria",
    publication_date: "2026-06-15",
    tags: ["verlies", "moeder", "rouw", "herinnering"],
    like_count: 24,
    comment_count: 7,
    share_count: 12,
    status: "published"
  },
  {
    id: "interview-2",
    title: "Kanker op jonge leeftijd: mijn verhaal",
    slug: "kanker-jong-verhaal",
    excerpt: "Op mijn 28e kreeg ik de diagnose kanker. Dit is hoe ik die reis heb doorstaan en wat ik daarvan heb geleerd.",
    full_content: `
# Kanker op jonge leeftijd: mijn verhaal

De diagnose was een schok die ik nooit zou kunnen vergeten...

## De behandeling

Zes maanden chemotherapie veranderden alles in mijn perspectief...
    `,
    cover_image_url: "https://images.unsplash.com/photo-1631217b0fbb-4dc-4d70-a9cd-8faae3b0d5ea?auto=format&fit=crop&w=800&q=80",
    interviewee_name: "Thomas",
    publication_date: "2026-05-20",
    tags: ["gezondheid", "kanker", "AYA", "hoop"],
    like_count: 42,
    comment_count: 15,
    share_count: 28,
    status: "published"
  },
  {
    id: "interview-3",
    title: "Mijn broer helpen door zijn rouw",
    slug: "broer-helpen-rouw",
    excerpt: "Als broer of zus van iemand die rouwt, weet je niet altijd wat je moet zeggen. Dit interview gaat over dat gevoel.",
    full_content: `
# Mijn broer helpen door zijn rouw

Je voelt je hulpeloos omdat je het verdriet van je dierbaren niet kunt wegnemen...

## Wat werkelijk hielp

Luisteren bleek meer waard dan troostende woorden...
    `,
    cover_image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    interviewee_name: "Sarah",
    publication_date: "2026-04-10",
    tags: ["familie", "steun", "naasten", "verbinding"],
    like_count: 18,
    comment_count: 5,
    share_count: 9,
    status: "published"
  }
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/fallback-data.ts
git commit -m "feat: add fallback interview data"
```

---

## Task 3: Create Interview Data Fetching Functions

**Files:**
- Create: `src/lib/interview-data.ts`

**Interfaces:**
- Produces: `getPublishedInterviews()`, `getInterviewBySlug(slug)`, `getInterviewsByTag(tag)` functions

- [ ] **Step 1: Create interview data fetching module**

Create file `src/lib/interview-data.ts`:

```typescript
import { fallbackInterviews } from "@/lib/fallback-data";
import { createSupabasePublicClient } from "@/lib/supabase";
import type { Interview } from "@/types/interview";

export async function getPublishedInterviews(): Promise<Interview[]> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallbackInterviews;

  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("status", "published")
    .order("publication_date", { ascending: false });

  if (error || !data) return fallbackInterviews;
  return data as Interview[];
}

export async function getInterviewBySlug(slug: string): Promise<Interview | null> {
  const interviews = await getPublishedInterviews();
  return interviews.find((interview) => interview.slug === slug) ?? null;
}

export async function getInterviewsByTag(tag: string): Promise<Interview[]> {
  const interviews = await getPublishedInterviews();
  return interviews.filter((interview) => interview.tags.includes(tag));
}

export function getAllInterviewTags(interviews: Interview[]): string[] {
  const tags = new Set<string>();
  interviews.forEach((interview) => {
    interview.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function filterInterviews(
  interviews: Interview[],
  {
    searchTerm = "",
    tags = [],
    sortBy = "newest"
  }: {
    searchTerm?: string;
    tags?: string[];
    sortBy?: "newest" | "oldest" | "most_shared" | "most_liked";
  }
): Interview[] {
  let filtered = [...interviews];

  // Filter by search term
  if (searchTerm.trim()) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (interview) =>
        interview.title.toLowerCase().includes(lower) ||
        interview.excerpt.toLowerCase().includes(lower) ||
        interview.interviewee_name.toLowerCase().includes(lower)
    );
  }

  // Filter by tags
  if (tags.length > 0) {
    filtered = filtered.filter((interview) =>
      tags.some((tag) => interview.tags.includes(tag))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime();
      case "most_shared":
        return b.share_count - a.share_count;
      case "most_liked":
        return b.like_count - a.like_count;
      case "newest":
      default:
        return new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime();
    }
  });

  return filtered;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/interview-data.ts
git commit -m "feat: add interview data fetching functions with filtering"
```

---

## Task 4: Create Interview Card Component

**Files:**
- Create: `src/components/InterviewCard.tsx`

**Interfaces:**
- Consumes: `Interview` type from `types/interview`
- Produces: `InterviewCard` React component that displays a single interview card with image, title, excerpt, tags, and engagement stats

- [ ] **Step 1: Create InterviewCard component**

Create file `src/components/InterviewCard.tsx`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InterviewCard.tsx
git commit -m "feat: add InterviewCard component"
```

---

## Task 5: Create Search & Filter Component

**Files:**
- Create: `src/components/InterviewSearchFilter.tsx`

**Interfaces:**
- Consumes: `Interview[]` array, all available tags
- Produces: `InterviewSearchFilter` component with search input and sort dropdown; emits `onSearch`, `onTagChange`, `onSortChange` callbacks

- [ ] **Step 1: Create InterviewSearchFilter component**

Create file `src/components/InterviewSearchFilter.tsx`:

```typescript
"use client";

import { useState, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";

type SortOption = "newest" | "oldest" | "most_shared" | "most_liked";

type InterviewSearchFilterProps = {
  tags: string[];
  onSearch: (searchTerm: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sortBy: SortOption) => void;
};

export function InterviewSearchFilter({
  tags,
  onSearch,
  onTagsChange,
  onSortChange
}: InterviewSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      onSearch(term);
    },
    [onSearch]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      const updated = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];
      setSelectedTags(updated);
      onTagsChange(updated);
    },
    [selectedTags, onTagsChange]
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as SortOption;
      setSortBy(value);
      onSortChange(value);
    },
    [onSortChange]
  );

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
    onTagsChange([]);
  }, [onTagsChange]);

  return (
    <div className="interview-search-filter">
      <div className="search-box">
        <Search size={18} aria-hidden className="search-icon" />
        <input
          type="text"
          placeholder="Zoek interviews..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Zoek interviews"
        />
      </div>

      <div className="filter-controls">
        <div className="tag-filter">
          <button
            className="tag-filter-button"
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            aria-expanded={showTagDropdown}
            aria-label="Filter op tags"
          >
            Tags
            <ChevronDown size={16} aria-hidden />
          </button>
          {showTagDropdown && (
            <div className="tag-dropdown">
              <div className="tag-dropdown-header">
                <span>Selecteer tags</span>
                {selectedTags.length > 0 && (
                  <button className="tag-clear-button" onClick={handleClearTags}>
                    Wis alles
                  </button>
                )}
              </div>
              <div className="tag-list">
                {tags.map((tag) => (
                  <label key={tag} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {selectedTags.length > 0 && <span className="tag-count">{selectedTags.length}</span>}
        </div>

        <div className="sort-filter">
          <label htmlFor="sort-select" className="sr-only">
            Sorteer interviews
          </label>
          <select id="sort-select" value={sortBy} onChange={handleSortChange} className="sort-select">
            <option value="newest">Nieuwste</option>
            <option value="oldest">Oudste</option>
            <option value="most_shared">Meest gedeeld</option>
            <option value="most_liked">Meeste hartjes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InterviewSearchFilter.tsx
git commit -m "feat: add InterviewSearchFilter component with search and sort"
```

---

## Task 6: Create Comments Section Component

**Files:**
- Create: `src/components/CommentsSection.tsx`
- Create: `src/components/CommentCard.tsx`

**Interfaces:**
- Consumes: `InterviewComment[]`, `interview_id: string`
- Produces: `CommentsSection` component displaying comments and comment form

- [ ] **Step 1: Create CommentCard component**

Create file `src/components/CommentCard.tsx`:

```typescript
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
```

- [ ] **Step 2: Create CommentsSection component**

Create file `src/components/CommentsSection.tsx`:

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CommentCard.tsx src/components/CommentsSection.tsx
git commit -m "feat: add comments and replies components"
```

---

## Task 7: Create Interview Popout Component

**Files:**
- Create: `src/components/InterviewPopout.tsx`

**Interfaces:**
- Consumes: `Interview`, `InterviewComment[]`, `isLoggedIn: boolean`
- Produces: `InterviewPopout` modal component showing full interview + comments section

- [ ] **Step 1: Create InterviewPopout component**

Create file `src/components/InterviewPopout.tsx`:

```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InterviewPopout.tsx
git commit -m "feat: add InterviewPopout modal component with actions"
```

---

## Task 8: Create Interview Grid Component

**Files:**
- Create: `src/components/InterviewGrid.tsx`

**Interfaces:**
- Consumes: `Interview[]`, all tags, `isLoggedIn: boolean`
- Produces: `InterviewGrid` component combining search, filter, grid layout, and popout management

- [ ] **Step 1: Create InterviewGrid component**

Create file `src/components/InterviewGrid.tsx`:

```typescript
"use client";

import { useState, useMemo } from "react";
import { InterviewCard } from "@/components/InterviewCard";
import { InterviewSearchFilter } from "@/components/InterviewSearchFilter";
import { InterviewPopout } from "@/components/InterviewPopout";
import { filterInterviews, getAllInterviewTags } from "@/lib/interview-data";
import type { Interview, InterviewComment } from "@/types/interview";

type InterviewGridProps = {
  interviews: Interview[];
  comments: Record<string, InterviewComment[]>;
  isLoggedIn: boolean;
  onCommentSubmit: (interviewId: string, body: string, parentCommentId?: string) => Promise<void>;
  onCommentLike: (commentId: string) => Promise<void>;
  onInterviewLike: (interviewId: string) => Promise<void>;
  onInterviewShare: (interviewId: string) => Promise<void>;
};

type SortOption = "newest" | "oldest" | "most_shared" | "most_liked";

export function InterviewGrid({
  interviews,
  comments,
  isLoggedIn,
  onCommentSubmit,
  onCommentLike,
  onInterviewLike,
  onInterviewShare
}: InterviewGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const allTags = useMemo(() => getAllInterviewTags(interviews), [interviews]);

  const filteredInterviews = useMemo(
    () =>
      filterInterviews(interviews, {
        searchTerm,
        tags: selectedTags,
        sortBy
      }),
    [interviews, searchTerm, selectedTags, sortBy]
  );

  return (
    <>
      <div className="interview-grid-container">
        <InterviewSearchFilter
          tags={allTags}
          onSearch={setSearchTerm}
          onTagsChange={setSelectedTags}
          onSortChange={setSortBy}
        />

        {filteredInterviews.length === 0 ? (
          <div className="interview-empty-state">
            <p>Geen interviews gevonden. Probeer je zoekterm of filters aan te passen.</p>
          </div>
        ) : (
          <div className="interview-grid">
            {filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onClick={() => setSelectedInterview(interview)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedInterview && (
        <InterviewPopout
          interview={selectedInterview}
          comments={comments[selectedInterview.id] ?? []}
          isLoggedIn={isLoggedIn}
          onClose={() => setSelectedInterview(null)}
          onCommentSubmit={(body, parentId) =>
            onCommentSubmit(selectedInterview.id, body, parentId)
          }
          onCommentLike={onCommentLike}
          onInterviewLike={() => onInterviewLike(selectedInterview.id)}
          onInterviewShare={() => onInterviewShare(selectedInterview.id)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InterviewGrid.tsx
git commit -m "feat: add InterviewGrid component with full interaction flow"
```

---

## Task 9: Create Server Actions for Interview Engagement

**Files:**
- Create: `src/lib/interview-actions.ts`

**Interfaces:**
- Produces: `likeInterview()`, `shareInterview()`, `submitInterviewComment()`, `likeComment()` server actions

- [ ] **Step 1: Create interview server actions**

Create file `src/lib/interview-actions.ts`:

```typescript
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
    .single();

  if (existingLike) {
    // Unlike
    await supabase.from("interview_likes").delete().eq("id", existingLike.id);
  } else {
    // Like
    await supabase.from("interview_likes").insert({
      interview_id: interviewId,
      user_id: user.user.id
    });
  }

  // Update like count
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

  // Increment share count
  const { data: interview, error } = await supabase
    .from("interviews")
    .select("share_count")
    .eq("id", interviewId)
    .single();

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

  // Update comment count
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
    .single();

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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/interview-actions.ts
git commit -m "feat: add server actions for interview engagement (likes, shares, comments)"
```

---

## Task 10: Add CSS Styling for Interview Components

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Adds styles for: interview grid, cards, search/filter, popout modal, comments

[CSS content continues in next message due to length...]

---

## Task 11: Update Onepager to Show Interview Section

**Files:**
- Modify: `src/app/onepager.tsx`
- Modify: `src/lib/content.ts`

[Content continues...]

---

## Task 12: Create Supabase Migration for Interview Tables

**Files:**
- Create: `supabase/migrations/20250708_create_interview_tables.sql`

[SQL content continues...]

---

## Task 13: Test Interview Feature End-to-End

**Files:**
- Test: Manual testing of all features

[Testing steps continue...]
