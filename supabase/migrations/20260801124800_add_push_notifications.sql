-- Push notification subscriptions, one row per browser/device subscription per user.
-- Superseded by 20260817220000_push_subscriptions.sql, which corrects the schema below
-- (this file's original trigger used Deno.env.get(), which does not exist in plpgsql
-- and would fail on execution; it was never applied to the live database).
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
