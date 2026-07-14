# SOC 2 Readiness Baseline

Datum: 2026-07-14
Status: eerste interne baseline, geen auditverklaring

## Doel

Deze baseline legt vast wat Stuk Verdriet nu aantoonbaar heeft rondom security en privacy, en welke eerste gaps moeten worden gesloten voordat een SOC 2 Type I-readiness of externe auditor zinvol is.

SOC 2 is geen self-certification. Een formele SOC 2 Type I of Type II verklaring vereist een onafhankelijke auditor/CPA.

## Voorlopige Scope

In scope voor een eerste SOC 2-readiness traject:

- Publieke Next.js website op Vercel
- Adminomgeving onder `/admin`
- Supabase project voor auth, database, RLS en storage
- GitHub repository en deploymentproces naar Vercel
- Formulieren, podcast/community/interview data en nieuwsbrief/aanmelddata
- Cookie consent en analytics configuratie
- Secrets en environment variables in Vercel/Supabase/GitHub

Voorlopig buiten scope, tenzij later toegevoegd:

- Externe podcastplatformen zoals Spotify, Podimo en Apple Podcasts
- Social embeds/platformen zoals Instagram en TikTok
- Handmatige bedrijfsprocessen buiten de app, behalve waar ze toegang, incidenten of privacyverzoeken raken

## Gegevenscategorieen

Bekende data in of rond het systeem:

- Accountgegevens via Supabase Auth
- E-mailadressen voor aflevering/interview updates
- Community posts, reacties, meldingen en support/like events
- Interview comments en engagement counters
- Admin content zoals podcastafleveringen, hostprofielen, FAQ's en site settings
- Cookievoorkeuren en analytics events
- IP-adres/rate-limit signalen op serveractions waar van toepassing

Nog te valideren:

- Welke production Supabase tabellen live data bevatten
- Welke personen adminrechten hebben in Supabase, Vercel en GitHub
- Retentieperiode per datacategorie
- Of backups en restore-tests aantoonbaar zijn ingericht

## Huidige Aantoonbare Controls

Techniek die al zichtbaar in de repo staat:

- Security headers en CSP in `next.config.ts`
- Supabase RLS policies in `supabase/schema.sql` en migrations
- Server-only Supabase service-role usage via `src/lib/supabase.ts`
- Admin toegang via Supabase auth en `ADMIN_EMAILS` allowlist
- Privacy-, cookie-, algemene voorwaarden- en communityrichtlijnen pagina's
- Afmeld/verwijderflow ontwerp en serveraction voor persoonsgegevens
- Robots/sitemap en uitsluiting van admin/auth/login routes
- Vercel als productie deployment target

## Belangrijkste Gaps

Deze zaken ontbreken nog als auditbaar bewijs:

- Geen formeel informatiebeveiligingsbeleid
- Geen access review procedure voor GitHub, Vercel, Supabase en e-mail
- Geen onboarding/offboarding procedure
- Geen incident response procedure
- Geen change management policy met minimumregels voor review, test en deploy
- Geen vendor register met verwerkers, doel, data en DPA/SOC status
- Geen backup en restore-test bewijs
- Geen periodieke vulnerability/dependency review procedure
- Geen evidence register waarin screenshots/logs/policies per control worden bewaard
- Geen formele dataretentie matrix
- Geen SOC 2 control owner per domein

## Eerste Actie

De eerste echte stap is een access en data inventory:

1. Exporteer of noteer alle admins voor GitHub, Vercel, Supabase en domein/DNS.
2. Noteer per persoon: rol, reden voor toegang, MFA-status en eigenaar.
3. Leg alle production env vars vast als namen zonder geheime waarden.
4. Koppel elke datacategorie aan de tabel/service waar die staat.
5. Zet voor elke externe leverancier vast: doel, data, verwerker ja/nee, DPA aanwezig ja/nee, SOC rapport aanwezig ja/nee.

Output daarvan wordt het eerste auditbare bewijsstuk: `Access and Data Inventory`.

## 30 Dagen Plan

Week 1:

- Access and data inventory afronden
- Adminrechten opschonen
- MFA verplicht maken op GitHub, Vercel, Supabase en e-mail
- Vendor register starten

Week 2:

- Security policy, incident response, access control en change management policies schrijven
- Retentie matrix maken
- Secrets inventory maken zonder geheime waarden vast te leggen

Week 3:

- Backup en restore procedure documenteren
- Eerste restore-test uitvoeren en bewijs opslaan
- Dependency/security scan procedure vastleggen
- Logging/audit-log bronnen documenteren

Week 4:

- Eerste interne access review uitvoeren
- Evidence register vullen
- Gap assessment bijwerken
- Auditor/compliance-platform shortlist maken

## Veilige Externe Formulering

Totdat er een formeel rapport is:

"Wij zijn bezig met SOC 2-readiness en hebben security- en privacycontrols ingericht, maar beschikken momenteel nog niet over een SOC 2-attestatie."

Niet gebruiken:

"Wij zijn SOC 2 compliant."
