-- Migration: Core CMS (Admin Users and Legal Documents)
-- Date: 2026-07-20

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique constraint admin_users_email_lowercase check (email = lower(trim(email))),
  role text not null default 'admin' constraint admin_users_role_check check (role in ('super_admin', 'admin', 'editor', 'moderator')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null constraint legal_documents_title_length check (char_length(trim(title)) >= 1),
  slug text not null unique constraint legal_documents_slug_length check (char_length(trim(slug)) >= 1),
  content text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.admin_users enable row level security;
alter table public.legal_documents enable row level security;

-- Policies for legal_documents
drop policy if exists "visible legal documents are public" on public.legal_documents;
create policy "visible legal documents are public"
  on public.legal_documents for select
  to anon, authenticated
  using (is_visible = true);

-- We bypass other permissions for admins via Service Role in server actions or create administrative policies.
-- For safety and DB-level access, we define a helper function to check if the current user is an admin.
create or replace function public.is_db_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid() or email = (select auth.jwt() ->> 'email')
  );
$$;

-- RLS policies for admin_users (Admins can do everything)
drop policy if exists "Admins can manage admin users" on public.admin_users;
create policy "Admins can manage admin users"
  on public.admin_users for all
  to authenticated
  using (public.is_db_admin())
  with check (public.is_db_admin());

drop policy if exists "Admins can manage legal documents" on public.legal_documents;
create policy "Admins can manage legal documents"
  on public.legal_documents for all
  to authenticated
  using (public.is_db_admin())
  with check (public.is_db_admin());

-- Seed initial admin emails from our common list
insert into public.admin_users (email, role)
values 
  ('info@stukverdriet.com', 'super_admin')
on conflict (email) do nothing;
