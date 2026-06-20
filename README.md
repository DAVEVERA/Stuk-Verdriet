# Stuk Verdriet

Next.js website, podcastomgeving en community voor Stuk Verdriet.

## Setup

```bash
npm install
npm run dev
```

Maak lokaal een `.env` aan op basis van `.env.example`. Zet secrets alleen lokaal of in Vercel Environment Variables, niet in Git.

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run start
```

## Temporary Launch Mode

De publieke homepage wordt gestuurd door `SITE_MODE`.

```bash
npm run site:coming-soon
npm run site:live
```

Gebruik `npm run site:live` wanneer de tijdelijke “We zijn bijna live” pagina vervangen mag worden door de echte homepage.

Let op: als Vercel ook een `SITE_MODE` environment variable heeft, dan wint die tijdens deploys. Zet die dan ook op `live` of verwijder hem.

## Environment Variables

Publiek zichtbaar in de browser:

```bash
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Alleen server-side:

```bash
ADMIN_EMAILS=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=
GOOGLE_CLOUD_STORAGE_BUCKET=
GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON=
GOOGLE_APPLICATION_CREDENTIALS=
```

Gebruik nooit `NEXT_PUBLIC_` voor service role keys, private keys, tokens of service account JSON.

## Supabase

1. Maak of open het Supabase project.
2. Run `supabase/schema.sql` in de SQL editor.
3. Configureer Email en Google Auth in Supabase Auth.
4. Zet dezelfde beheerder(s) in `ADMIN_EMAILS`.
5. Voeg `SUPABASE_SERVICE_ROLE_KEY` alleen toe als server-side adminfuncties nodig zijn.

## Deployment Hygiene

Lokale tooling, editorconfig, agentmappen, screenshots, build output en secrets worden genegeerd via `.gitignore`.

Controleer voor iedere release:

```bash
git status --short --ignored
npm run typecheck
npm run lint
npm run build
```
