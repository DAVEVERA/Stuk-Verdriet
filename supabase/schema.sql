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
  body text not null constraint community_replies_body_length check (char_length(trim(body)) between 1 and 2000),
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

insert into storage.buckets (id, name, public)
values ('community-avatars', 'community-avatars', true)
on conflict (id) do update set public = excluded.public;

create table if not exists community_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  is_discoverable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_profiles_display_name_length check (char_length(trim(display_name)) between 1 and 80)
);

create table if not exists community_conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_conversation_participants (
  conversation_id uuid not null references community_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table community_conversation_participants
  drop constraint if exists community_conversation_participants_profile_fkey;

alter table community_conversation_participants
  add constraint community_conversation_participants_profile_fkey
  foreign key (user_id) references community_profiles(user_id) on delete cascade;

create table if not exists community_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references community_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint community_messages_body_length check (char_length(trim(body)) between 1 and 2000)
);

create index if not exists community_conversation_participants_user_idx
  on community_conversation_participants(user_id, conversation_id);

create index if not exists community_messages_conversation_created_idx
  on community_messages(conversation_id, created_at desc);

create schema if not exists private;

create or replace function private.is_community_conversation_participant(conversation uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.community_conversation_participants p
    where p.conversation_id = conversation
      and p.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_community_conversation_participant(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_community_conversation_participant(uuid) to authenticated;

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
alter table podcast_seasons enable row level security;
alter table podcast_episodes enable row level security;
alter table host_profiles enable row level security;
alter table community_categories enable row level security;
alter table community_replies enable row level security;
alter table community_supports enable row level security;
alter table community_reports enable row level security;
alter table community_profiles enable row level security;
alter table community_conversations enable row level security;
alter table community_conversation_participants enable row level security;
alter table community_messages enable row level security;
alter table episode_signups enable row level security;
alter table faqs enable row level security;
alter table sponsor_logos enable row level security;
alter table site_settings enable row level security;

grant usage on schema public to anon, authenticated;
grant select on podcast_seasons to anon, authenticated;
grant select on podcast_episodes to anon, authenticated;
grant select on host_profiles to anon, authenticated;
grant select on community_categories to anon, authenticated;
grant select on community_posts to anon, authenticated;
grant insert on community_posts to authenticated;
grant select on community_replies to anon, authenticated;
grant insert on community_replies to authenticated;
grant select on community_supports to authenticated;
grant insert on community_supports to authenticated;
grant delete on community_supports to authenticated;
grant insert on community_reports to authenticated;
grant select, insert, update on community_profiles to authenticated;
grant select, insert on community_conversations to authenticated;
grant select, insert, update on community_conversation_participants to authenticated;
grant select, insert on community_messages to authenticated;
grant insert on episode_signups to anon, authenticated;
grant select on faqs to anon, authenticated;
grant select on sponsor_logos to anon, authenticated;
grant select on site_settings to anon, authenticated;

drop policy if exists "published seasons are public" on podcast_seasons;
create policy "published seasons are public" on podcast_seasons for select to anon, authenticated using (status = 'published');

drop policy if exists "published episodes are public" on podcast_episodes;
create policy "published episodes are public" on podcast_episodes for select to anon, authenticated using (status = 'published');

drop policy if exists "published hosts are public" on host_profiles;
create policy "published hosts are public" on host_profiles for select to anon, authenticated using (status = 'published');

drop policy if exists "community categories are public" on community_categories;
create policy "community categories are public" on community_categories for select to anon, authenticated using (true);

drop policy if exists "approved posts are public" on community_posts;
create policy "approved posts are public" on community_posts for select to anon, authenticated using (status = 'approved');

drop policy if exists "authenticated users create pending posts" on community_posts;
create policy "authenticated users create pending posts" on community_posts for insert to authenticated with check (status = 'pending' and (select auth.uid()) = user_id);

drop policy if exists "users can read own posts" on community_posts;
create policy "users can read own posts" on community_posts for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "approved replies are public" on community_replies;
create policy "approved replies are public" on community_replies for select to anon, authenticated using (status = 'approved');

drop policy if exists "authenticated users create pending replies" on community_replies;
create policy "authenticated users create pending replies" on community_replies for insert to authenticated with check (status = 'pending' and (select auth.uid()) = user_id);

drop policy if exists "users can read own replies" on community_replies;
create policy "users can read own replies" on community_replies for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "authenticated users support once" on community_supports;
create policy "authenticated users support once" on community_supports for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "authenticated users see own supports" on community_supports;
create policy "authenticated users see own supports" on community_supports for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "authenticated users remove own support" on community_supports;
create policy "authenticated users remove own support" on community_supports for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "authenticated users report content" on community_reports;
create policy "authenticated users report content" on community_reports for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "users can read own or discoverable profiles" on community_profiles;
create policy "users can read own or discoverable profiles" on community_profiles for select to authenticated using (is_discoverable or (select auth.uid()) = user_id);

drop policy if exists "users can create own profile" on community_profiles;
create policy "users can create own profile" on community_profiles for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own profile" on community_profiles;
create policy "users can update own profile" on community_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "participants can read conversations" on community_conversations;
create policy "participants can read conversations" on community_conversations for select to authenticated using (private.is_community_conversation_participant(id));

drop policy if exists "users can create conversations" on community_conversations;
create policy "users can create conversations" on community_conversations for insert to authenticated with check (created_by = (select auth.uid()));

drop policy if exists "participants can read participants" on community_conversation_participants;
create policy "participants can read participants" on community_conversation_participants for select to authenticated using (private.is_community_conversation_participant(conversation_id));

drop policy if exists "users can add self as participant" on community_conversation_participants;
create policy "users can add self as participant" on community_conversation_participants for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "users can update own participant state" on community_conversation_participants;
create policy "users can update own participant state" on community_conversation_participants for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "participants can read messages" on community_messages;
create policy "participants can read messages" on community_messages for select to authenticated using (private.is_community_conversation_participant(conversation_id));

drop policy if exists "participants can send messages" on community_messages;
create policy "participants can send messages" on community_messages for insert to authenticated with check (
  sender_id = (select auth.uid()) and private.is_community_conversation_participant(conversation_id)
);

drop policy if exists "public users can join episode signup list" on episode_signups;
create policy "public users can join episode signup list" on episode_signups for insert to anon, authenticated with check (true);

drop policy if exists "published faqs are public" on faqs;
create policy "published faqs are public" on faqs for select to anon, authenticated using (status = 'published');

drop policy if exists "published sponsor logos are public" on sponsor_logos;
create policy "published sponsor logos are public" on sponsor_logos for select to anon, authenticated using (status = 'published');

drop policy if exists "site settings are public" on site_settings;
create policy "site settings are public" on site_settings for select to anon, authenticated using (id = 'main');

create or replace function refresh_post_counts(target_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if target_post_id is null then
    return;
  end if;

  update community_posts
  set
    reply_count = (select count(*) from community_replies where post_id = target_post_id and status = 'approved'),
    support_count = (select count(*) from community_supports where post_id = target_post_id),
    updated_at = now()
  where id = target_post_id;
end;
$$;

revoke execute on function refresh_post_counts(uuid) from public, anon, authenticated;

create or replace function refresh_reply_count_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform refresh_post_counts(coalesce(new.post_id, old.post_id));
  return coalesce(new, old);
end;
$$;

create or replace function refresh_support_count_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
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

create or replace function touch_community_conversation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  update community_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists community_message_touch_conversation on community_messages;
create trigger community_message_touch_conversation
after insert on community_messages
for each row execute function touch_community_conversation();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_messages'
  ) then
    alter publication supabase_realtime add table public.community_messages;
  end if;
exception
  when undefined_object then
    null;
end $$;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-products',
  'shop-products',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  short_description text,
  image_url text,
  price_cents integer not null,
  currency text not null default 'eur',
  inventory_count integer,
  stripe_price_id text,
  stripe_product_id text,
  status text not null default 'draft',
  featured boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shop_products_title_length check (char_length(trim(title)) between 1 and 120),
  constraint shop_products_slug_length check (char_length(trim(slug)) between 1 and 140),
  constraint shop_products_price_positive check (price_cents >= 0),
  constraint shop_products_currency_check check (currency ~ '^[a-z]{3}$'),
  constraint shop_products_inventory_positive check (inventory_count is null or inventory_count >= 0),
  constraint shop_products_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text,
  status text not null default 'pending',
  total_cents integer not null default 0,
  currency text not null default 'eur',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  items jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shop_orders_status_check check (status in ('pending', 'paid', 'failed', 'cancelled', 'fulfilled', 'refunded')),
  constraint shop_orders_total_positive check (total_cents >= 0),
  constraint shop_orders_currency_check check (currency ~ '^[a-z]{3}$')
);

create table if not exists public.shop_settings (
  id text primary key default 'main',
  eyebrow text not null default 'Stuk Verdriet shop',
  title text not null default 'Kleine dingen voor grote dagen',
  intro text not null default 'Rustige producten om woorden te geven aan gemis, herinneringen vast te houden en iemand dichtbij te laten voelen zonder dat het groot hoeft te worden.',
  service_points jsonb not null default '["zorgvuldig en ingetogen", "veilig afrekenen via Stripe", "voorraad beheerd in het adminportaal"]'::jsonb,
  checkout_note text,
  updated_at timestamptz not null default now(),
  constraint shop_settings_main_id check (id = 'main'),
  constraint shop_settings_service_points_array check (jsonb_typeof(service_points) = 'array')
);

create index if not exists shop_products_status_sort_idx
  on public.shop_products(status, featured desc, sort_order asc, created_at desc);

create index if not exists shop_orders_created_idx
  on public.shop_orders(created_at desc);

create index if not exists shop_orders_status_created_idx
  on public.shop_orders(status, created_at desc);

alter table public.shop_products enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_settings enable row level security;

grant select on public.shop_products to anon, authenticated;
grant select on public.shop_settings to anon, authenticated;
grant insert on public.shop_orders to anon, authenticated;

drop policy if exists "published shop products are public" on public.shop_products;
create policy "published shop products are public"
on public.shop_products for select
to anon, authenticated
using (status = 'published');

drop policy if exists "public checkout creates pending orders" on public.shop_orders;
create policy "public checkout creates pending orders"
on public.shop_orders for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "shop settings are public" on public.shop_settings;
create policy "shop settings are public"
on public.shop_settings for select
to anon, authenticated
using (id = 'main');

insert into public.shop_settings (id)
values ('main')
on conflict (id) do nothing;

update public.shop_products
set status = 'archived',
    updated_at = now()
where slug in ('lichtpuntje-kaartenset', 'herinnerboekje', 'stiltekracht-poster')
  and coalesce(image_url, '') like '/story-visuals/%';

insert into public.shop_products (
  title,
  slug,
  description,
  short_description,
  image_url,
  price_cents,
  currency,
  inventory_count,
  status,
  featured,
  sort_order
)
values
  (
    'Serene Vlam kaarsenset',
    'serene-vlam-kaarsenset',
    'Drie matte keramieken kaarsen in pine, sage en paper tinten. Een rustig setje voor thuis, naast een foto of als klein ritueel op dagen waarop gemis dichtbij is.',
    'Drie rustige kaarsen in Stuk Verdriet tinten voor kleine rituelen thuis.',
    '/shop/kaarsenset-serene-vlam.webp',
    2495,
    'eur',
    30,
    'published',
    true,
    1
  ),
  (
    'Herinnerlicht kaarsenset',
    'herinnerlicht-kaarsenset',
    'Drie glazen herinnerkaarsen op een houten tray, afgewerkt met een zachte sleeve en subtiel Stuk Verdriet detail. Gemaakt voor aandacht, stilte en nabijheid.',
    'Glazen herinnerkaarsen met zachte afwerking en subtiel logo-detail.',
    '/shop/kaarsenset-herinnerlicht.webp',
    2995,
    'eur',
    24,
    'published',
    false,
    2
  ),
  (
    'Stille Avond kaarsenset',
    'stille-avond-kaarsenset',
    'Een premium giftbox met drie kaarsen in donkere en warme Stuk Verdriet tinten. Voor een stille avond, een herdenkingsplek of als ingetogen cadeau.',
    'Een warme giftset voor stilte, aandacht en nabijheid.',
    '/shop/kaarsenset-stille-avond.webp',
    3495,
    'eur',
    18,
    'published',
    false,
    3
  ),
  (
    'Katoenen Stuk Verdriet tote bag',
    'katoenen-stuk-verdriet-tote-bag',
    'Een stevige naturel katoenen tas met het Stuk Verdriet logo in pine groen. Praktisch, sober en herkenbaar zonder hard te roepen.',
    'Naturel katoenen tas met het Stuk Verdriet logo, stevig en ingetogen.',
    '/shop/katoenen-tote-bag.webp',
    1995,
    'eur',
    50,
    'published',
    false,
    4
  ),
  (
    'Fotolijsten trio',
    'fotolijsten-trio',
    'Drie fotolijsten in een rustige set: pine hout, naturel hout en sage metaal. Ontworpen als een klein geheel voor foto''s, kaartjes of herinneringen.',
    'Drie fotolijsten in pine, sage en naturel hout als een rustig geheel.',
    '/shop/fotolijsten-trio.webp',
    3995,
    'eur',
    20,
    'published',
    false,
    5
  ),
  (
    'Logo sleutelhanger steunproduct',
    'logo-sleutelhanger-steunproduct',
    'Een kleine emaille sleutelhanger in de vorm van het Stuk Verdriet logo. Je koopt hem als tastbaar steunproduct voor ons doel.',
    'Een kleine sleutelhanger van het logo waarmee je ons doel steunt.',
    '/shop/logo-sleutelhanger.webp',
    995,
    'eur',
    75,
    'published',
    false,
    6
  )
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    short_description = excluded.short_description,
    image_url = excluded.image_url,
    price_cents = excluded.price_cents,
    currency = excluded.currency,
    inventory_count = excluded.inventory_count,
    status = excluded.status,
    featured = excluded.featured,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into public.shop_products (
  title,
  slug,
  description,
  short_description,
  image_url,
  price_cents,
  currency,
  inventory_count,
  status,
  featured,
  sort_order
)
values
  (
    'Sage Stuk Verdriet tote bag',
    'sage-stuk-verdriet-tote-bag',
    'Een tweede tote in zachte sage kleurstelling, met het Stuk Verdriet logo in warm paper. Stevig genoeg voor dagelijks gebruik en rustig genoeg voor de collectie.',
    'Sage katoenen tas met warm paper logo en stevige canvas afwerking.',
    '/shop/sage-tote-bag.webp',
    2195,
    'eur',
    40,
    'published',
    false,
    7
  ),
  (
    'Crossbody bewaar pouch',
    'crossbody-bewaarpouch',
    'Een kleine katoenen crossbody pouch voor sleutels, telefoon, notitieboekje of iets dat je dichtbij wilt dragen. Naturel canvas met sage band en subtiel logo.',
    'Kleine crossbody pouch voor dagelijkse spullen of een klein aandenken.',
    '/shop/crossbody-bewaarpouch.webp',
    2495,
    'eur',
    35,
    'published',
    false,
    8
  ),
  (
    'Troostdeken',
    'troostdeken',
    'Een zachte katoenen deken in warme paper tinten met sage randstiksel en een klein geweven Stuk Verdriet label. Voor op de bank, naast bed of bij een rustig moment.',
    'Zachte katoenen deken met sage randstiksel en klein logo-label.',
    '/shop/troostdeken.webp',
    4995,
    'eur',
    16,
    'published',
    false,
    9
  ),
  (
    'Herinnerboekje',
    'herinnerboekje',
    'Een linnen notitieboekje voor herinneringen, zinnen, namen, rituelen en kleine momenten die je wilt bewaren. Met blanco pagina''s en een ingetogen debossed logo.',
    'Linnen boekje voor herinneringen, rituelen en woorden die mogen blijven.',
    '/shop/herinnerboekje.webp',
    2295,
    'eur',
    30,
    'published',
    false,
    10
  ),
  (
    'Stil moment mok',
    'stil-moment-mok',
    'Een matte keramieken mok met pine groene binnenkant en klein Stuk Verdriet logo. Voor koffie, thee of een pauze waarin niets hoeft.',
    'Matte keramieken mok voor koffie, thee en stille momenten.',
    '/shop/stil-moment-mok.webp',
    1795,
    'eur',
    48,
    'published',
    false,
    11
  ),
  (
    'Woorden kaartenset',
    'woorden-kaartenset',
    'Een set stevige kaarten en enveloppen in Stuk Verdriet tinten. Om iets kleins te sturen wanneer grote woorden niet passen.',
    'Kaarten en enveloppen voor steun, herinnering en nabijheid.',
    '/shop/woorden-kaartenset.webp',
    1495,
    'eur',
    60,
    'published',
    false,
    12
  ),
  (
    'Linnen bewaarzakje',
    'linnen-bewaarzakje',
    'Een klein linnen trekkoordzakje voor sieraden, kaartjes, steentjes of andere kleine herinneringen. Naturel met sage koord en subtiel logo.',
    'Klein linnen zakje voor tastbare herinneringen en kleine items.',
    '/shop/linnen-bewaarzakje.webp',
    1295,
    'eur',
    70,
    'published',
    false,
    13
  ),
  (
    'Ritueelset lucifers en snuffer',
    'ritueelset-lucifers-en-snuffer',
    'Een klein accessoiresetje voor kaarsrituelen: lucifers in pine groene sleeve, een messingkleurige snuffer en een rustige tray.',
    'Lucifers en snuffer als klein accessoiresetje voor kaarsrituelen.',
    '/shop/ritueel-lucifers-snuffer.webp',
    1995,
    'eur',
    28,
    'published',
    false,
    14
  ),
  (
    'Logo emaille pin steunproduct',
    'logo-emaille-pin-steunproduct',
    'Een kleine emaille pin van het Stuk Verdriet logo. Een laagdrempelig steunproduct dat je op een tas, jas of etui kunt dragen.',
    'Kleine emaille pin van het logo als laagdrempelig steunproduct.',
    '/shop/logo-emaille-pin.webp',
    795,
    'eur',
    90,
    'published',
    false,
    15
  ),
  (
    'Mini ritueelset',
    'mini-ritueelset',
    'Een kleine box met mini-kaars, blanco kaartje, linnen zakje en herinnersteen. Voor een rustig moment thuis of als ingetogen steun aan iemand anders.',
    'Kleine ritueelbox met mini-kaars, kaartje, zakje en herinnersteen.',
    '/shop/mini-ritueelset.webp',
    2795,
    'eur',
    22,
    'published',
    false,
    16
  )
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    short_description = excluded.short_description,
    image_url = excluded.image_url,
    price_cents = excluded.price_cents,
    currency = excluded.currency,
    inventory_count = excluded.inventory_count,
    status = excluded.status,
    featured = excluded.featured,
    sort_order = excluded.sort_order,
    updated_at = now();

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique constraint admin_users_email_lowercase check (email = lower(trim(email))),
  role text not null default 'admin' constraint admin_users_role_check check (role in ('super_admin', 'admin', 'editor', 'moderator')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

-- Admin accounts are managed only through authenticated server actions.
revoke all on table public.admin_users from anon, authenticated;
grant all on table public.admin_users to service_role;

-- Policies for legal_documents
drop policy if exists "visible legal documents are public" on public.legal_documents;
create policy "visible legal documents are public"
  on public.legal_documents for select
  to anon, authenticated
  using (is_visible = true);

-- Helper function to check if the current user is an admin.
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

-- RLS policies for admin_users
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

-- Bootstrap access comes from ADMIN_EMAILS. No extra account is seeded here.

create table if not exists public.marketing_items (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  channel text not null constraint marketing_items_channel_length check (char_length(trim(channel)) >= 1),
  title text not null constraint marketing_items_title_length check (char_length(trim(title)) >= 1),
  status text not null default 'draft' constraint marketing_items_status_check check (status in ('draft', 'needs_text', 'review', 'scheduled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_settings (
  id text primary key default 'main',
  text_prompt text not null default 'Schrijf een warme Instagram-caption over een nieuw interview, zonder te zwaar te worden.',
  image_prompt text not null default 'Maak een serene social visual met vlinder, zachte natuur en ruimte voor echte HTML tekst.',
  tone_warmth integer not null default 82 constraint ai_settings_warmth_range check (tone_warmth >= 0 and tone_warmth <= 100),
  tone_directness integer not null default 58 constraint ai_settings_directness_range check (tone_directness >= 0 and tone_directness <= 100),
  tone_hopeful integer not null default 74 constraint ai_settings_hopeful_range check (tone_hopeful >= 0 and tone_hopeful <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  trigger_event text not null constraint automations_trigger_length check (char_length(trim(trigger_event)) >= 1),
  action_type text not null constraint automations_action_length check (char_length(trim(action_type)) >= 1),
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.marketing_items enable row level security;
alter table public.ai_settings enable row level security;
alter table public.automations enable row level security;

-- Policies
drop policy if exists "Admins can manage marketing items" on public.marketing_items;
create policy "Admins can manage marketing items"
  on public.marketing_items for all
  to authenticated
  using (public.is_db_admin())
  with check (public.is_db_admin());

drop policy if exists "Admins can manage AI settings" on public.ai_settings;
create policy "Admins can manage AI settings"
  on public.ai_settings for all
  to authenticated
  using (public.is_db_admin())
  with check (public.is_db_admin());

drop policy if exists "Admins can manage automations" on public.automations;
create policy "Admins can manage automations"
  on public.automations for all
  to authenticated
  using (public.is_db_admin())
  with check (public.is_db_admin());

-- Seed initial AI settings row
insert into public.ai_settings (id, text_prompt, image_prompt, tone_warmth, tone_directness, tone_hopeful)
values ('main', 'Schrijf een warme Instagram-caption over een nieuw interview, zonder te zwaar te worden.', 'Maak een serene social visual met vlinder, zachte natuur en ruimte voor echte HTML tekst.', 82, 58, 74)
on conflict (id) do nothing;
