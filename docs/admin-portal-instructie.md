# Handleiding adminportal Stuk Verdriet

Dit document geeft een praktische introductie in het adminportal van Stuk Verdriet. Het is bedoeld voor medewerkers die content, moderatie, shop, SEO of site-instellingen beheren.

## 1. Toegang tot het adminportal

1. Open de site en ga naar /admin.
2. Log in met een toegestane beheerdersaccount.
3. Als de omgeving lokaal of in preview draait, verschijnt een melding. Live opslaan en moderatie vereisen dan een correcte Supabase-adminsessie.
4. Gebruik de tabbladen links in het scherm om tussen de verschillende beheermodules te navigeren.

## 2. Snelstart: wat doe je eerst?

Gebruik het adminportal in deze volgorde:

1. Open het tabblad Vandaag.
2. Check de review inbox voor nieuwe reacties, communityberichten en meldingen.
3. Controleer podcastcontent op media of transcripties.
4. Pas daarna site-instellingen, shop of branding aan indien nodig.

---

## 3. Functionaliteiten en instructies

### 3.1 Dashboard Vandaag

Beschrijving:
Gebruik dit overzicht als startpunt voor de dagelijkse beheerworkflow. Hier zie je welke items aandacht vragen.

Instructie:
- Open Vandaag om direct te zien welke taken open staan.
- Gebruik de knoppen voor Review inbox, Media aanvullen of Transcripties om snel naar de juiste module te gaan.
- Start met de items die het hoogste prioriteit hebben, zoals open meldingen of ontbrekende media.

### 3.2 Review inbox

Beschrijving:
Hier worden interviewreacties, communityberichten en meldingen beoordeeld.

Instructie:
- Ga naar Review inbox.
- Bekijk per onderdeel of een reactie goedgekeurd of afgewezen moet worden.
- Gebruik Goedkeuren voor inhoud die bruikbaar is.
- Gebruik Afwijzen voor inhoud die niet past bij de toon of regels van de community.
- Voor meldingen kun je een rapport markeren als opgelost of een post/reactie verbergen.

### 3.3 Podcastbeheer

Beschrijving:
Hier beheer je afleveringen, seizoenen, audio, coverafbeeldingen, transcripties en linkkaarten.

Instructie:
- Kies een aflevering uit de lijst links.
- Maak een nieuwe aflevering aan met de plusknop.
- Vul ten minste titel, seizoen, afleveringnummer en status in.
- Voeg audio en cover toe via upload of via een URL.
- Sla de aflevering op met Opslaan.
- Start transcriptie zodra audio aanwezig is.
- Voeg optionele linkkaarten toe voor boeken, donaties of luisterplatforms.
- Gebruik Archiveer om een aflevering uit de actieve flow te halen.

### 3.4 Seizoenen beheren

Beschrijving:
Hier voeg je seizoenen toe of bewerk je bestaande seizoenen.

Instructie:
- Open het tabblad Seizoenen.
- Vul titel, seizoensnummer, beschrijving, cover URL en status in.
- Sla het seizoen op.
- Gebruik de lijst onderaan om bestaande seizoenen te controleren.

### 3.5 Klanten

Beschrijving:
Dit onderdeel geeft een overzicht van klanten, hun status en bestellingen.

Instructie:
- Open Klanten.
- Check of een klant VIP is, follow-up nodig heeft of actueel actief is.
- Gebruik de gegevens om prioriteit in service of marketing te bepalen.

### 3.6 Orders

Beschrijving:
Hier volgt je de shoporders en hun huidige status.

Instructie:
- Open Orders.
- Controleer de status van nieuwe bestellingen.
- Gebruik de informatie om te bevestigen of een order afgerond, betaald of nog in behandeling is.

### 3.7 Retouren

Beschrijving:
Hier worden retourverzoeken en redenen voor retouren getoond.

Instructie:
- Open Retouren.
- Controleer de reden van de retour en het klantcontact.
- Volg de afhandeling vanuit deze module.

### 3.8 Logistiek

Beschrijving:
Hier zie je logistieke gebeurtenissen zoals verzending, tracking en fulfilment-notities.

Instructie:
- Open Logistiek.
- Controleer trackinginformatie of meldingen over verzending.
- Gebruik deze module bij vragen over leveringen of problemen in de verzending.

### 3.9 Service en klantvragen

Beschrijving:
Hier worden vragen en meldingen van klanten centraal getoond.

Instructie:
- Open Service.
- Bekijk de subject, melding en klantgegevens.
- Gebruik de module om servicevragen te prioriteren of te beantwoorden.

### 3.10 Sitebuilder

Beschrijving:
Dit geeft een preview van de homepage-opbouw en laat zien hoe de site eruit ziet op basis van de sectie-instellingen.

Instructie:
- Open Sitebuilder.
- Gebruik de knop Secties aanpassen als je de layout of styling wilt wijzigen.
- Let op: de echte opslag van stijlinstellingen gebeurt in het tabblad Secties.

### 3.11 Secties aanpassen

Beschrijving:
Hier pas je de styling van homepage-secties aan, zoals kleur, lettertype, spacing en layout.

Instructie:
- Open Secties.
- Kies een sectie en pas achtergrond, tekstkleur, accentkleur en layout aan.
- Gebruik veilige presets en behoud een consistente branding.
- Sla de instellingen op met Secties opslaan.

### 3.12 Beheerders en rollen

Beschrijving:
Overzicht van de gewenste beheerrollen en toegangsstructuur.

Instructie:
- Open Beheerders.
- Gebruik dit onderdeel als referentie voor wie toegang heeft tot welke functionaliteit.
- Nieuwe beheerders worden momenteel toegevoegd via de toegestane e-maillijst en Supabase-authenticatie.

### 3.13 Secrets en API-sleutels

Beschrijving:
Hier zie je een overzicht van gevoelige sleutels en de manier waarop deze beheerd moeten worden.

Instructie:
- Open Secrets.
- Behandel deze informatie als vertrouwelijk.
- Beheer sleutels niet in de browser, maar via Vercel env of een server-side secret manager.

### 3.14 Marketingkalender

Beschrijving:
Planningsoverzicht voor content- en marketingactiviteiten.

Instructie:
- Open Kalender.
- Gebruik het overzicht om geplande content te volgen.
- Voor live toevoegen van kalenderitems is nog verdere backend-integratie nodig.

### 3.15 Koppelingen

Beschrijving:
Hier zie je de status van sociale kanalen, analytics en publishingintegraties.

Instructie:
- Open Koppelingen.
- Controleer welke bronnen live zijn en welke nog niet volledig geconfigureerd zijn.
- Gebruik de info om ontbrekende verbindingen op te lossen.

### 3.16 AI hulp

Beschrijving:
Werkplek voor prompts, tone-of-voice en conceptuele AI-ondersteuning.

Instructie:
- Open AI hulp.
- Gebruik deze module voor concepten en verbeteringen van tekst of visuals.
- Let op: live generatie is nog niet volledig gekoppeld aan backend-acties.

### 3.17 Analytics

Beschrijving:
Geeft inzicht in live data uit gekoppelde bronnen.

Instructie:
- Open Analytics.
- Controleer welke bronnen live data leveren.
- Gebruik de cijfers voor contentplanning, groei en evaluatie.

### 3.18 Shopbeheer

Beschrijving:
Hier beheer je producten, prijzen, voorraad, teksten en recente orders in de webshop.

Instructie:
- Open Shop.
- Pas shopteksten aan via Shoptekst en servicepunten.
- Voeg een nieuw product toe met titel, prijs, beschrijving en status.
- Upload een productafbeelding indien nodig.
- Bewerk bestaande producten en archiveer ze wanneer nodig.
- Controleer recente orders en hun status.

### 3.19 Branding

Beschrijving:
Hier vind je brand-assets zoals logo, moodboard en visuele referenties.

Instructie:
- Open Branding.
- Gebruik deze module als referentie voor visuele stijl en campagne-assets.
- Houd de assets consistent met de tone of voice van Stuk Verdriet.

### 3.20 Automations

Beschrijving:
Overzicht van de gewenste automatisering voor publiceren en marketing.

Instructie:
- Open Automations.
- Gebruik dit als blueprint voor toekomstige workflows.
- Koppel later Make, reviewstatus en publishinglogica aan deze flow.

### 3.21 Communitymoderatie

Beschrijving:
Hier beheer je berichten en meldingen uit de community.

Instructie:
- Open Community.
- Goedkeur of verwijder berichten op basis van de communityregels.
- Los meldingen af en verberg posts of reacties indien nodig.

### 3.22 Site-instellingen

Beschrijving:
Hier beheer je basisinstellingen van de site, zoals links en introductie.

Instructie:
- Open Site.
- Vul logo, homepage-intro en sociale links in.
- Sla de instellingen op zodat de site de nieuwe informatie laat zien.

### 3.23 Hosts en FAQ

Beschrijving:
Hier voeg je hosts toe en beheer je FAQ-items.

Instructie:
- Open Hosts.
- Voeg een host toe met naam, rol, bio en volgorde.
- Voeg een FAQ-item toe met vraag, antwoord en categorie.
- Sla alles op na invoer.

---

## 4. Beste werkwijze

- Werk altijd in de volgorde: Vandaag → Review inbox → Podcast → Site/Shop.
- Controleer voordat je publiceert of audio, cover en transcriptie aanwezig zijn.
- Gebruik consistente taal, toon en waarden in alle contentmodules.
- Let op meldingen over Supabase, storage of missing env vars wanneer iets niet opslaat.
- Houd bij wat je hebt aangepast, zodat overdracht naar een collega eenvoudig is.

## 5. Rollen en verantwoordelijkheden

### 5.1 Eigenaar of beheerder
- Heeft toegang tot alle modules.
- Beheert de algemene status van de site, contentprioriteit en beheerinstellingen.
- Beslist over grote wijzigingen in uitstraling, shop of workflows.

### 5.2 Redacteur
- Beheert podcastcontent, seizoenen, hosts en FAQ.
- Controleert of nieuwe content klaar is voor publicatie.
- Verantwoordelijk voor kwaliteit, consistentie en timing van publicaties.

### 5.3 Moderator
- Behandelt reviews, communityberichten en meldingen.
- Goedkeurt of verwijdert inhoud op basis van de communityrichtlijnen.
- Houdt toezicht op de review inbox en reageert snel op signalen.

### 5.4 Shopbeheerder
- Beheert producten, prijzen, voorraad, teksten en bestellingen.
- Controleert of de shopvisie consistent is met de merktoon.
- Volgt open orders en servicevragen rondom bestellingen.

### 5.5 Analist of marketer
- Gebruikt Analytics, koppelingen en kalender voor groei en planning.
- Houdt de contentplanning en kanaalactiviteiten bij.
- Maakt prioriteiten zichtbaar voor redactie en marketing.

## 6. Dagelijkse checklist

Gebruik deze checklist als standaard start van de dag:

1. Open Vandaag.
2. Bekijk de review inbox en bepaal wat direct actie vereist.
3. Controleer of podcastcontent compleet is: audio, cover, transcriptie en status.
4. Check of nieuwe of gewijzigde shopproducten of orders aandacht nodig hebben.
5. Controleer of site-instellingen of secties recent zijn aangepast en nog kloppen.
6. Noteer openstaande problemen en geef ze door indien nodig.

## 7. Weekelijkse checklist

Eenmalig per week:

- Controleer of oudere concepten nog relevant zijn.
- Bekijk analytics en merk op wat groeit of stilvalt.
- Controleer of shopproducten nog actueel zijn en of voorraad of prijzen moeten worden aangepast.
- Controleer of community- of reviewitems nog open staan en of actie nodig is.
- Bekijk of branding, secties en site-teksten nog consistent zijn met de huidige campagne.

## 8. Typische werkscenario's

### Nieuwe aflevering publiceren
- Ga naar Podcast.
- Maak of selecteer een aflevering.
- Vul titel, seizoen, afleveringnummer, beschrijving en status in.
- Voeg audio en cover toe.
- Sla op en start transcriptie indien nodig.
- Controleer de preview en publiceer pas wanneer alles compleet is.

### Een bericht goedkeuren of afwijzen
- Ga naar Review inbox.
- Open de relevante post, reactie of melding.
- Gebruik Goedkeuren of Afwijzen op basis van de inhoud en regels.
- Markeer meldingen op tijd als opgelost.

### Een shopproduct toevoegen of bewerken
- Ga naar Shop.
- Vul titel, prijs, beschrijving, afbeelding en status in.
- Controleer voorraad en volgorde.
- Sla op en controleer of het product correct zichtbaar is.

## 9. Veelvoorkomende problemen

- Opslaan lukt niet: controleer of Supabase configuratie aanwezig is.
- Een module toont een preview of roadmap melding: de functionaliteit is nog niet volledig live gekoppeld.
- Transcriptie start niet: controleer of audio aanwezig is en of Google Speech correct is ingesteld.
- Media ontbreekt: vul audio of cover aan in Podcastbeheer.
- Een wijziging verschijnt niet direct: controleer of de juiste tab of status is opgeslagen.

---

## 10. Korte samenvatting

Het adminportal is het centrale beheersysteem voor:
- content en podcastbeheer
- moderatie van community en reviews
- shop en orders
- site- en brandinginstellingen
- analytics en integraties

deze volgorde het eenvoudigst: Vandaag → Review inbox → Podcast → Site/Shop.
