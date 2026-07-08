"use client";

import { useState, useMemo } from "react";
import { InstagramEmbed } from "@/components/InstagramEmbed";
import { InterviewCard } from "@/components/InterviewCard";
import { InterviewSearchFilter } from "@/components/InterviewSearchFilter";
import { InterviewPopout } from "@/components/InterviewPopout";
import { filterInterviews, getAllInterviewTags } from "@/lib/interview-data";
import { instagramPostUrls } from "@/lib/instagram-posts";
import type { Interview, InterviewComment } from "@/types/interview";

type FeedItem =
  | { type: "interview"; interview: Interview }
  | { type: "instagram"; url: string };

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

  // Interleave Instagram posts between the interviews, Instagram-grid style
  const feedItems = useMemo(() => {
    const items: FeedItem[] = [];
    const instaQueue = [...instagramPostUrls];
    filteredInterviews.forEach((interview) => {
      items.push({ type: "interview", interview });
      const instaUrl = instaQueue.shift();
      if (instaUrl) items.push({ type: "instagram", url: instaUrl });
    });
    instaQueue.forEach((url) => items.push({ type: "instagram", url }));
    return items;
  }, [filteredInterviews]);

  return (
    <>
      <div className="interview-grid-container">
        <InterviewSearchFilter
          tags={allTags}
          onSearch={setSearchTerm}
          onTagsChange={setSelectedTags}
          onSortChange={setSortBy}
        />

        {filteredInterviews.length === 0 && (
          <div className="interview-empty-state">
            <p>Geen interviews gevonden. Probeer je zoekterm of filters aan te passen.</p>
          </div>
        )}

        {feedItems.length > 0 && (
          <div className="interview-grid">
            {feedItems.map((item) =>
              item.type === "interview" ? (
                <div className="interview-cell" key={item.interview.id}>
                  <InterviewCard
                    interview={item.interview}
                    isLoggedIn={isLoggedIn}
                    onOpen={() => setSelectedInterview(item.interview)}
                    onLike={() => onInterviewLike(item.interview.id)}
                    onShare={() => onInterviewShare(item.interview.id)}
                    onCommentSubmit={(body) => onCommentSubmit(item.interview.id, body)}
                  />
                </div>
              ) : (
                <InstagramEmbed key={item.url} permalink={item.url} />
              )
            )}
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
