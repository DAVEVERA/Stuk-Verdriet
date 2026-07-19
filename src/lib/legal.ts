import fs from "node:fs";
import path from "node:path";

const legalDocumentsDir = path.join(process.cwd(), "assets", "Documenten");

export function readLegalDocument(filename: string) {
  return fs.readFileSync(path.join(legalDocumentsDir, filename), "utf8").trim();
}

export const cookiePolicyText = `Cookieverklaring Stuk Verdriet

Laatst bijgewerkt: 19-07-2026

Stuk Verdriet gebruikt cookies en vergelijkbare technieken om de website goed, veilig en prettig te laten werken. In deze verklaring leggen we uit welke soorten cookies kunnen worden gebruikt, waarom dat gebeurt, op welke juridische grondslag dat gebeurt en hoe je jouw keuze kunt wijzigen.

1. Wat zijn cookies?

Cookies zijn kleine tekstbestanden die bij bezoek aan een website op je apparaat kunnen worden geplaatst. Vergelijkbare technieken zijn bijvoorbeeld localStorage, pixels, scripts en embedded spelers van externe platformen.

2. Welke soorten cookies gebruiken wij?

Noodzakelijke cookies

Deze cookies zijn nodig om de website technisch te laten werken. Denk aan beveiliging, sessies, login, formulierverwerking, communityfunctionaliteit, spambeperking en het onthouden van je cookievoorkeur.

Juridische reden: deze cookies zijn technisch noodzakelijk voor de gevraagde dienst. Voor deze cookies is geen toestemming nodig. De verwerking kan daarnaast gebaseerd zijn op het gerechtvaardigd belang om de website veilig en functioneel te houden.

Voorkeurscookies

Deze cookies onthouden keuzes die je zelf maakt, zoals je cookie-instelling of bepaalde interfacevoorkeuren.

Juridische reden: wanneer deze voorkeur nodig is om jouw keuze uit te voeren, is dit noodzakelijk voor de gevraagde functie. Voor bredere voorkeuren vragen wij toestemming wanneer dat wettelijk vereist is.

Statistische cookies

Deze cookies kunnen helpen om te begrijpen hoe de website wordt gebruikt, welke pagina's worden bezocht en waar technische verbeteringen nodig zijn. Stuk Verdriet gebruikt deze gegevens alleen op geaggregeerd niveau waar mogelijk.

Juridische reden: voor niet-noodzakelijke statistische cookies vragen wij toestemming. Als statistieken volledig privacyvriendelijk en zonder herleidbare tracking worden ingericht, kan een gerechtvaardigd belang van toepassing zijn.

Marketing- en trackingcookies

Stuk Verdriet gebruikt geen marketingcookies om bezoekers onnodig te volgen. Als in de toekomst tracking voor campagnes, social media of advertentieplatformen wordt toegevoegd, gebeurt dit alleen na toestemming wanneer dat wettelijk vereist is.

Juridische reden: toestemming.

Embedded content en externe platformen

De website kan verwijzen naar of gebruikmaken van externe platformen zoals Spotify, Podimo, Apple Podcasts, Instagram, Facebook, TikTok, YouTube of andere diensten. Als je zulke content opent of afspeelt, kunnen deze partijen zelf cookies of vergelijkbare technieken gebruiken.

Juridische reden: voor niet-noodzakelijke externe cookies vragen wij toestemming waar dat nodig is. Voor externe platformen gelden ook hun eigen privacyverklaringen en cookievoorwaarden.

3. Google Analytics

Als Google Analytics of een vergelijkbare analysetool is ingesteld, wordt deze pas geladen nadat je toestemming hebt gegeven voor statistische cookies.

4. Cookievoorkeur onthouden

Wij bewaren jouw cookievoorkeur zodat we je keuze kunnen respecteren. Dit gebeurt lokaal in je browser. Deze voorkeur is noodzakelijk om jouw keuze uit te voeren.

5. Toestemming intrekken of wijzigen

Je kunt je toestemming altijd wijzigen door je browsergegevens of localStorage voor deze website te wissen. Daarna verschijnt de cookiemelding opnieuw. In een latere versie kan hiervoor ook een vaste knop op de website worden toegevoegd.

6. Browserinstellingen

Je kunt cookies ook blokkeren of verwijderen via je browserinstellingen. Houd er rekening mee dat sommige onderdelen van de website dan minder goed kunnen werken.

7. Persoonsgegevens

Als cookies persoonsgegevens verwerken, gebeurt dat volgens de privacyverklaring van Stuk Verdriet. Daarin staat welke gegevens worden verwerkt, waarom dat gebeurt, hoe lang gegevens worden bewaard en welke rechten je hebt.

8. Contact

Voor vragen over cookies of privacy kun je contact opnemen via:

info@stukverdriet.nl

9. Webshop en checkout

Voor het bewaren van een cookievoorkeur en voor technisch noodzakelijke beveiligings- of sessiecookies in de webshop is geen toestemming nodig als deze cookies strikt nodig zijn voor de gevraagde dienst.

Voor trackingcookies, marketingcookies en niet-noodzakelijke analytische cookies vragen wij toestemming voordat deze worden geplaatst. De webshop blijft bruikbaar als je deze cookies weigert.

10. Bewaartermijnen per cookie

De concrete cookienamen, aanbieders, doelen en bewaartermijnen moeten definitief worden ingevuld zodra de webshop en alle meet- en betaaltools definitief zijn ingericht.`;
