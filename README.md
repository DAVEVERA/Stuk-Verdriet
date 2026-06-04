# Stuk Verdriet

Mobile-first Next.js website for Stuk Verdriet: podcast environment, moderated community, and protected content/admin surfaces backed by Supabase.

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=beheerder@example.nl
```

Without Supabase env vars, the site runs with fallback content so the design and routing can be reviewed locally.

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable Google and Apple OAuth providers in Supabase Auth.
4. Add the same admin email address to `ADMIN_EMAILS`.
5. Use Supabase Storage or external URLs for audio, episode images, host photos, sponsor logos, and atmosphere images.

## Content Rules

- The supplied brand files in `assets/design` are the visual source of truth.
- `sverdriet_logo.webp` is the canonical initial logo.
- Empty links, empty audio fields, empty images, unpublished content, and unavailable platform buttons are hidden.
- Video-channel and mail-signup modules are intentionally absent.
- Community posts and replies are pending until an admin approves them.
- Visible contact information is limited to `info@stukverdriet.nl`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
