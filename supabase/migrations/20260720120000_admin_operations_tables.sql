create table if not exists public.shop_customers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_order_at timestamptz,
  order_count integer not null default 0,
  total_spent_cents integer not null default 0,
  note text,
  source text
);

create table if not exists public.shop_order_returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  customer_email text,
  customer_name text,
  reason text,
  status text not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  notes text
);

create table if not exists public.shop_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  customer_email text,
  customer_name text,
  rating integer not null default 5,
  title text,
  body text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_logistics_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  event_type text not null,
  message text,
  carrier text,
  tracking_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_questions (
  id uuid primary key default gen_random_uuid(),
  customer_email text,
  customer_name text,
  subject text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.shop_orders') is not null then
    alter table public.shop_orders
      add column if not exists customer_id uuid,
      add column if not exists shipping_status text,
      add column if not exists tracking_code text,
      add column if not exists fulfillment_notes text,
      add column if not exists return_requested_at timestamptz;

    alter table public.shop_orders enable row level security;

    create index if not exists shop_orders_customer_idx on public.shop_orders(customer_id);
  end if;
end $$;
create index if not exists shop_order_returns_order_idx on public.shop_order_returns(order_id);
create index if not exists shop_reviews_status_created_idx on public.shop_reviews(status, created_at desc);
create index if not exists shop_logistics_events_order_idx on public.shop_logistics_events(order_id, created_at desc);
create index if not exists customer_questions_status_created_idx on public.customer_questions(status, created_at desc);
