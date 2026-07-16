insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-profile-media',
  'community-profile-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.community_profiles
  add column if not exists cover_url text,
  add column if not exists bio text,
  add column if not exists profile_details jsonb not null default '{}'::jsonb;

alter table public.community_profiles
  drop constraint if exists community_profiles_bio_length;
alter table public.community_profiles
  add constraint community_profiles_bio_length
  check (bio is null or char_length(bio) <= 500);

create table if not exists public.community_profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  image_url text not null,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint community_profile_photos_caption_length check (caption is null or char_length(caption) <= 180)
);

create table if not exists public.community_profile_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.community_profiles(user_id) on delete cascade,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_profile_events_title_length check (char_length(trim(title)) between 1 and 120),
  constraint community_profile_events_description_length check (description is null or char_length(description) <= 1000),
  constraint community_profile_events_location_length check (location is null or char_length(location) <= 140)
);

create table if not exists public.community_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.community_profiles(user_id) on delete cascade,
  addressee_id uuid not null references public.community_profiles(user_id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_friendships_distinct_people check (requester_id <> addressee_id),
  constraint community_friendships_status check (status in ('pending', 'accepted', 'declined'))
);

create unique index if not exists community_friendships_pair_idx
  on public.community_friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists community_profile_photos_user_created_idx
  on public.community_profile_photos(user_id, created_at desc);
create index if not exists community_profile_events_user_starts_idx
  on public.community_profile_events(user_id, starts_at desc);
create index if not exists community_friendships_requester_status_idx
  on public.community_friendships(requester_id, status);
create index if not exists community_friendships_addressee_status_idx
  on public.community_friendships(addressee_id, status);

alter table public.community_profile_photos enable row level security;
alter table public.community_profile_events enable row level security;
alter table public.community_friendships enable row level security;

grant select, insert, update, delete on public.community_profile_photos to authenticated;
grant select, insert, update, delete on public.community_profile_events to authenticated;
grant select, insert, update, delete on public.community_friendships to authenticated;

drop policy if exists "users can read own or discoverable profiles" on public.community_profiles;
drop policy if exists "users can read own discoverable or friend profiles" on public.community_profiles;
create policy "users can read own discoverable or friend profiles"
on public.community_profiles for select
to authenticated
using (
  is_discoverable
  or (select auth.uid()) = user_id
  or exists (
    select 1 from public.community_friendships friendship
    where friendship.status = 'accepted'
      and (
        (friendship.requester_id = (select auth.uid()) and friendship.addressee_id = community_profiles.user_id)
        or (friendship.addressee_id = (select auth.uid()) and friendship.requester_id = community_profiles.user_id)
      )
  )
);

drop policy if exists "profile photos visible to connected users" on public.community_profile_photos;
create policy "profile photos visible to connected users"
on public.community_profile_photos for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.community_profiles profile
    where profile.user_id = community_profile_photos.user_id
      and profile.is_discoverable
  )
  or exists (
    select 1 from public.community_friendships friendship
    where friendship.status = 'accepted'
      and (
        (friendship.requester_id = (select auth.uid()) and friendship.addressee_id = community_profile_photos.user_id)
        or (friendship.addressee_id = (select auth.uid()) and friendship.requester_id = community_profile_photos.user_id)
      )
  )
);
drop policy if exists "users manage own profile photos" on public.community_profile_photos;
drop policy if exists "users insert own profile photos" on public.community_profile_photos;
drop policy if exists "users update own profile photos" on public.community_profile_photos;
drop policy if exists "users delete own profile photos" on public.community_profile_photos;
create policy "users insert own profile photos"
on public.community_profile_photos for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "users update own profile photos"
on public.community_profile_photos for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users delete own profile photos"
on public.community_profile_photos for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "profile events visible to connected users" on public.community_profile_events;
create policy "profile events visible to connected users"
on public.community_profile_events for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.community_profiles profile
    where profile.user_id = community_profile_events.user_id
      and profile.is_discoverable
  )
  or exists (
    select 1 from public.community_friendships friendship
    where friendship.status = 'accepted'
      and (
        (friendship.requester_id = (select auth.uid()) and friendship.addressee_id = community_profile_events.user_id)
        or (friendship.addressee_id = (select auth.uid()) and friendship.requester_id = community_profile_events.user_id)
      )
  )
);
drop policy if exists "users insert own profile events" on public.community_profile_events;
drop policy if exists "users update own profile events" on public.community_profile_events;
drop policy if exists "users delete own profile events" on public.community_profile_events;
create policy "users insert own profile events"
on public.community_profile_events for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "users update own profile events"
on public.community_profile_events for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users delete own profile events"
on public.community_profile_events for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "friendship participants can read" on public.community_friendships;
drop policy if exists "users send own friend requests" on public.community_friendships;
drop policy if exists "recipients respond to friend requests" on public.community_friendships;
drop policy if exists "friendship participants can delete" on public.community_friendships;
create policy "friendship participants can read"
on public.community_friendships for select to authenticated
using ((select auth.uid()) in (requester_id, addressee_id));
create policy "users send own friend requests"
on public.community_friendships for insert to authenticated
with check ((select auth.uid()) = requester_id and status = 'pending');
create policy "recipients respond to friend requests"
on public.community_friendships for update to authenticated
using ((select auth.uid()) = addressee_id)
with check ((select auth.uid()) = addressee_id and status in ('accepted', 'declined'));
create policy "friendship participants can delete"
on public.community_friendships for delete to authenticated
using ((select auth.uid()) in (requester_id, addressee_id));

drop policy if exists "users upload own profile media" on storage.objects;
create policy "users upload own profile media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'community-profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
drop policy if exists "users update own profile media" on storage.objects;
create policy "users update own profile media"
on storage.objects for update to authenticated
using (bucket_id = 'community-profile-media' and owner_id = (select auth.uid())::text)
with check (
  bucket_id = 'community-profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
drop policy if exists "users delete own profile media" on storage.objects;
create policy "users delete own profile media"
on storage.objects for delete to authenticated
using (bucket_id = 'community-profile-media' and owner_id = (select auth.uid())::text);
