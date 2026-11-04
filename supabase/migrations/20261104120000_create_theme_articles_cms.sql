-- Migration: Theme articles CMS
-- Date: 2026-11-04
-- Moves the previously static /themas content into a manageable table so the
-- foundation can create, edit, reorder and (un)publish theme articles from the
-- admin portal. Public reads are limited to published rows via RLS; the app
-- falls back to the bundled markdown files when this table is empty/unreachable.

create table if not exists public.theme_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    constraint theme_articles_slug_length check (char_length(trim(slug)) >= 1),
  title text not null
    constraint theme_articles_title_length check (char_length(trim(title)) >= 1),
  body_markdown text not null default '',
  seo_title text not null default '',
  meta_description text not null default '',
  card_text text not null default '',
  display_order integer not null default 100,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.theme_articles enable row level security;

-- Only published articles are readable by the public; writes go through the
-- service-role server actions (which bypass RLS), mirroring faqs/host_profiles.
drop policy if exists "published theme articles are public" on public.theme_articles;
create policy "published theme articles are public"
  on public.theme_articles for select
  to anon, authenticated
  using (status = 'published');

grant select on public.theme_articles to anon, authenticated;

create index if not exists theme_articles_order_idx
  on public.theme_articles(display_order, title);
