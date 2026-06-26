# Stuk Verdriet Auth Branding

Gebruik deze waarden in Supabase Auth en Google Cloud OAuth, zodat bezoekers niet langer de database- of Supabase-projectnaam zien.

## Supabase

- Project name: `Stuk Verdriet`
- Site URL: productie-URL van de website
- Redirect URLs:
  - `https://stukverdriet.nl/auth/callback`
  - `https://joustukverdrietwdomein.nl/redirect`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/redirect`
- Email sender name: `Stuk Verdriet`
- Email sender address: bijvoorbeeld `@stukverdriet.nl`
- Magic link template: `supabase/email-templates/magic-link.html`
- Password recovery template: `supabase/email-templates/reset-password.html`

## Google OAuth Consent Screen

- App name: `Stuk Verdriet`
- User support email: klantadres of `info@stukverdriet.nl`
- App logo: `public/brand/sverdriet_logo.webp`
- Authorized domain: productiedomein van Stuk Verdriet
- Privacy policy URL: `/privacy`
- Terms URL: `/algemene-voorwaarden`

Deze instellingen staan buiten de repo en moeten in Supabase Dashboard en Google Cloud Console worden gezet.
