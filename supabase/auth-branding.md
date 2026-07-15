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
  - `http://localhost:3000/**`
  - `http://localhost:3002/auth/callback`
  - `http://localhost:3002/**`
  - `http://127.0.0.1:3000/**`
  - `http://127.0.0.1:3002/**`
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

## Waarom deze instellingen belangrijk zijn

De authenticatieflow is voor veel bezoekers het eerste moment waarop zij buiten de normale websiteomgeving komen. Een afwijkende projectnaam, technisch Supabase-label of onduidelijke afzender kan daardoor direct twijfel oproepen. Voor Stuk Verdriet is vertrouwen extra belangrijk, omdat bezoekers mogelijk persoonlijke verhalen, reacties of contactgegevens delen. De login moet daarom niet alleen technisch werken, maar ook voelen alsof hij hoort bij dezelfde rustige, zorgvuldige omgeving als de website.

Gebruik dit document als inhoudelijke controle bij elke wijziging aan login, magic links, Google OAuth, redirectgedrag of e-mailtemplates. Het doel is dat bezoekers een herkenbare afzender zien, begrijpen waarom zij inloggen en na het afronden van de login terugkomen op de pagina waar zij begonnen. Dat geldt voor de publieke community, het reactieformulier, toekomstige persoonlijke functies en de beheeromgeving.

## Reviewproces

Controleer wijzigingen in drie lagen. Eerst de repo: routes zoals `/auth/callback`, `/redirect`, `/login`, `/privacy` en `/algemene-voorwaarden` moeten blijven bestaan en mogen niet door een statische export of verkeerde deploytarget worden gebroken. Controleer daarna Supabase Dashboard: site-URL, redirect-URL's, e-mailafzender en templates moeten overeenkomen met de productieomgeving. Controleer tot slot Google Cloud Console: appnaam, supportmail, privacyverklaring, voorwaarden en geautoriseerd domein moeten publiek bereikbaar en consistent zijn.

Leg bij iedere dashboardwijziging vast wie de wijziging heeft gedaan, op welke datum, welke omgeving is geraakt en welke loginflow daarna is getest. Een korte notitie is voldoende, maar zonder notitie is later moeilijk te achterhalen of een fout uit code, Supabase, Google Cloud of DNS komt.

## Testscenario's

- Nieuwe bezoeker vraagt een magic link aan en komt na klikken terug op de bedoelde pagina.
- Bestaande gebruiker logt in met Google en blijft na redirect als ingelogd herkend.
- Bezoeker opent een verlopen of al gebruikte magic link en krijgt een begrijpelijke fout of nieuwe inlogmogelijkheid.
- Wachtwoordherstelmail bevat de juiste naam, afzender, link en toon.
- Privacyverklaring en algemene voorwaarden zijn bereikbaar vanuit de OAuth consent screen links.
- Lokale ontwikkeling blijft mogelijk via `localhost`, zonder productie-redirects te breken.

## Content- en privacyrichtlijnen

Schrijf auth-teksten menselijk en concreet. Vermijd technische termen zoals project reference, anon key, database, bucket of provider callback in zichtbare e-mails en schermen. Benoem liever wat de bezoeker doet: inloggen, terugkeren, reageren, verhaal delen of gegevens beheren. Vraag alleen gegevens die nodig zijn voor de functie en verwijs bij twijfel naar de privacyverklaring.

Als er nieuwe communityfuncties bijkomen, controleer dan opnieuw of de auth-ervaring past bij het doel van die functie. Een beheerlogin, communityreactie en privacyverzoek hebben elk een andere context, maar moeten allemaal herkenbaar blijven als Stuk Verdriet.

Deze instellingen staan buiten de repo en moeten in Supabase Dashboard en Google Cloud Console worden gezet. Documenteer dashboardwijzigingen kort in de deploymentnotities, zodat latere auth-problemen sneller herleidbaar zijn.
