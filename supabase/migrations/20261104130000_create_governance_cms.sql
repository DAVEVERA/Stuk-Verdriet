-- Migration: Governance CMS (board members + stichtingsgegevens)
-- Date: 2026-11-04
-- Moves the board roster and the official foundation details from static code
-- into editable tables. The bestuur composition table and the board cards both
-- read from board_members (single source of truth). Public reads are limited to
-- published rows via RLS; the app falls back to the bundled data when these
-- tables are empty/unreachable.

create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  name text not null
    constraint board_members_name_length check (char_length(trim(name)) >= 1),
  full_name text not null default '',
  role text not null default '',
  tagline text not null default '',
  image_url text,
  image_alt text,
  object_position text,
  display_order integer not null default 100,
  status content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.governance_facts (
  id uuid primary key default gen_random_uuid(),
  "group" text not null
    constraint governance_facts_group_check check ("group" in ('organisation', 'contact', 'banking')),
  label text not null,
  value text not null,
  copy boolean not null default false,
  copy_value text,
  hint text,
  href text,
  display_order integer not null default 100,
  status content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.board_members enable row level security;
alter table public.governance_facts enable row level security;

drop policy if exists "published board members are public" on public.board_members;
create policy "published board members are public"
  on public.board_members for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "published governance facts are public" on public.governance_facts;
create policy "published governance facts are public"
  on public.governance_facts for select
  to anon, authenticated
  using (status = 'published');

grant select on public.board_members to anon, authenticated;
grant select on public.governance_facts to anon, authenticated;

create index if not exists board_members_order_idx on public.board_members(display_order);
create index if not exists governance_facts_order_idx on public.governance_facts("group", display_order);
