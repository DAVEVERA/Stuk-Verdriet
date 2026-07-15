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

alter table community_profiles enable row level security;
alter table community_conversations enable row level security;
alter table community_conversation_participants enable row level security;
alter table community_messages enable row level security;

grant select, insert, update on community_profiles to authenticated;
grant select, insert on community_conversations to authenticated;
grant select, insert, update on community_conversation_participants to authenticated;
grant select, insert on community_messages to authenticated;

drop policy if exists "users can read own or discoverable profiles" on community_profiles;
create policy "users can read own or discoverable profiles"
on community_profiles for select
to authenticated
using (is_discoverable or (select auth.uid()) = user_id);

drop policy if exists "users can create own profile" on community_profiles;
create policy "users can create own profile"
on community_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own profile" on community_profiles;
create policy "users can update own profile"
on community_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "participants can read conversations" on community_conversations;
create policy "participants can read conversations"
on community_conversations for select
to authenticated
using (
  exists (
    select 1
    from community_conversation_participants p
    where p.conversation_id = community_conversations.id
      and p.user_id = (select auth.uid())
  )
);

drop policy if exists "users can create conversations" on community_conversations;
create policy "users can create conversations"
on community_conversations for insert
to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists "participants can read participants" on community_conversation_participants;
create policy "participants can read participants"
on community_conversation_participants for select
to authenticated
using (
  exists (
    select 1
    from community_conversation_participants own_participation
    where own_participation.conversation_id = community_conversation_participants.conversation_id
      and own_participation.user_id = (select auth.uid())
  )
);

drop policy if exists "users can add self as participant" on community_conversation_participants;
create policy "users can add self as participant"
on community_conversation_participants for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "users can update own participant state" on community_conversation_participants;
create policy "users can update own participant state"
on community_conversation_participants for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "participants can read messages" on community_messages;
create policy "participants can read messages"
on community_messages for select
to authenticated
using (
  exists (
    select 1
    from community_conversation_participants p
    where p.conversation_id = community_messages.conversation_id
      and p.user_id = (select auth.uid())
  )
);

drop policy if exists "participants can send messages" on community_messages;
create policy "participants can send messages"
on community_messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from community_conversation_participants p
    where p.conversation_id = community_messages.conversation_id
      and p.user_id = (select auth.uid())
  )
);

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
