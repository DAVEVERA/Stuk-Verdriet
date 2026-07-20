# TODO

## Goal

Fase 1 - Core CMS (Rollen, Documentatie & Podcast Automations) voor Stuk Verdriet.

## Tasks

- [x] **Database Schema & Migraties**
  - [x] Maak database-migratie voor `admin_users` en `legal_documents` tabellen
  - [x] Voeg RLS (Row Level Security) policies toe voor deze tabellen
  - [x] Voeg initiële data toe (bijv. eerste admins gebaseerd op `ADMIN_EMAILS`)
- [x] **Backend Actions & Middelware**
  - [x] Implementeer Server Actions voor CRUD op `admin_users` en `legal_documents`
  - [x] Update `src/lib/supabase.ts` en `src/app/admin/page.tsx` om te verifiëren tegen de `admin_users` tabel in plaats van de omgevingsvariabele
- [x] **Frontend Admin UI (Teambeheer & Documentatie)**
  - [x] Maak Teambeheer module in AdminDashboard (admins toevoegen, verwijderen, rollen selecteren)
  - [x] Maak Documentatiebeheer module in AdminDashboard (documenten toevoegen, bewerken, verwijderen, zichtbaarheid togglen)
  - [x] Verbind UI formulieren met de nieuwe Server Actions
  - [x] Verwijder alle mock-data, waarschuwingen ("Alleen inventaris") en hardcoded alert-componenten uit de geüpdatete secties
- [x] **Podcast Automations & Beheer**
  - [x] Implementeer automatische publicatie op basis van datum/tijd (afgehandeld in query engine)
  - [x] Verbind Podcast Hosts en FAQ live in het portaal (toevoegen/bewerken/verwijderen)
- [x] **Eindcontrole & Opschonen**
  - [x] Verifieer build, linting en typechecking
  - [x] Controleer dat alle functionaliteit 100% live en zonder mock-data werkt

## Completion Marker

ALL_TASKS_COMPLETE: true
