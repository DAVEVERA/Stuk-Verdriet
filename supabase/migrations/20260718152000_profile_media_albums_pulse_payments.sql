create table if not exists public.community_profile_albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  title text not null,
  description text,
  visibility text not null default 'connections',
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_profile_albums_title_length check (char_length(trim(title)) between 1 and 80),
  constraint community_profile_albums_description_length check (description is null or char_length(description) <= 300),
  constraint community_profile_albums_visibility_check check (visibility in ('private', 'connections', 'community'))
);

alter table public.community_profile_photos
  add column if not exists album_id uuid references public.community_profile_albums(id) on delete set null,
  add column if not exists alt_text text,
  add column if not exists visibility text not null default 'connections',
  add column if not exists status text not null default 'active',
  add column if not exists updated_at timestamptz not null default now();

alter table public.community_profile_photos
  drop constraint if exists community_profile_photos_alt_text_length;
alter table public.community_profile_photos
  add constraint community_profile_photos_alt_text_length
  check (alt_text is null or char_length(alt_text) <= 180);
alter table public.community_profile_photos
  drop constraint if exists community_profile_photos_visibility_check;
alter table public.community_profile_photos
  add constraint community_profile_photos_visibility_check
  check (visibility in ('private', 'connections', 'community'));
alter table public.community_profile_photos
  drop constraint if exists community_profile_photos_status_check;
alter table public.community_profile_photos
  add constraint community_profile_photos_status_check
  check (status in ('active', 'hidden', 'archived'));

alter table public.community_profile_events
  add column if not exists ends_at timestamptz,
  add column if not exists visibility text not null default 'connections',
  add column if not exists status text not null default 'active',
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists reminder_note text;

alter table public.community_profile_events
  drop constraint if exists community_profile_events_visibility_check;
alter table public.community_profile_events
  add constraint community_profile_events_visibility_check
  check (visibility in ('private', 'connections', 'community'));
alter table public.community_profile_events
  drop constraint if exists community_profile_events_status_check;
alter table public.community_profile_events
  add constraint community_profile_events_status_check
  check (status in ('active', 'archived'));
alter table public.community_profile_events
  drop constraint if exists community_profile_events_reminder_note_length;
alter table public.community_profile_events
  add constraint community_profile_events_reminder_note_length
  check (reminder_note is null or char_length(reminder_note) <= 300);

alter table public.community_pulse_moments
  add column if not exists ai_render_orientation text,
  add column if not exists stripe_payment_link text,
  add column if not exists stripe_buy_button_id text;

alter table public.community_pulse_moments
  drop constraint if exists community_pulse_moments_ai_orientation_check;
alter table public.community_pulse_moments
  add constraint community_pulse_moments_ai_orientation_check
  check (ai_render_orientation is null or ai_render_orientation = 'vertical_reel');

create index if not exists community_profile_albums_user_created_idx
  on public.community_profile_albums(user_id, created_at desc);
create index if not exists community_profile_photos_album_created_idx
  on public.community_profile_photos(album_id, created_at desc);
create index if not exists community_profile_events_user_status_starts_idx
  on public.community_profile_events(user_id, status, starts_at desc);

alter table public.community_profile_albums enable row level security;

grant select, insert, update, delete on public.community_profile_albums to authenticated;

drop policy if exists "profile albums visible to connected users" on public.community_profile_albums;
create policy "profile albums visible to connected users"
on public.community_profile_albums for select
to authenticated
using (
  user_id = (select auth.uid())
  or visibility = 'community'
  or (
    visibility = 'connections'
    and exists (
      select 1 from public.community_friendships friendship
      where friendship.status = 'accepted'
        and (
          (friendship.requester_id = (select auth.uid()) and friendship.addressee_id = community_profile_albums.user_id)
          or (friendship.addressee_id = (select auth.uid()) and friendship.requester_id = community_profile_albums.user_id)
        )
    )
  )
);

drop policy if exists "users insert own profile albums" on public.community_profile_albums;
create policy "users insert own profile albums"
on public.community_profile_albums for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "users update own profile albums" on public.community_profile_albums;
create policy "users update own profile albums"
on public.community_profile_albums for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "users delete own profile albums" on public.community_profile_albums;
create policy "users delete own profile albums"
on public.community_profile_albums for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "profile photos visible to connected users" on public.community_profile_photos;
create policy "profile photos visible to connected users"
on public.community_profile_photos for select
to authenticated
using (
  status = 'active'
  and (
    user_id = (select auth.uid())
    or visibility = 'community'
    or (
      visibility = 'connections'
      and exists (
        select 1 from public.community_friendships friendship
        where friendship.status = 'accepted'
          and (
            (friendship.requester_id = (select auth.uid()) and friendship.addressee_id = community_profile_photos.user_id)
            or (friendship.addressee_id = (select auth.uid()) and friendship.requester_id = community_profile_photos.user_id)
          )
      )
    )
  )
);

drop policy if exists "profile events visible to connected users" on public.community_profile_events;
create policy "profile events visible to connected users"
on public.community_profile_events for select
to authenticated
using (
  status = 'active'
  and (
    user_id = (select auth.uid())
    or visibility = 'community'
    or (
      visibility = 'connections'
      and exists (
        select 1 from public.community_friendships friendship
        where friendship.status = 'accepted'
          and (
            (friendship.requester_id = (select auth.uid()) and friendship.addressee_id = community_profile_events.user_id)
            or (friendship.addressee_id = (select auth.uid()) and friendship.requester_id = community_profile_events.user_id)
          )
      )
    )
  )
);
