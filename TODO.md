# TODO

## Goal

Fase 2 - Marketingkalender & AI Studio voor Stuk Verdriet.

Deze fase richt zich op het bouwen van een volledig functionele marketingkalender en AI Studio-omgeving voor Stuk Verdriet. De implementatie omvat database-architectuur, backend-integratie en een geavanceerde frontend-interface met real-time CRUD-operaties. Het doel is om content-managers in staat te stellen om marketing-items te plannen, AI-instellingen te configureren en automatisering-regels op te stellen zonder technische kennis.

## Tasks

- [x] **Database Schema & Migraties**
  - [x] Maak database-migratie voor `marketing_items`, `ai_settings` en `automations` tabellen
  - [x] Voeg RLS (Row Level Security) policies toe voor deze tabellen
  - [x] Voeg initiële singleton data toe voor `ai_settings`
  - Beschrijving: Dit onderdeel richt de databasestructuur in met essentiële tabellen voor marketing-items (planningsgegevens, content, metadata), AI-instellingen (prompts, tone-of-voice configuraties) en automatiseringsregels. Row Level Security zorgt ervoor dat gebruikers alleen hun eigen data kunnen zien en wijzigen, wat cruciaal is voor multi-tenant-veiligheid.

- [x] **Backend Actions & Models**
  - [x] Voeg types toe in `src/types/content.ts` voor de nieuwe modellen
  - [x] Implementeer Server Actions voor CRUD-operaties in `src/lib/admin-operations.ts`
  - Beschrijving: Backend-layer met TypeScript-types en Server Actions voor veilige communicatie tussen frontend en database. Dit omvat create, read, update en delete-operaties voor alle drie de tabeltypen met proper error handling en validatie.

- [x] **Frontend Admin UI - Marketingkalender**
  - [x] Bouw live CRUD interface in `MarketingCalendar` (toevoegen, bewerken, verwijderen)
  - [x] Drill props en realtime updates in `page.tsx`
  - [x] Verwijder alle static placeholders ("Planning volgt") en alert banners
  - Beschrijving: De marketingkalender biedt een intuïtieve interface voor het plannen van marketing-campagnes en content-releases. Met live updates kunnen beheerders in real-time items toevoegen, wijzigen of verwijderen, waarbij de interface onmiddellijk de database synchroniseert.

- [x] **Frontend Admin UI - AI Studio & Automation Builder**
  - [x] Bouw live prompt- en tone-of-voice persistente bewaarfunctionaliteit
  - [x] Implementeer de laagdrempelige "AI Automation Builder" met volledige trigger/actie/beschrijving database CRUD
  - [x] Verwijder alle static placeholders en roadmap alerts
  - Beschrijving: De AI Studio stelt beheerders in staat om AI-configuraties op te slaan, waaronder custom prompts en tone-of-voice settings. De Automation Builder biedt een low-code interface voor het definiëren van automatiseringsregels met triggers, acties en beschrijvingen, volledig persistent in de database.

- [x] **Eindcontrole & Opschonen**
  - [x] Verifieer build, linting en typechecking (`npx tsc --noEmit` succesvol doorstaan!)
  - Beschrijving: Finalisering met grondige controle op code-kwaliteit, build-integriteit en type-safety. Alle linting-waarschuwingen worden opgelost en de applicatie doorstaat TypeScript-typechecking zonder fouten.

## Completion Marker

ALL_TASKS_COMPLETE: true

## Current Ralph Task - Homepage community

- [x] Bestaande sectie, lange berichttitel en SNAAR-assets inspecteren
- [x] Responsive SNAAR-banner met live-status en logo bouwen
- [x] Vaste slogan en ondersteunende tekst exact behouden
- [x] Communitykaarttitels kleiner en stabiel maken
- [x] Visuele QA uitvoeren op 320px, 375px, 390px en desktop
- [x] Tests, lint, typecheck en productiebuild uitvoeren
- [x] Eindcontrole en Ralph-log afronden
