-- Migration: Fase 2 - Marketing Kalender & AI Studio
-- Date: 2026-07-20

create table if not exists public.marketing_items (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  channel text not null constraint marketing_items_channel_length check (char_length(trim(channel)) >= 1),
  title text not null constraint marketing_items_title_length check (char_length(trim(title)) >= 1),
  status text not null default 'draft' constraint marketing_items_status_check check (status in ('draft', 'needs_text', 'review', 'scheduled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_settings (
  id text primary key default 'main',
  text_prompt text not null default 'Schrijf een warme Instagram-caption over een nieuw interview, zonder te zwaar te worden.',
  image_prompt text not null default 'Maak een serene social visual met vlinder, zachte natuur en ruimte voor echte HTML tekst.',
  tone_warmth integer not null default 82 constraint ai_settings_warmth_range check (tone_warmth >= 0 and tone_warmth <= 100),
  tone_directness integer not null default 58 constraint ai_settings_directness_range check (tone_directness >= 0 and tone_directness <= 100),
  tone_hopeful integer not null default 74 constraint ai_settings_hopeful_range check (tone_hopeful >= 0 and tone_hopeful <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  trigger_event text not null constraint automations_trigger_length check (char_length(trim(trigger_event)) >= 1),
  action_type text not null constraint automations_action_length check (char_length(trim(action_type)) >= 1),
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.marketing_items enable row level security;
alter table public.ai_settings enable row level security;
alter table public.automations enable row level security;

-- Policies (using the public.is_db_admin helper function we defined in Phase 1)
drop policy if exists "Admins can manage marketing items" on public.marketing_items;
create policy "Admins can manage marketing items"
  on public.marketing_items for all
  to authenticated
  using (public.is_db_admin())
  with check (public.is_db_admin());

drop policy if exists "Admins can manage AI settings" on public.ai_settings;
create policy "Admins can manage AI settings"
  on public.ai_settings for all
  to authenticated
  using (public.is_db_admin())
  with check (public.is_db_admin());

drop policy if exists "Admins can manage automations" on public.automations;
create policy "Admins can manage automations"
  on public.automations for all
  to authenticated
  using (public.is_db_admin())
  with check (public.is_db_admin());

-- Seed initial AI settings row
insert into public.ai_settings (id, text_prompt, image_prompt, tone_warmth, tone_directness, tone_hopeful)
values ('main', 'Schrijf een warme Instagram-caption over een nieuw interview, zonder te zwaar te worden.', 'Maak een serene social visual met vlinder, zachte natuur en ruimte voor echte HTML tekst.', 82, 58, 74)
on conflict (id) do nothing;
