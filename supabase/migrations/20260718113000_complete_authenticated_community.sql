alter table public.community_replies
  drop constraint if exists community_replies_body_length;

alter table public.community_replies
  add constraint community_replies_body_length
  check (char_length(trim(body)) between 1 and 2000);

create index if not exists community_posts_user_status_created_idx
  on public.community_posts(user_id, status, created_at desc);

create index if not exists community_replies_user_status_created_idx
  on public.community_replies(user_id, status, created_at desc);

grant delete on public.community_supports to authenticated;

drop policy if exists "users can read own posts" on public.community_posts;
create policy "users can read own posts"
on public.community_posts for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can read own replies" on public.community_replies;
create policy "users can read own replies"
on public.community_replies for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "authenticated users remove own support" on public.community_supports;
create policy "authenticated users remove own support"
on public.community_supports for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.refresh_reply_count_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.refresh_post_counts(coalesce(new.post_id, old.post_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.refresh_support_count_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.refresh_post_counts(coalesce(new.post_id, old.post_id));
  return coalesce(new, old);
end;
$$;

insert into public.community_posts (
  id, user_id, author_name, author_display_type, title, slug, body, image_url,
  category, post_type, resource_url, resource_label, tags, target_group, status,
  created_at, updated_at
)
values
  (
    '10000000-0000-4000-8000-000000000001', null, null, 'anonymous',
    'Hoe houd je ruimte voor iemand die gemist wordt?',
    'ruimte-voor-iemand-die-gemist-wordt',
    'Soms wil ik iemands naam blijven noemen, maar ik twijfel of anderen dat zwaar vinden. Hoe doen jullie dat op verjaardagen, gewone dagen of momenten waarop iemand ineens heel dichtbij voelt?',
    null, 'Rouw algemeen', 'question', null, null, array['herkenning'], 'naasten',
    'approved', '2026-07-14T10:00:00.000Z', '2026-07-14T10:00:00.000Z'
  ),
  (
    '10000000-0000-4000-8000-000000000002', null, 'Susan', 'first_name',
    'Een klein ritueel voor een zware dag',
    'klein-ritueel-voor-een-zware-dag',
    'Op dagen waarop alles scherp voelt, helpt het mij om iets kleins te doen dat niet hoeft te worden uitgelegd. Een kaars aan, een wandeling, een liedje, of gewoon even hardop zeggen: vandaag mis ik je.',
    null, 'Herinneren', 'tip', null, null, array['ritueel', 'herinneren'], 'ouders',
    'approved', '2026-07-13T18:20:00.000Z', '2026-07-13T18:20:00.000Z'
  ),
  (
    '10000000-0000-4000-8000-000000000003', null, 'Daniela', 'first_name',
    'Wat zeg je tegen iemand die net slecht nieuws heeft gekregen?',
    'wat-zeg-je-bij-slecht-nieuws',
    'Ik merk dat veel mensen bang zijn om iets verkeerds te zeggen. Misschien helpt het om niet te zoeken naar de perfecte zin, maar naar aanwezigheid. Iets als: ik weet niet wat ik moet zeggen, maar ik ben er.',
    null, 'Voor de omgeving', 'story', null, null, array['woorden', 'naasten'], 'vrienden',
    'approved', '2026-07-12T12:45:00.000Z', '2026-07-12T12:45:00.000Z'
  ),
  (
    '10000000-0000-4000-8000-000000000004', null, null, 'anonymous',
    'Handige route: hulp en ondersteuning',
    'handige-route-hulp-en-ondersteuning',
    'Voor wie merkt dat lezen alleen niet genoeg is: verzamel hier rustige routes naar hulp, lotgenotencontact en steun die past bij rouw, ziekte of langdurige spanning.',
    null, 'Hulp & ondersteuning', 'link', '/themas/hulp-en-ondersteuning',
    'Bekijk hulp en ondersteuning', array['hulp', 'lotgenoten'], null,
    'approved', '2026-07-11T09:15:00.000Z', '2026-07-11T09:15:00.000Z'
  )
on conflict (slug) do nothing;
