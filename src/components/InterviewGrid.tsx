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

  // Featured interview is the first one after filtering (if any)
  const featuredInterview = filteredInterviews.length > 0 ? filteredInterviews[0] : null;
  const gridInterviews = filteredInterviews.slice(1);

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
          <>
            {featuredInterview && (
              <div className="interview-featured-section">
                <InterviewCard
                  interview={featuredInterview}
                  onClick={() => setSelectedInterview(featuredInterview)}
                />
              </div>
            )}
            {gridInterviews.length > 0 && (
              <div className="interview-grid">
                {gridInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onClick={() => setSelectedInterview(interview)}
                  />
                ))}
              </div>
            )}
          </>
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
