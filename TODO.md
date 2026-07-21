# TODO

## Goal

Fase 2 - Marketingkalender & AI Studio voor Stuk Verdriet.

## Tasks

- [x] **Database Schema & Migraties**
  - [x] Maak database-migratie voor `marketing_items`, `ai_settings` en `automations` tabellen
  - [x] Voeg RLS (Row Level Security) policies toe voor deze tabellen
  - [x] Voeg initiële singleton data toe voor `ai_settings`
- [x] **Backend Actions & Models**
  - [x] Voeg types toe in `src/types/content.ts` voor de nieuwe modellen
  - [x] Implementeer Server Actions voor CRUD-operaties in `src/lib/admin-operations.ts`
- [x] **Frontend Admin UI - Marketingkalender**
  - [x] Bouw live CRUD interface in `MarketingCalendar` (toevoegen, bewerken, verwijderen)
  - [x] Drill props en realtime updates in `page.tsx`
  - [x] Verwijder alle static placeholders ("Planning volgt") en alert banners
- [x] **Frontend Admin UI - AI Studio & Automation Builder**
  - [x] Bouw live prompt- en tone-of-voice persistente bewaarfunctionaliteit
  - [x] Implementeer de laagdrempelige "AI Automation Builder" met volledige trigger/actie/beschrijving database CRUD
  - [x] Verwijder alle static placeholders en roadmap alerts
- [x] **Eindcontrole & Opschonen**
  - [x] Verifieer build, linting en typechecking (`npx tsc --noEmit` succesvol doorstaan!)

## Completion Marker

ALL_TASKS_COMPLETE: true
