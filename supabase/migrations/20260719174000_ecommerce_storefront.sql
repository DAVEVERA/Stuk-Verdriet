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
