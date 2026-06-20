create extension if not exists pgcrypto;

do $$
begin
  create type content_status as enum ('draft', 'scheduled', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type community_status as enum ('pending', 'approved', 'rejected', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type author_display_type as enum ('real_name', 'first_name', 'anonymous');
exception
  when duplicate_object then null;
end $$;

create table if not exists podcast_seasons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  season_number integer not null unique,
  description text,
  cover_image text,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  season_number integer not null,
  episode_number integer not null,
  short_intro text,
  description text,
  audio_file_url text,
  spotify_url text,
  podimo_url text,
  apple_podcast_url text,
  image_url text,
  publication_date timestamptz,
  next_episode_date date,
  duration text,
  link_cards jsonb not null default '[]',
  transcript_status text not null default 'missing',
  transcript_language text default 'nl-NL',
  transcript_segments jsonb not null default '[]',
  transcript_vtt_url text,
  transcript_operation_name text,
  transcript_generated_at timestamptz,
  featured_latest boolean not null default false,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table podcast_episodes add column if not exists link_cards jsonb not null default '[]';
alter table podcast_episodes add column if not exists transcript_status text not null default 'missing';
alter table podcast_episodes add column if not exists transcript_language text default 'nl-NL';
alter table podcast_episodes add column if not exists transcript_segments jsonb not null default '[]';
alter table podcast_episodes add column if not exists transcript_vtt_url text;
alter table podcast_episodes add column if not exists transcript_operation_name text;
alter table podcast_episodes add column if not exists transcript_generated_at timestamptz;

insert into storage.buckets (id, name, public)
values
  ('podcast-audio', 'podcast-audio', true),
  ('podcast-images', 'podcast-images', true),
  ('community-images', 'community-images', true)
on conflict (id) do update set public = excluded.public;

create table if not exists host_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  image_url text,
  bio text,
  personal_motivation text,
  display_order integer not null default 100,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  icon text not null default 'heart',
  display_order integer not null default 100
);

create table if not exists episode_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  source text not null default 'homepage_episode_1',
  status text not null default 'subscribed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  author_name text,
  author_display_type author_display_type not null default 'first_name',
  title text not null,
  slug text not null unique,
  body text not null,
  image_url text,
  category text not null,
  post_type text not null default 'story' check (post_type in ('story', 'question', 'tip', 'link')),
  resource_url text,
  resource_label text,
  tags text[] not null default '{}',
  target_group text,
  status community_status not null default 'pending',
  reply_count integer not null default 0,
  support_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table community_posts add column if not exists image_url text;
alter table community_posts add column if not exists post_type text not null default 'story';
alter table community_posts add column if not exists resource_url text;
alter table community_posts add column if not exists resource_label text;
alter table community_posts drop constraint if exists community_posts_post_type_check;
alter table community_posts add constraint community_posts_post_type_check check (post_type in ('story', 'question', 'tip', 'link'));
alter table episode_signups add column if not exists source text not null default 'homepage_episode_1';
alter table episode_signups add column if not exists status text not null default 'subscribed';
alter table episode_signups add column if not exists updated_at timestamptz not null default now();

create table if not exists community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text,
  author_display_type author_display_type not null default 'first_name',
  body text not null,
  status community_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists community_supports (
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  reply_id uuid references community_replies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reason text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists email_outbox (
  id uuid primary key default gen_random_uuid(),
  template text not null check (
    template in (
      'community_post_submitted',
      'community_reply_submitted',
      'community_post_reply_received',
      'community_post_support_received'
    )
  ),
  recipient_email text not null,
  recipient_user_id uuid references auth.users(id) on delete set null,
  subject text not null,
  payload jsonb not null default '{}',
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  display_order integer not null default 100,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sponsor_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text,
  display_order integer not null default 100,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id text primary key default 'main',
  logo_url text,
  homepage_intro text,
  social_links jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table community_posts enable row level security;
alter table community_categories enable row level security;
alter table community_replies enable row level security;
alter table community_supports enable row level security;
alter table community_reports enable row level security;
alter table episode_signups enable row level security;
alter table email_outbox enable row level security;

grant usage on schema public to anon, authenticated;
grant select on community_categories to anon, authenticated;
grant select on community_posts to anon, authenticated;
grant insert on community_posts to authenticated;
grant select on community_replies to anon, authenticated;
grant insert on community_replies to authenticated;
grant select on community_supports to authenticated;
grant insert on community_supports to authenticated;
grant insert on community_reports to authenticated;

drop policy if exists "community categories are public" on community_categories;
create policy "community categories are public" on community_categories for select using (true);

drop policy if exists "approved posts are public" on community_posts;
create policy "approved posts are public" on community_posts for select using (status = 'approved');

drop policy if exists "authenticated users create pending posts" on community_posts;
create policy "authenticated users create pending posts" on community_posts for insert to authenticated with check (status = 'pending' and auth.uid() = user_id);

drop policy if exists "approved replies are public" on community_replies;
create policy "approved replies are public" on community_replies for select using (status = 'approved');

drop policy if exists "authenticated users create pending replies" on community_replies;
create policy "authenticated users create pending replies" on community_replies for insert to authenticated with check (status = 'pending' and auth.uid() = user_id);

drop policy if exists "authenticated users support once" on community_supports;
create policy "authenticated users support once" on community_supports for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "authenticated users see own supports" on community_supports;
create policy "authenticated users see own supports" on community_supports for select to authenticated using (auth.uid() = user_id);

drop policy if exists "authenticated users report content" on community_reports;
create policy "authenticated users report content" on community_reports for insert to authenticated with check (auth.uid() = user_id);

create or replace function refresh_post_counts(target_post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update community_posts
  set
    reply_count = (select count(*) from community_replies where post_id = target_post_id and status = 'approved'),
    support_count = (select count(*) from community_supports where post_id = target_post_id),
    updated_at = now()
  where id = target_post_id;
end;
$$;

create or replace function refresh_reply_count_trigger()
returns trigger
language plpgsql
as $$
begin
  perform refresh_post_counts(coalesce(new.post_id, old.post_id));
  return coalesce(new, old);
end;
$$;

create or replace function refresh_support_count_trigger()
returns trigger
language plpgsql
as $$
begin
  perform refresh_post_counts(coalesce(new.post_id, old.post_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists community_reply_count_refresh on community_replies;
create trigger community_reply_count_refresh
after insert or update or delete on community_replies
for each row execute function refresh_reply_count_trigger();

drop trigger if exists community_support_count_refresh on community_supports;
create trigger community_support_count_refresh
after insert or delete on community_supports
for each row execute function refresh_support_count_trigger();

insert into community_categories (title, slug, description, icon, display_order) values
  ('Rouw algemeen', 'rouw-algemeen', 'Ruimte voor herkenning, vragen en steun.', 'heart', 1),
  ('Voor ouders', 'voor-ouders', 'Voor ouders die leven met gemis.', 'users', 2),
  ('Voor AYA''s', 'voor-ayas', 'Voor jonge mensen die rouw meemaken.', 'user', 3),
  ('Naasten en familie', 'naasten-en-familie', 'Voor broers, zussen, partners, vrienden en andere naasten.', 'users', 4),
  ('Praktische steun', 'praktische-steun', 'Ervaringen en tips voor wat er geregeld moet worden.', 'leaf', 5),
  ('Vragen & antwoorden', 'vragen-en-antwoorden', 'Stel een vraag of reageer op die van een ander.', 'message', 6),
  ('Verhalen & herkenning', 'verhalen-en-herkenning', 'Persoonlijke verhalen die mogen bestaan.', 'star', 7),
  ('Podcast', 'podcast', 'Verhalen die gehoord mogen worden.', 'message', 8),
  ('Hulp & ondersteuning', 'hulp-en-ondersteuning', 'Soms is er meer nodig dan tijd alleen.', 'shield', 9),
  ('Herinneren', 'herinneren', 'Omdat liefde niet stopt waar het leven eindigt.', 'heart', 10),
  ('Leven na verlies', 'leven-na-verlies', 'Verder leven zonder verder te hoeven gaan.', 'leaf', 11),
  ('Voor de omgeving', 'voor-de-omgeving', 'Je hoeft niet de juiste woorden te hebben om er te zijn.', 'users', 12)
on conflict (slug) do nothing;
