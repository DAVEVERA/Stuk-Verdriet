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
