-- Web Push subscriptions, one row per browser/device endpoint per user, with
-- per-user push and sound toggles. Replaces the never-applied, broken table
-- shape from 20260801124800_add_push_notifications.sql.
drop table if exists public.push_subscriptions cascade;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  sound_enabled boolean not null default true,
  push_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_unique unique (user_id, endpoint)
);

create index push_subscriptions_user_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

grant select, insert, update, delete on public.push_subscriptions to authenticated;

drop policy if exists "users select own push subscriptions" on public.push_subscriptions;
create policy "users select own push subscriptions"
on public.push_subscriptions for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "users insert own push subscriptions" on public.push_subscriptions;
create policy "users insert own push subscriptions"
on public.push_subscriptions for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "users update own push subscriptions" on public.push_subscriptions;
create policy "users update own push subscriptions"
on public.push_subscriptions for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "users delete own push subscriptions" on public.push_subscriptions;
create policy "users delete own push subscriptions"
on public.push_subscriptions for delete
to authenticated
using (user_id = (select auth.uid()));

-- No policy grants access to other users' rows; the service-role key used by
-- server actions (createSupabaseAdminClient) bypasses RLS entirely for the
-- actual push-sending path, same pattern as community_profile_albums/photos.
