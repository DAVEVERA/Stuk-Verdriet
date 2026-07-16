alter table public.community_replies
  add column if not exists parent_reply_id uuid references public.community_replies(id) on delete cascade;

alter table public.community_posts
  add column if not exists image_hash text;

create index if not exists community_posts_image_hash_idx
  on public.community_posts(image_hash)
  where image_hash is not null;

create index if not exists community_replies_parent_reply_id_idx
  on public.community_replies(parent_reply_id);

alter table public.community_reports
  add column if not exists reply_id uuid references public.community_replies(id) on delete cascade,
  add column if not exists target_type text not null default 'post',
  add column if not exists target_id uuid,
  add column if not exists report_category text not null default 'ongepast',
  add column if not exists details text,
  add column if not exists status text not null default 'open',
  add column if not exists priority text not null default 'normal',
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists resolution_note text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.community_reports
set
  target_type = coalesce(nullif(target_type, ''), case when reply_id is not null then 'reply' else 'post' end),
  target_id = coalesce(target_id, reply_id, post_id),
  details = coalesce(details, reason),
  status = case when resolved_at is null then coalesce(nullif(status, ''), 'open') else 'resolved' end
where target_id is null or details is null or status is null;

alter table public.community_reports
  add constraint community_reports_target_type_check
  check (target_type in ('post', 'reply', 'image', 'language'));

alter table public.community_reports
  add constraint community_reports_status_check
  check (status in ('open', 'investigating', 'resolved', 'dismissed'));

alter table public.community_reports
  add constraint community_reports_priority_check
  check (priority in ('low', 'normal', 'high', 'urgent'));

create index if not exists community_reports_status_created_at_idx
  on public.community_reports(status, created_at desc);

create index if not exists community_reports_target_idx
  on public.community_reports(target_type, target_id);

create table if not exists public.community_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.community_reports(id) on delete set null,
  moderator_id uuid references auth.users(id) on delete set null,
  target_type text not null,
  target_id uuid,
  action_type text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists community_moderation_actions_report_id_idx
  on public.community_moderation_actions(report_id);

create table if not exists public.community_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email_hash text,
  ip_hash text,
  image_hash text,
  reason text,
  source_report_id uuid references public.community_reports(id) on delete set null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint community_blocks_has_subject check (
    user_id is not null or email_hash is not null or ip_hash is not null or image_hash is not null
  )
);

create index if not exists community_blocks_user_id_idx
  on public.community_blocks(user_id)
  where revoked_at is null;

create index if not exists community_blocks_email_hash_idx
  on public.community_blocks(email_hash)
  where revoked_at is null;

create index if not exists community_blocks_ip_hash_idx
  on public.community_blocks(ip_hash)
  where revoked_at is null;

create index if not exists community_blocks_image_hash_idx
  on public.community_blocks(image_hash)
  where revoked_at is null;
