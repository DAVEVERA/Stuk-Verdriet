-- Expanded, mobile-first Aan de Pols composer.
-- Existing rows keep rendering through image_url/background_color/layers while
-- new media is stored in a bounded manifest with explicit ownership in Storage.

alter table public.community_pulse_moments
  add column if not exists media_manifest jsonb not null default '{"layout":"single","items":[]}'::jsonb,
  add column if not exists background_style text not null default 'solid-pine';

alter table public.community_pulse_moments
  drop constraint if exists community_pulse_moments_media_manifest_object;
alter table public.community_pulse_moments
  add constraint community_pulse_moments_media_manifest_object
  check (
    jsonb_typeof(media_manifest) = 'object'
    and jsonb_typeof(media_manifest -> 'items') = 'array'
    and jsonb_array_length(media_manifest -> 'items') <= 8
    and coalesce(media_manifest ->> 'layout', 'single') in ('single', 'split', 'grid')
  );

alter table public.community_pulse_moments
  drop constraint if exists community_pulse_moments_background_style_check;
alter table public.community_pulse_moments
  add constraint community_pulse_moments_background_style_check
  check (background_style in (
    'solid-pine',
    'solid-sage',
    'solid-sand',
    'solid-gold',
    'gradient-sage-dusk',
    'gradient-pine-light',
    'gradient-sand-glow',
    'gradient-evening'
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-pulse-media',
  'community-pulse-media',
  true,
  31457280,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/ogg'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "users insert own pulse media" on storage.objects;
create policy "users insert own pulse media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'community-pulse-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users read own pulse media metadata" on storage.objects;
create policy "users read own pulse media metadata"
on storage.objects for select to authenticated
using (
  bucket_id = 'community-pulse-media'
  and owner_id = (select auth.uid())::text
);

drop policy if exists "users update own pulse media" on storage.objects;
create policy "users update own pulse media"
on storage.objects for update to authenticated
using (
  bucket_id = 'community-pulse-media'
  and owner_id = (select auth.uid())::text
)
with check (
  bucket_id = 'community-pulse-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users delete own pulse media" on storage.objects;
create policy "users delete own pulse media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'community-pulse-media'
  and owner_id = (select auth.uid())::text
);
