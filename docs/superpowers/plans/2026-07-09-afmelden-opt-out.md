# Afmelden / Data Deletion (opt-out) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give visitors a self-service footer link to permanently delete their email
address from Stuk Verdriet's Supabase lists (AVG right to erasure).

**Architecture:** A footer link points to a new `/afmelden` page holding a small form.
The form posts to a server action `requestDataDeletion` that validates + rate-limits the
request and, using the service-role client (RLS blocks anon on these tables), deletes the
address from both `episode_signups` and `interview_subscribers`. The action always redirects
to the same neutral confirmation so it never reveals whether the address was on a list.

**Tech Stack:** Next.js 16 App Router, React 19, server actions, `@supabase/supabase-js`
(service role), existing `src/lib/request-guard.ts` anti-abuse helpers.

## Global Constraints

- UI copy is Dutch; identifiers, code, comments, logs stay English.
- No new dependencies.
- Deletion runs only server-side via `createSupabaseAdminClient()` (service role). Never
  expose delete power to the anon key (no RLS delete policy, no anon-callable RPC).
- Neutral, enumeration-safe response: identical outcome whether or not the email existed.
- Reuse `assertSameOriginRequest`, `requestIpAddress`, `consumeRateLimit` from
  `src/lib/request-guard.ts`.
- **Testing reality:** the repo has no test runner (only `lint`, `typecheck`, `build`).
  Adding a framework for this feature is out of scope (YAGNI). Verification per task =
  `npx tsc --noEmit` + `npx eslint .` + `npx next build`, plus a manual flow check. Real
  deletion is verified on a Vercel preview (local `.env` has no `SUPABASE_SERVICE_ROLE_KEY`,
  so `createSupabaseAdminClient()` is null locally and deletion is a graceful no-op there).

## File Structure

- Create: `src/lib/privacy-actions.ts` — the `requestDataDeletion` server action (one job).
- Create: `src/app/afmelden/page.tsx` — the opt-out page (form + status messages).
- Modify: `src/app/globals.css` — a small scoped style block for the form.
- Modify: `src/components/ui.tsx` — add the footer link between the mailto and the AYA logo.

---

### Task 1: `requestDataDeletion` server action

**Files:**
- Create: `src/lib/privacy-actions.ts`

**Interfaces:**
- Consumes: `assertSameOriginRequest()`, `requestIpAddress()`, `consumeRateLimit(key, windowMs, max)` from `@/lib/request-guard`; `createSupabaseAdminClient()` from `@/lib/supabase`.
- Produces: `export async function requestDataDeletion(formData: FormData): Promise<void>` — used as a `<form action={...}>` handler. Always redirects to `/afmelden?status=done|invalid|rate-limited`.

- [ ] **Step 1: Create the server action**

Create `src/lib/privacy-actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { assertSameOriginRequest, consumeRateLimit, requestIpAddress } from "@/lib/request-guard";
import { createSupabaseAdminClient } from "@/lib/supabase";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const deleteWindowMs = 10 * 60 * 1000;
const deleteMax = 10; // verzoeken per 10 minuten per IP

// AVG-verwijdering: haalt een e-mailadres volledig uit beide mailinglijsten.
// Draait server-side met de service role (anon heeft geen le, laat staan
// verwijderrechten op deze tabellen). Antwoord is altijd neutraal: we geven
// nooit prijs of het adres bij ons bekend was.
export async function requestDataDeletion(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);

  if (!(await assertSameOriginRequest())) redirect("/afmelden?status=invalid");
  if (!emailPattern.test(email)) redirect("/afmelden?status=invalid");

  const ip = await requestIpAddress();
  if (!consumeRateLimit(`delete:ip:${ip}`, deleteWindowMs, deleteMax)) {
    redirect("/afmelden?status=rate-limited");
  }

  const admin = createSupabaseAdminClient();
  if (admin) {
    try {
      await admin.from("episode_signups").delete().eq("email", email);
      await admin.from("interview_subscribers").delete().eq("email", email);
    } catch {
      // best-effort; toon altijd de neutrale uitkomst hieronder
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.warn("[afmelden] geen service-role client (lokaal): verwijdering overgeslagen");
  }

  redirect("/afmelden?status=done");
}
```

Note: `redirect()` throws internally, so the success `redirect` sits OUTSIDE the try/catch; only the Supabase deletes are wrapped.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0 (no errors). If it complains the action is unused, that resolves in Task 2.

- [ ] **Step 3: Commit**

```bash
git add src/lib/privacy-actions.ts
git commit -m "feat(api): add requestDataDeletion opt-out server action"
```

---

### Task 2: `/afmelden` page

**Files:**
- Create: `src/app/afmelden/page.tsx`
- Modify: `src/app/globals.css` (append a scoped block)

**Interfaces:**
- Consumes: `requestDataDeletion` from `@/lib/privacy-actions`; `PageIntro` from `@/components/ui` (props: `eyebrow: string`, `title: string`, children).
- Produces: route `/afmelden` reachable by the footer link in Task 3.

- [ ] **Step 1: Create the page**

Create `src/app/afmelden/page.tsx`:

```tsx
import { PageIntro } from "@/components/ui";
import { requestDataDeletion } from "@/lib/privacy-actions";

export const dynamic = "force-dynamic";

type AfmeldenPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AfmeldenPage({ searchParams }: AfmeldenPageProps) {
  const params = (await searchParams) ?? {};
  const status = Array.isArray(params.status) ? params.status[0] : params.status ?? null;

  if (status === "done") {
    return (
      <PageIntro eyebrow="Privacy" title="Afmelden">
        <p>
          Als dit adres bij ons bekend was, hebben we het verwijderd. Je ontvangt geen
          berichten meer van ons.
        </p>
        <p>Wil je je later opnieuw aanmelden? Dat kan altijd via onze website.</p>
      </PageIntro>
    );
  }

  const errorMessage =
    status === "rate-limited"
      ? "Er zijn te veel verzoeken vanaf deze plek. Probeer het over een paar minuten opnieuw."
      : status === "invalid"
        ? "Vul een geldig e-mailadres in."
        : null;

  return (
    <>
      <PageIntro eyebrow="Privacy" title="Afmelden of gegevens verwijderen">
        <p>
          Wil je geen berichten meer ontvangen? Vul hieronder je e-mailadres in. We
          verwijderen het adres dan volledig uit onze lijsten. Je hoeft verder niets te doen.
        </p>
      </PageIntro>
      <section className="afmelden-section">
        <form className="afmelden-form" action={requestDataDeletion}>
          <label>
            E-mailadres
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <button className="button" type="submit">Verwijder mijn gegevens</button>
          {errorMessage ? <p className="signup-feedback">{errorMessage}</p> : null}
        </form>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Append scoped styles**

Append to `src/app/globals.css`:

```css
/* Afmelden / opt-out pagina */
.afmelden-section {
  max-width: 560px;
  margin: 0 auto;
  padding: 0 20px 64px;
}
.afmelden-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}
.afmelden-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 500;
}
.afmelden-form input {
  padding: 12px 14px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  font: inherit;
  width: 100%;
}
.afmelden-form .button {
  align-self: flex-start;
}
```

- [ ] **Step 3: Build**

Run: `npx next build`
Expected: build succeeds; route list shows `/afmelden`.

- [ ] **Step 4: Manual render check**

Run: `npx next dev` and open `http://localhost:3000/afmelden`.
Expected: heading + explanation + email field + "Verwijder mijn gegevens" button render.
Submit with a bogus address → lands on the neutral "hebben we het verwijderd" message
(no real deletion locally — service role absent — which is expected).
Visit `/afmelden?status=invalid` and `/afmelden?status=rate-limited` → correct hints show.

- [ ] **Step 5: Commit**

```bash
git add src/app/afmelden/page.tsx src/app/globals.css
git commit -m "feat(ui): add /afmelden opt-out page"
```

---

### Task 3: Footer link

**Files:**
- Modify: `src/components/ui.tsx` (the `Footer` function, between the `mailto:` anchor and the `footer-aya-link` anchor)

**Interfaces:**
- Consumes: `/afmelden` route from Task 2; `Link` (already imported in `ui.tsx`).

- [ ] **Step 1: Insert the link**

In `src/components/ui.tsx`, inside `Footer()`, locate:

```tsx
        <a className="quiet-link" href={`mailto:${site.email}`}>
          <Mail size={18} aria-hidden /> {site.email}
        </a>
        <a className="footer-aya-link" href="https://ayafonds.nl/" target="_blank" rel="noopener noreferrer" aria-label="Bezoek AYA Fonds">
```

Insert a new `Link` between the two anchors:

```tsx
        <a className="quiet-link" href={`mailto:${site.email}`}>
          <Mail size={18} aria-hidden /> {site.email}
        </a>
        <Link className="quiet-link footer-optout-link" href="/afmelden">
          Afmelden of gegevens verwijderen
        </Link>
        <a className="footer-aya-link" href="https://ayafonds.nl/" target="_blank" rel="noopener noreferrer" aria-label="Bezoek AYA Fonds">
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint .`
Expected: both exit 0.

- [ ] **Step 3: Build + visual check**

Run: `npx next build`, then `npx next dev` and scroll to the footer.
Expected: "Afmelden of gegevens verwijderen" appears just under the email address and above
the AYA logo, styled like the quiet email link; clicking it opens `/afmelden`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui.tsx
git commit -m "feat(ui): link opt-out page from footer"
```

---

### Task 4: Full verification + preview deletion test + review

**Files:** none (verification only)

- [ ] **Step 1: Full local gate**

Run: `npx tsc --noEmit && npx eslint . && npx next build`
Expected: all pass; `/afmelden` in the route list.

- [ ] **Step 2: Preview deletion test (real service role)**

On a Vercel preview (or with `SUPABASE_SERVICE_ROLE_KEY` set): insert a throwaway test
address into `episode_signups` (Supabase dashboard), submit it via `/afmelden`, and confirm
the row is gone from BOTH `episode_signups` and `interview_subscribers` (dashboard). Submit
an unknown address → same neutral message, no error.

- [ ] **Step 3: Confirm no anon delete path opened**

Re-run the anon probe (public key) to confirm `episode_signups`/`interview_subscribers` are
still unreadable and that no anon delete grant/RLS policy was added by this change.

- [ ] **Step 4: Request code review**

Use superpowers:requesting-code-review on the diff (footer link + page + action), focusing
on: enumeration-safety, the service-role/no-anon-delete guarantee, redirect-in-try/catch
correctness, and rate-limit reuse.

---

## Self-Review

- **Spec coverage:** footer link (Task 3), `/afmelden` page + neutral message (Task 2),
  full deletion from both tables via service role (Task 1), same-origin + rate limit +
  validation (Task 1), local graceful no-op + preview test (Global Constraints, Task 4),
  `interview_comments` out of scope (unchanged). All spec sections mapped.
- **Placeholder scan:** none — every step has full code/commands.
- **Type consistency:** `requestDataDeletion(formData: FormData): Promise<void>` defined in
  Task 1 and consumed as a form action in Task 2; `PageIntro` props match existing usage in
  `src/app/admin/page.tsx`. Status values `done|invalid|rate-limited` match between the
  action's redirects and the page's rendering.
