-- Seed: current board members and foundation details (matches the hardcoded
-- fallback in src/lib/governance.ts). Idempotent via unique-ish display order
-- is not guaranteed, so this seed only runs when the tables are still empty.

insert into public.board_members
  (name, full_name, role, tagline, image_url, image_alt, object_position, display_order, status)
select * from (values
  ('Susan', 'Susan Mathijssen', 'Voorzitter',
   'Oprichtster van Stichting Stuk Verdriet. Moeder van Eva.',
   '/img/portretsuus.png', 'Portret van Susan, voorzitter van Stichting Stuk Verdriet', 'center 38%', 10, 'published'::content_status),
  ('Daniela', 'Daniela Jilesen', 'Secretaris',
   'Mede-oprichtster van Stichting Stuk Verdriet. Moeder van Tycho.',
   '/img/Portret_Daniela.jpeg', 'Portret van Daniela, secretaris van Stichting Stuk Verdriet', 'center 22%', 20, 'published'::content_status),
  ('Anita', 'Anita Franken-Triemstra', 'Penningmeester',
   'Sloot zich als vrijwilliger aan vanuit haar moederhart en haar financiële ervaring.',
   '/img/portret-anita.jpg', 'Portret van Anita, penningmeester van Stichting Stuk Verdriet', 'center 30%', 30, 'published'::content_status)
) as seed(name, full_name, role, tagline, image_url, image_alt, object_position, display_order, status)
where not exists (select 1 from public.board_members);

insert into public.governance_facts
  ("group", label, value, copy, copy_value, hint, href, display_order, status)
select * from (values
  ('organisation', 'Statutaire naam', 'Stichting Stuk Verdriet', false, null, null, null, 10, 'published'::content_status),
  ('organisation', 'Rechtsvorm', 'Stichting', false, null, null, null, 20, 'published'::content_status),
  ('organisation', 'KVK-nummer', '42137342', true, null, 'Kamer van Koophandel', null, 30, 'published'::content_status),
  ('organisation', 'RSIN', '869887294', true, null, 'Fiscaal nummer', null, 40, 'published'::content_status),
  ('contact', 'Vestigingsadres', 'Laagstraat 17, 5038 PA Tilburg', true, null, 'Post- en vestigingsadres', null, 10, 'published'::content_status),
  ('contact', 'E-mail', 'info@stukverdriet.com', false, null, null, 'mailto:info@stukverdriet.com', 20, 'published'::content_status),
  ('contact', 'Website', 'www.stukverdriet.com', false, null, null, 'https://www.stukverdriet.com', 30, 'published'::content_status),
  ('banking', 'Rekeningnummer', 'NL47 RABO 0178 4871 63', true, 'NL47RABO0178487163', 'IBAN, ten name van Stichting Stuk Verdriet', null, 10, 'published'::content_status)
) as seed("group", label, value, copy, copy_value, hint, href, display_order, status)
where not exists (select 1 from public.governance_facts);
