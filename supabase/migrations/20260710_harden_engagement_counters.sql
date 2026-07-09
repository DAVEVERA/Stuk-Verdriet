-- Hardening van de engagement-tellers op interviews en reacties.
--
-- PROBLEEM
-- Bezoekers hadden via de publieke anon-sleutel rechtstreeks UPDATE-recht op de
-- tellerkolommen (like_count, share_count, comment_count). Daardoor kon iedereen
-- die kolommen naar willekeurige waarden zetten met een directe REST-call, buiten
-- de server actions om. Dit is geen datalek, maar wel manipulatie/vandalisme van
-- publieke cijfers.
--
-- OPLOSSING
-- Neem de directe UPDATE-rechten weg en bied gecontroleerde SECURITY DEFINER
-- functies aan die alleen +/-1 toestaan (like/share) of exact hertellen uit de
-- bronrijen. De server actions in src/lib/interview-actions.ts roepen deze
-- functies aan.
--
-- VOLGORDE VAN UITROLLEN (belangrijk)
-- Deze migratie hoort samen met de bijgewerkte code in interview-actions.ts.
-- Voer de migratie uit en deploy de code er direct omheen. In het korte moment
-- ertussen worden tellers niet bijgewerkt; er verschijnen geen fouten voor
-- bezoekers (de acties negeren fouten stil en de UI blijft werken).

-- 1. Gecontroleerde tellerfuncties -------------------------------------------

-- Anonieme like/unlike: precies +/-1, nooit onder 0, alleen gepubliceerd.
create or replace function public.bump_interview_like(p_interview_id uuid, p_delta int)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update interviews
  set like_count = greatest(0, like_count + case when p_delta < 0 then -1 else 1 end),
      updated_at = now()
  where id = p_interview_id and status = 'published';
end;
$$;

-- Deel-actie: altijd +1, alleen gepubliceerd.
create or replace function public.bump_interview_share(p_interview_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update interviews
  set share_count = greatest(0, share_count + 1),
      updated_at = now()
  where id = p_interview_id and status = 'published';
end;
$$;

-- Exacte hertelling van de like-teller uit interview_likes (ingelogde gebruikers).
create or replace function public.recount_interview_likes(p_interview_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update interviews
  set like_count = (select count(*) from interview_likes where interview_id = p_interview_id),
      updated_at = now()
  where id = p_interview_id;
end;
$$;

-- Exacte hertelling van de reactie-teller (goedgekeurde top-level reacties).
create or replace function public.recount_interview_comments(p_interview_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update interviews
  set comment_count = (
        select count(*) from interview_comments
        where interview_id = p_interview_id
          and status = 'approved'
          and parent_comment_id is null
      ),
      updated_at = now()
  where id = p_interview_id;
end;
$$;

-- Exacte hertelling van de like-teller op een reactie (ingelogde gebruikers).
create or replace function public.recount_comment_likes(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update interview_comments
  set like_count = (select count(*) from comment_likes where comment_id = p_comment_id),
      updated_at = now()
  where id = p_comment_id;
end;
$$;

-- 2. Rechten: alleen uitvoeren via de functies, niet meer rechtstreeks --------

-- Eerst de execute-rechten op de nette functies geven.
grant execute on function public.bump_interview_like(uuid, int) to anon, authenticated;
grant execute on function public.bump_interview_share(uuid) to anon, authenticated;
grant execute on function public.recount_interview_likes(uuid) to authenticated;
grant execute on function public.recount_interview_comments(uuid) to anon, authenticated;
grant execute on function public.recount_comment_likes(uuid) to authenticated;

-- Daarna de directe UPDATE-rechten op de tellerkolommen intrekken en de
-- toegeeflijke policies verwijderen die deze updates toestonden.
revoke update (like_count, share_count, comment_count) on interviews from anon, authenticated;
revoke update (like_count) on interview_comments from anon, authenticated;

drop policy if exists "Anyone can update engagement counters" on interviews;
drop policy if exists "Authenticated can update comment like counter" on interview_comments;
