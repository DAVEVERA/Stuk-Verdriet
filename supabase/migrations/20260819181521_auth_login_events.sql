create table if not exists public.auth_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intent text not null constraint auth_login_events_intent_check check (intent in ('admin', 'community')),
  occurred_at timestamptz not null default now()
);

create index if not exists auth_login_events_occurred_at_idx
  on public.auth_login_events (occurred_at desc);

create index if not exists auth_login_events_intent_occurred_at_idx
  on public.auth_login_events (intent, occurred_at desc);

alter table public.auth_login_events enable row level security;
revoke all on table public.auth_login_events from anon, authenticated;
grant select, insert on table public.auth_login_events to service_role;
