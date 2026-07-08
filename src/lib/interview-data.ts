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
