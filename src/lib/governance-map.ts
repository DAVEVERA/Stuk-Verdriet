import type { BoardMember, GovernanceFact, GovernanceSection } from "@/lib/governance";

// Pure mapping helpers for governance content. No runtime imports (only erased
// type imports) so this can be unit-tested with the plain node test runner, and
// is shared by the database-backed loaders and the admin layer.

/** Public board member plus the official full name used in the bestuur table. */
export type BoardMemberView = BoardMember & { fullName: string };

export type BoardMemberRow = {
  name: string;
  full_name: string | null;
  role: string;
  tagline: string;
  image_url: string | null;
  image_alt: string | null;
  object_position: string | null;
};

export function rowToBoardMember(row: BoardMemberRow): BoardMemberView {
  const name = row.name.trim();
  return {
    name,
    fullName: row.full_name?.trim() || name,
    role: row.role,
    tagline: row.tagline,
    image: row.image_url ?? "",
    imageAlt: row.image_alt?.trim() || `Portret van ${name}`,
    objectPosition: row.object_position?.trim() || "center 30%"
  };
}

export type GovernanceFactRow = {
  group: string;
  label: string;
  value: string;
  copy: boolean | null;
  copy_value: string | null;
  hint: string | null;
  href: string | null;
};

export function rowToFact(row: GovernanceFactRow): GovernanceFact {
  const fact: GovernanceFact = { label: row.label, value: row.value };
  if (row.copy) fact.copy = true;
  if (row.copy_value?.trim()) fact.copyValue = row.copy_value.trim();
  if (row.hint?.trim()) fact.hint = row.hint.trim();
  if (row.href?.trim()) fact.href = row.href.trim();
  return fact;
}

export type GovernanceFactGroups = {
  organisation: GovernanceFact[];
  contact: GovernanceFact[];
  banking: GovernanceFact[];
};

export function groupFacts(rows: GovernanceFactRow[]): GovernanceFactGroups {
  return {
    organisation: rows.filter((row) => row.group === "organisation").map(rowToFact),
    contact: rows.filter((row) => row.group === "contact").map(rowToFact),
    banking: rows.filter((row) => row.group === "banking").map(rowToFact)
  };
}

/**
 * Returns a copy of the given governance sections with every table block's rows
 * replaced by the current board composition (full name + role). This keeps the
 * bestuur page's composition table and the board cards in sync from a single
 * source. No members -> the sections are returned unchanged (code fallback).
 */
export function applyBoardComposition(
  sections: GovernanceSection[],
  members: BoardMemberView[]
): GovernanceSection[] {
  if (!members.length) return sections;
  const rows = members.map((member) => [member.fullName, member.role] as [string, string]);
  return sections.map((section) => ({
    ...section,
    blocks: section.blocks.map((block) => (block.kind === "table" ? { ...block, rows } : block))
  }));
}
