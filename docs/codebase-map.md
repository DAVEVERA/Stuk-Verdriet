# Codebase Map

This project is a Next.js app with Supabase-backed podcast, community, and admin features.

## Runtime Tree

```text
proxy.ts              Next network-boundary proxy for Supabase session refresh
next.config.ts        Next build/runtime config, image allowlist, security headers
src/app/              App Router pages, route handlers, layout, fonts, global CSS
src/components/       Shared visual and interactive components
src/features/admin/   Admin-only UI surfaces
src/hooks/            Reusable client hooks
src/lib/              Server/client helpers, Supabase clients, actions, content loaders
src/types/            Shared domain types
public/               Browser-served static assets
supabase/             SQL schema, auth branding, email templates
scripts/              Local operational scripts
```

## Source And Archive Tree

```text
assets/               Source copy, raw design assets, article/legal source documents
archive/legacy/       Non-runtime legacy experiments kept for reference
docs/                 Maintained project documentation
```

## Hygiene Rules

- Runtime code goes under `src/`.
- Feature-specific UI belongs in `src/features/<feature>/` when it is not shared.
- Shared UI remains in `src/components/`.
- Browser-served files go in `public/`; raw/source-only files stay in `assets/`.
- Legacy experiments that are not loaded by the app belong in `archive/legacy/`.
- Supabase service-role usage stays server-only and admin-only unless a documented exception exists.
