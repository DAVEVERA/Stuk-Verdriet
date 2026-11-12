import assert from "node:assert/strict";
import test from "node:test";
import type { GovernanceSection } from "@/lib/governance";
import { rowToBoardMember, rowToFact, groupFacts, applyBoardComposition, type BoardMemberView } from "./governance-map.ts";

test("rowToBoardMember falls back to the display name and defaults", () => {
  const member = rowToBoardMember({
    name: "Susan",
    full_name: "   ",
    role: "Voorzitter",
    tagline: "Oprichtster.",
    image_url: "/img/suus.png",
    image_alt: null,
    object_position: null
  });

  assert.equal(member.name, "Susan");
  assert.equal(member.fullName, "Susan"); // empty full_name falls back to name
  assert.equal(member.image, "/img/suus.png");
  assert.equal(member.imageAlt, "Portret van Susan");
  assert.equal(member.objectPosition, "center 30%");
});

test("rowToBoardMember keeps a provided full name", () => {
  const member = rowToBoardMember({
    name: "Susan",
    full_name: "Susan Mathijssen",
    role: "Voorzitter",
    tagline: "",
    image_url: null,
    image_alt: "Portret",
    object_position: "center 38%"
  });
  assert.equal(member.fullName, "Susan Mathijssen");
  assert.equal(member.imageAlt, "Portret");
  assert.equal(member.objectPosition, "center 38%");
});

test("rowToFact only sets optional fields when present", () => {
  const bare = rowToFact({ group: "organisation", label: "Rechtsvorm", value: "Stichting", copy: false, copy_value: null, hint: null, href: null });
  assert.deepEqual(bare, { label: "Rechtsvorm", value: "Stichting" });

  const rich = rowToFact({ group: "banking", label: "IBAN", value: "NL47 RABO 0178 4871 63", copy: true, copy_value: "NL47RABO0178487163", hint: "t.n.v. de stichting", href: null });
  assert.equal(rich.copy, true);
  assert.equal(rich.copyValue, "NL47RABO0178487163");
  assert.equal(rich.hint, "t.n.v. de stichting");
});

test("groupFacts splits rows by group in order", () => {
  const groups = groupFacts([
    { group: "organisation", label: "KVK", value: "1", copy: false, copy_value: null, hint: null, href: null },
    { group: "banking", label: "IBAN", value: "NL..", copy: false, copy_value: null, hint: null, href: null },
    { group: "contact", label: "E-mail", value: "a@b.nl", copy: false, copy_value: null, hint: null, href: "mailto:a@b.nl" }
  ]);
  assert.equal(groups.organisation.length, 1);
  assert.equal(groups.contact.length, 1);
  assert.equal(groups.banking.length, 1);
  assert.equal(groups.contact[0].href, "mailto:a@b.nl");
});

test("applyBoardComposition replaces table rows and is a no-op for no members", () => {
  const sections: GovernanceSection[] = [
    {
      id: "bestuur",
      number: "01",
      title: "Bestuur",
      blocks: [
        { kind: "paragraph", text: "Inleiding." },
        { kind: "table", caption: "Samenstelling", columns: ["Naam", "Functie"], rows: [["Oud", "Voorzitter"]] }
      ]
    }
  ];
  const members: BoardMemberView[] = [
    { name: "Susan", fullName: "Susan Mathijssen", role: "Voorzitter", tagline: "", image: "", imageAlt: "", objectPosition: "" },
    { name: "Anita", fullName: "Anita Franken-Triemstra", role: "Penningmeester", tagline: "", image: "", imageAlt: "", objectPosition: "" }
  ];

  const applied = applyBoardComposition(sections, members);
  const table = applied[0].blocks[1];
  if (table.kind !== "table") throw new Error("expected a table block");
  assert.deepEqual(table.rows, [["Susan Mathijssen", "Voorzitter"], ["Anita Franken-Triemstra", "Penningmeester"]]);
  // Original is untouched (pure)
  const originalTable = sections[0].blocks[1];
  if (originalTable.kind !== "table") throw new Error("expected a table block");
  assert.deepEqual(originalTable.rows, [["Oud", "Voorzitter"]]);
  // No members -> unchanged reference
  assert.equal(applyBoardComposition(sections, []), sections);
});
