create table if not exists public.community_pulse_moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  title text not null,
  body text,
  image_url text,
  background_color text not null default '#2f4b3a',
  animation text not null default 'fade',
  visibility text not null default 'connections',
  status text not null default 'published',
  layers jsonb not null default '[]'::jsonb,
  ai_prompt text,
  ai_generation_id text,
  ai_generation_status text not null default 'not_requested',
  ai_estimated_price_cents integer not null default 199,
  ai_payment_status text not null default 'not_required',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_pulse_moments_title_length check (char_length(trim(title)) between 1 and 120),
  constraint community_pulse_moments_body_length check (body is null or char_length(body) <= 1000),
  constraint community_pulse_moments_background_color_format check (background_color ~ '^#[0-9a-fA-F]{6}$'),
  constraint community_pulse_moments_animation_check check (animation in ('fade', 'float', 'pulse', 'rise', 'still')),
  constraint community_pulse_moments_visibility_check check (visibility in ('private', 'connections', 'community')),
  constraint community_pulse_moments_status_check check (status in ('draft', 'published', 'archived')),
  constraint community_pulse_moments_layers_array check (jsonb_typeof(layers) = 'array'),
  constraint community_pulse_moments_ai_status_check check (ai_generation_status in ('not_requested', 'requested', 'draft_ready', 'complete', 'failed')),
  constraint community_pulse_moments_ai_payment_check check (ai_payment_status in ('not_required', 'pending', 'paid', 'failed'))
);

create table if not exists public.community_pulse_reactions (
  moment_id uuid not null references public.community_pulse_moments(id) on delete cascade,
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (moment_id, user_id)
);

create table if not exists public.community_pulse_saves (
  moment_id uuid not null references public.community_pulse_moments(id) on delete cascade,
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (moment_id, user_id)
);

create index if not exists community_pulse_moments_user_created_idx
  on public.community_pulse_moments(user_id, created_at desc);
create index if not exists community_pulse_moments_status_visibility_created_idx
  on public.community_pulse_moments(status, visibility, created_at desc);
create index if not exists community_pulse_reactions_user_idx
  on public.community_pulse_reactions(user_id, created_at desc);
create index if not exists community_pulse_saves_user_idx
  on public.community_pulse_saves(user_id, created_at desc);

alter table public.community_pulse_moments enable row level security;
alter table public.community_pulse_reactions enable row level security;
alter table public.community_pulse_saves enable row level security;

grant select, insert, update, delete on public.community_pulse_moments to authenticated;
grant select, insert, delete on public.community_pulse_reactions to authenticated;
grant select, insert, delete on public.community_pulse_saves to authenticated;

drop policy if exists "pulse moments visible to owner community or connections" on public.community_pulse_moments;
create policy "pulse moments visible to owner community or connections"
on public.community_pulse_moments for select
to authenticated
using (
  user_id = (select auth.uid())
  or (
    status = 'published'
    and visibility = 'community'
    and exists (
      select 1 from public.community_profiles profile
      where profile.user_id = community_pulse_moments.user_id
        and profile.is_discoverable
    )
  )
  or (
    status = 'published'
    and visibility = 'connections'
    and exists (
      select 1 from public.community_friendships friendship
      where friendship.status = 'accepted'
        and (
          (friendship.requester_id = (select auth.uid()) and friendship.addressee_id = community_pulse_moments.user_id)
          or (friendship.addressee_id = (select auth.uid()) and friendship.requester_id = community_pulse_moments.user_id)
        )
    )
  )
);

drop policy if exists "users insert own pulse moments" on public.community_pulse_moments;
create policy "users insert own pulse moments"
on public.community_pulse_moments for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "users update own pulse moments" on public.community_pulse_moments;
create policy "users update own pulse moments"
on public.community_pulse_moments for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "users delete own pulse moments" on public.community_pulse_moments;
create policy "users delete own pulse moments"
on public.community_pulse_moments for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "pulse reactions visible to participants" on public.community_pulse_reactions;
create policy "pulse reactions visible to participants"
on public.community_pulse_reactions for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.community_pulse_moments moment
    where moment.id = community_pulse_reactions.moment_id
      and moment.user_id = (select auth.uid())
  )
);

drop policy if exists "users manage own pulse reactions" on public.community_pulse_reactions;
create policy "users manage own pulse reactions"
on public.community_pulse_reactions for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "users delete own pulse reactions" on public.community_pulse_reactions;
create policy "users delete own pulse reactions"
on public.community_pulse_reactions for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "users read own pulse saves" on public.community_pulse_saves;
create policy "users read own pulse saves"
on public.community_pulse_saves for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "users manage own pulse saves" on public.community_pulse_saves;
create policy "users manage own pulse saves"
on public.community_pulse_saves for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "users delete own pulse saves" on public.community_pulse_saves;
create policy "users delete own pulse saves"
on public.community_pulse_saves for delete to authenticated
using (user_id = (select auth.uid()));
