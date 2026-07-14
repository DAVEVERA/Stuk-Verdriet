# Stuk Verdriet Auth Branding

Gebruik deze waarden in Supabase Auth en Google Cloud OAuth, zodat bezoekers niet langer de database- of Supabase-projectnaam zien. Dit document is bedoeld als operationele checklist voor iedereen die de loginflow beheert of controleert. De instellingen staan deels in code, maar de belangrijkste zichtbare merkvelden worden beheerd in externe dashboards. Controleer daarom altijd zowel deze repo als Supabase Dashboard en Google Cloud Console voordat je concludeert dat de loginflow volledig is bijgewerkt.

De gewenste ervaring is simpel: bezoekers loggen in bij Stuk Verdriet, keren terug naar de juiste pagina en herkennen aan logo, afzender, domein en tekst dat ze nog steeds binnen dezelfde veilige omgeving zitten. Vermijd technische projectnamen, interne Supabase-labels en tijdelijke testnamen in schermen die gebruikers kunnen zien.

## Supabase

- Project name: `Stuk Verdriet`
- Site URL: productie-URL van de website, bij voorkeur `https://www.stukverdriet.com`
- Redirect URLs:
  - `https://stukverdriet.com/auth/callback`
  - `https://www.stukverdriet.com/auth/callback`
  - `https://stukverdriet.com/redirect`
  - `https://www.stukverdriet.com/redirect`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/redirect`
- Email sender name: `Stuk Verdriet`
- Email sender address: bijvoorbeeld `info@stukverdriet.com`
- Magic link template: `supabase/email-templates/magic-link.html`
- Password recovery template: `supabase/email-templates/reset-password.html`

Controleer na wijzigingen minimaal een Google-login, een e-mail magic link en een wachtwoordherstelmail. Let daarbij op de zichtbare afzender, de callback-URL, de terugkeer naar de bedoelde pagina en de sessiestatus na redirect. Als een login technisch slaagt maar de bezoeker nog als gast verschijnt, onderzoek dan de sessiepropagatie in de app voordat je opnieuw OAuth-instellingen wijzigt.

## Google OAuth Consent Screen

- App name: `Stuk Verdriet`
- User support email: klantadres of `info@stukverdriet.com`
- App logo: `public/brand/sverdriet_logo.webp`
- Authorized domain: [https://www.stukverdriet.com](https://www.stukverdriet.com)
- Privacy policy URL: [https://www.stukverdriet.com/privacy](https://www.stukverdriet.com/privacy)
- Terms URL: [https://www.stukverdriet.com/algemene-voorwaarden](https://www.stukverdriet.com/algemene-voorwaarden)

## Controlepunten

- De appnaam is overal `Stuk Verdriet`.
- De supportmail is bereikbaar en herkenbaar voor bezoekers.
- Privacyverklaring en algemene voorwaarden zijn live bereikbaar.
- Redirects bestaan voor productie, `www`, lokaal testen en de legacy `/redirect` route.
- De e-mailtemplates in deze repo sluiten aan op de tekst en toon van de website.
- De productie-URL in Supabase komt overeen met het actuele publieke domein.
- Google Cloud bevat het juiste logo en geen oude test- of projectnaam.

Deze instellingen staan buiten de repo en moeten in Supabase Dashboard en Google Cloud Console worden gezet. Documenteer dashboardwijzigingen kort in de deploymentnotities, zodat latere auth-problemen sneller herleidbaar zijn.
