# Design: Opt-out / data deletion ("Afmelden")

Date: 2026-07-09
Status: Approved (direction)

## Context

Stuk Verdriet has collected ~131 real visitor email addresses (grieving people) in
Supabase, live. There is currently no way for a person to remove themselves. We need a
self-service opt-out in the footer so anyone can have their email erased. This is both an
AVG/GDPR obligation (right to erasure) and aligned with the owner's security-first stance:
less stored PII = less to leak.

Relevant existing facts:
- Email/PII lives in two tables: `episode_signups` (name, email UNIQUE, status, source) and
  `interview_subscribers` (name, email UNIQUE, interview_id).
- Both have RLS enabled with only an INSERT policy and **no SELECT policy**, so the anon key
  cannot read or modify them. Any deletion must therefore run server-side with the
  service-role client (which bypasses RLS).
- The `SUPABASE_SERVICE_ROLE_KEY` is set only in Vercel, not in local `.env` files.
- There is no email-sending pipeline (no Resend/nodemailer).
- Footer markup: `src/components/ui.tsx` `Footer()`, between the `mailto:` link
  (`info@stukverdriet.com`) and the AYA Fonds logo link.
- A shared server-side anti-abuse module already exists: `src/lib/request-guard.ts`
  (`consumeRateLimit`, `assertSameOriginRequest`, `requestIpAddress`).

## Goal / requirements

Functional:
1. A calm, respectful footer link, placed between the email address and the AYA logo, leading
   to a dedicated page `/afmelden`.
2. `/afmelden`: short Dutch explanation + email input + submit button.
3. On submit, the person's email is **fully deleted** from BOTH `episode_signups` and
   `interview_subscribers`.
4. The page always shows the same neutral confirmation regardless of whether the email
   existed: *"Als dit adres bij ons bekend was, hebben we het verwijderd."*

Non-functional / security:
5. Deletion capability is never exposed to the public anon key. It runs only inside a
   server action using the service-role client.
6. Same-origin check + per-IP rate limiting on the action (reuse `request-guard`) to slow
   scripted mass-deletion attempts.
7. No enumeration: identical response and timing-insensitive UX whether or not the address
   was present.
8. Email format validated server-side; input length capped.
9. No PII in logs (log counts/outcomes only, never the address).

AVG:
10. Scope = the two email-bearing marketing/notification tables. `interview_comments`
    (no email; often anonymous published content) is explicitly out of scope.

## Chosen approach: A — gated server action + service-role delete

Rejected alternatives:
- **B (SECURITY DEFINER RPC callable by anon):** would let the public anon key delete
  subscriber rows directly via REST, bypassing the app rate limiter. Unacceptable for 131
  sensitive rows.
- **C (request queue, admin deletes manually):** safest but not immediate and adds an admin
  surface. The owner chose an immediate, no-confirmation-email flow, so A fits better.

Accepted trade-off for A: a person who *guesses* an address can trigger its deletion via the
form (rate-limited). Harm is low — it only removes someone from a list (which AVG wants
anyway), and no emails are being sent yet.

## Components

1. **Footer link** — `src/components/ui.tsx` `Footer()`. A new `<Link href="/afmelden">`
   ("Afmelden of gegevens verwijderen") inserted between the `mailto:` anchor and the
   `footer-aya-link` anchor, styled quietly (reuse `quiet-link` or similar).

2. **Page** — `src/app/afmelden/page.tsx`. Server component rendering a small form that posts
   to the server action. Reads a `status` search param to show the neutral confirmation or an
   `invalid`/`rate-limited` message. Uses existing UI primitives (`PageIntro`, form styles).

3. **Server action** — new focused file `src/lib/privacy-actions.ts`:
   ```
   "use server"
   export async function requestDataDeletion(formData: FormData): Promise<void>
   ```
   Steps:
   - Parse + trim + lowercase email; validate with the shared email regex; cap length.
   - `assertSameOriginRequest()`; on failure redirect to `/afmelden?status=invalid`.
   - `requestIpAddress()` + `consumeRateLimit("delete:ip:<ip>", 10*60*1000, 10)`; on limit
     redirect to `/afmelden?status=rate-limited`.
   - On invalid email redirect to `/afmelden?status=invalid`.
   - `const admin = createSupabaseAdminClient()`.
     - If `admin` is null (no service-role, e.g. local dev): do not delete; still redirect to
       the neutral success (`/afmelden?status=done`) so no behavior/info differs. Log a dev
       warning.
     - Else: `await admin.from("episode_signups").delete().eq("email", email)` and
       `await admin.from("interview_subscribers").delete().eq("email", email)`. Ignore
       individual errors (best-effort), log outcome counts only.
   - Always redirect to `/afmelden?status=done`.

## Data flow

visitor → `/afmelden` form → POST `requestDataDeletion` (server) → same-origin + rate-limit
→ service-role DELETE on both tables → redirect `/afmelden?status=done` → neutral message.

## Error handling

- Missing/invalid email → `?status=invalid`, form re-shown with a gentle hint.
- Rate limited → `?status=rate-limited`, "probeer het over een paar minuten opnieuw".
- No service-role (local) → neutral success, dev-only console warning; real deletion happens
  on Vercel where the key is set.
- Supabase errors → swallowed server-side (best-effort), neutral success to the user, no
  stack traces or DB errors surfaced.

## Testing / verification

- Local: `tsc --noEmit`, `eslint .`, `next build` all pass; render `/afmelden` and submit to
  confirm the neutral flow and validation branches (deletion is a no-op locally without the
  service-role key).
- Preview (Vercel, service-role present): submit a known test address that was inserted for
  the test, confirm it is gone from both tables (checked via Supabase dashboard / service
  role), and that an unknown address returns the same neutral message.
- Confirm the anon key still cannot read the tables (existing probe) and cannot delete
  (no anon delete grant/policy added).

## Out of scope

- Confirmation-email / tokenized links (no email pipeline; owner chose no-confirmation).
- Deleting `interview_comments` or community content (no email stored there).
- Marking-as-unsubscribed (owner chose full deletion).
- A privacy statement / broader AVG documentation (recommended separately).

## Open considerations (non-blocking)

- Rate limiter is per-instance on Vercel serverless — first line of defence, not a hard
  guarantee. A shared store (Supabase table / Upstash) would strengthen it later.
- Optional: record an anonymous deletion-event count for AVG accountability (no address).
