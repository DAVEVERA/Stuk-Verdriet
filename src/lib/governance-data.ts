import { createSupabasePublicClient } from "@/lib/supabase";
import {
  bankingFacts,
  bestuurSections,
  boardMembers,
  contactFacts,
  organisationFacts,
  type GovernanceSection
} from "@/lib/governance";
import {
  applyBoardComposition,
  groupFacts,
  rowToBoardMember,
  type BoardMemberRow,
  type BoardMemberView,
  type GovernanceFactGroups,
  type GovernanceFactRow
} from "@/lib/governance-map";

const BOARD_COLUMNS = "name, full_name, role, tagline, image_url, image_alt, object_position";
const FACT_COLUMNS = "\"group\", label, value, copy, copy_value, hint, href";

// Code fallback: the hardcoded board cards carry no separate full name.
const staticBoardView: BoardMemberView[] = boardMembers.map((member) => ({ ...member, fullName: member.name }));

const staticFactGroups: GovernanceFactGroups = {
  organisation: organisationFacts,
  contact: contactFacts,
  banking: bankingFacts
};

async function fetchBoardRows(): Promise<BoardMemberRow[] | null> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("board_members")
    .select(BOARD_COLUMNS)
    .eq("status", "published")
    .order("display_order", { ascending: true });
  if (error || !data?.length) return null;
  return data as BoardMemberRow[];
}

/**
 * Published board members. Prefers the database so the foundation can manage the
 * bestuur from the admin portal; falls back to the bundled data when Supabase is
 * unavailable or the table is empty/missing.
 */
export async function getBoardMembers(): Promise<BoardMemberView[]> {
  const rows = await fetchBoardRows();
  if (!rows) return staticBoardView;
  return rows.map(rowToBoardMember);
}

export async function getGovernanceFacts(): Promise<GovernanceFactGroups> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return staticFactGroups;
  const { data, error } = await supabase
    .from("governance_facts")
    .select(FACT_COLUMNS)
    .eq("status", "published")
    .order("display_order", { ascending: true });
  if (error || !data?.length) return staticFactGroups;
  return groupFacts(data as GovernanceFactRow[]);
}

/**
 * The bestuur sections, with the "Samenstelling van het bestuur" table driven by
 * the database board members (single source of truth, so the table and the
 * board cards cannot drift apart). The surrounding prose stays in code. Falls
 * back to the fully hardcoded sections when there are no database members.
 */
export async function getBestuurSections(): Promise<GovernanceSection[]> {
  const rows = await fetchBoardRows();
  if (!rows) return bestuurSections;
  return applyBoardComposition(bestuurSections, rows.map(rowToBoardMember));
}
