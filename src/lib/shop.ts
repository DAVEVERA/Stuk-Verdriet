import { createSupabaseAdminClient, createSupabasePublicClient } from "@/lib/supabase";
import type { ShopOrder, ShopProduct, ShopSettings } from "@/types/content";

export const fallbackShopSettings: ShopSettings = {
  id: "main",
  eyebrow: "Stuk Verdriet shop",
  title: "Kleine dingen voor grote dagen",
  intro:
    "Rustige producten om woorden te geven aan gemis, herinneringen vast te houden en iemand dichtbij te laten voelen zonder dat het groot hoeft te worden.",
  service_points: ["zorgvuldig en ingetogen", "veilig afrekenen via Stripe", "voorraad beheerd in het adminportaal"],
  checkout_note: null
};

export const fallbackShopProducts: ShopProduct[] = [
  {
    id: "fallback-serene-vlam-kaarsenset",
    title: "Serene Vlam kaarsenset",
    slug: "serene-vlam-kaarsenset",
    description: "Drie matte keramieken kaarsen in pine, sage en paper tinten. Een rustig setje voor thuis, naast een foto of als klein ritueel op dagen waarop gemis dichtbij is.",
    short_description: "Drie rustige kaarsen in Stuk Verdriet tinten voor kleine rituelen thuis.",
    image_url: "/shop/kaarsenset-serene-vlam.webp",
    price_cents: 2495,
    currency: "eur",
    inventory_count: 30,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: true,
    sort_order: 1
  },
  {
    id: "fallback-herinnerlicht-kaarsenset",
    title: "Herinnerlicht kaarsenset",
    slug: "herinnerlicht-kaarsenset",
    description: "Drie glazen herinnerkaarsen op een houten tray, afgewerkt met een zachte sleeve en subtiel Stuk Verdriet detail. Gemaakt voor aandacht, stilte en nabijheid.",
    short_description: "Glazen herinnerkaarsen met zachte afwerking en subtiel logo-detail.",
    image_url: "/shop/kaarsenset-herinnerlicht.webp",
    price_cents: 2995,
    currency: "eur",
    inventory_count: 24,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 2
  },
  {
    id: "fallback-stille-avond-kaarsenset",
    title: "Stille Avond kaarsenset",
    slug: "stille-avond-kaarsenset",
    description: "Een premium giftbox met drie kaarsen in donkere en warme Stuk Verdriet tinten. Voor een stille avond, een herdenkingsplek of als ingetogen cadeau.",
    short_description: "Een warme giftset voor stilte, aandacht en nabijheid.",
    image_url: "/shop/kaarsenset-stille-avond.webp",
    price_cents: 3495,
    currency: "eur",
    inventory_count: 18,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 3
  },
  {
    id: "fallback-katoenen-tote-bag",
    title: "Katoenen Stuk Verdriet tote bag",
    slug: "katoenen-stuk-verdriet-tote-bag",
    description: "Een stevige naturel katoenen tas met het Stuk Verdriet logo in pine groen. Praktisch, sober en herkenbaar zonder hard te roepen.",
    short_description: "Naturel katoenen tas met het Stuk Verdriet logo, stevig en ingetogen.",
    image_url: "/shop/katoenen-tote-bag.webp",
    price_cents: 1995,
    currency: "eur",
    inventory_count: 50,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 4
  },
  {
    id: "fallback-fotolijsten-trio",
    title: "Fotolijsten trio",
    slug: "fotolijsten-trio",
    description: "Drie fotolijsten in een rustige set: pine hout, naturel hout en sage metaal. Ontworpen als een klein geheel voor foto's, kaartjes of herinneringen.",
    short_description: "Drie fotolijsten in pine, sage en naturel hout als een rustig geheel.",
    image_url: "/shop/fotolijsten-trio.webp",
    price_cents: 3995,
    currency: "eur",
    inventory_count: 20,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 5
  },
  {
    id: "fallback-logo-sleutelhanger-steunproduct",
    title: "Logo sleutelhanger steunproduct",
    slug: "logo-sleutelhanger-steunproduct",
    description: "Een kleine emaille sleutelhanger in de vorm van het Stuk Verdriet logo. Je koopt hem als tastbaar steunproduct voor ons doel.",
    short_description: "Een kleine sleutelhanger van het logo waarmee je ons doel steunt.",
    image_url: "/shop/logo-sleutelhanger.webp",
    price_cents: 995,
    currency: "eur",
    inventory_count: 75,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 6
  },
  {
    id: "fallback-sage-stuk-verdriet-tote-bag",
    title: "Sage Stuk Verdriet tote bag",
    slug: "sage-stuk-verdriet-tote-bag",
    description: "Een tweede tote in zachte sage kleurstelling, met het Stuk Verdriet logo in warm paper. Stevig genoeg voor dagelijks gebruik en rustig genoeg voor de collectie.",
    short_description: "Sage katoenen tas met warm paper logo en stevige canvas afwerking.",
    image_url: "/shop/sage-tote-bag.webp",
    price_cents: 2195,
    currency: "eur",
    inventory_count: 40,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 7
  },
  {
    id: "fallback-crossbody-bewaarpouch",
    title: "Crossbody bewaar pouch",
    slug: "crossbody-bewaarpouch",
    description: "Een kleine katoenen crossbody pouch voor sleutels, telefoon, notitieboekje of iets dat je dichtbij wilt dragen. Naturel canvas met sage band en subtiel logo.",
    short_description: "Kleine crossbody pouch voor dagelijkse spullen of een klein aandenken.",
    image_url: "/shop/crossbody-bewaarpouch.webp",
    price_cents: 2495,
    currency: "eur",
    inventory_count: 35,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 8
  },
  {
    id: "fallback-troostdeken",
    title: "Troostdeken",
    slug: "troostdeken",
    description: "Een zachte katoenen deken in warme paper tinten met sage randstiksel en een klein geweven Stuk Verdriet label. Voor op de bank, naast bed of bij een rustig moment.",
    short_description: "Zachte katoenen deken met sage randstiksel en klein logo-label.",
    image_url: "/shop/troostdeken.webp",
    price_cents: 4995,
    currency: "eur",
    inventory_count: 16,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 9
  },
  {
    id: "fallback-herinnerboekje",
    title: "Herinnerboekje",
    slug: "herinnerboekje",
    description: "Een linnen notitieboekje voor herinneringen, zinnen, namen, rituelen en kleine momenten die je wilt bewaren. Met blanco pagina's en een ingetogen debossed logo.",
    short_description: "Linnen boekje voor herinneringen, rituelen en woorden die mogen blijven.",
    image_url: "/shop/herinnerboekje.webp",
    price_cents: 2295,
    currency: "eur",
    inventory_count: 30,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 10
  },
  {
    id: "fallback-stil-moment-mok",
    title: "Stil moment mok",
    slug: "stil-moment-mok",
    description: "Een matte keramieken mok met pine groene binnenkant en klein Stuk Verdriet logo. Voor koffie, thee of een pauze waarin niets hoeft.",
    short_description: "Matte keramieken mok voor koffie, thee en stille momenten.",
    image_url: "/shop/stil-moment-mok.webp",
    price_cents: 1795,
    currency: "eur",
    inventory_count: 48,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 11
  },
  {
    id: "fallback-woorden-kaartenset",
    title: "Woorden kaartenset",
    slug: "woorden-kaartenset",
    description: "Een set stevige kaarten en enveloppen in Stuk Verdriet tinten. Om iets kleins te sturen wanneer grote woorden niet passen.",
    short_description: "Kaarten en enveloppen voor steun, herinnering en nabijheid.",
    image_url: "/shop/woorden-kaartenset.webp",
    price_cents: 1495,
    currency: "eur",
    inventory_count: 60,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 12
  },
  {
    id: "fallback-linnen-bewaarzakje",
    title: "Linnen bewaarzakje",
    slug: "linnen-bewaarzakje",
    description: "Een klein linnen trekkoordzakje voor sieraden, kaartjes, steentjes of andere kleine herinneringen. Naturel met sage koord en subtiel logo.",
    short_description: "Klein linnen zakje voor tastbare herinneringen en kleine items.",
    image_url: "/shop/linnen-bewaarzakje.webp",
    price_cents: 1295,
    currency: "eur",
    inventory_count: 70,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 13
  },
  {
    id: "fallback-ritueel-lucifers-snuffer",
    title: "Ritueelset lucifers en snuffer",
    slug: "ritueelset-lucifers-en-snuffer",
    description: "Een klein accessoiresetje voor kaarsrituelen: lucifers in pine groene sleeve, een messingkleurige snuffer en een rustige tray.",
    short_description: "Lucifers en snuffer als klein accessoiresetje voor kaarsrituelen.",
    image_url: "/shop/ritueel-lucifers-snuffer.webp",
    price_cents: 1995,
    currency: "eur",
    inventory_count: 28,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 14
  },
  {
    id: "fallback-logo-emaille-pin",
    title: "Logo emaille pin steunproduct",
    slug: "logo-emaille-pin-steunproduct",
    description: "Een kleine emaille pin van het Stuk Verdriet logo. Een laagdrempelig steunproduct dat je op een tas, jas of etui kunt dragen.",
    short_description: "Kleine emaille pin van het logo als laagdrempelig steunproduct.",
    image_url: "/shop/logo-emaille-pin.webp",
    price_cents: 795,
    currency: "eur",
    inventory_count: 90,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 15
  },
  {
    id: "fallback-mini-ritueelset",
    title: "Mini ritueelset",
    slug: "mini-ritueelset",
    description: "Een kleine box met mini-kaars, blanco kaartje, linnen zakje en herinnersteen. Voor een rustig moment thuis of als ingetogen steun aan iemand anders.",
    short_description: "Kleine ritueelbox met mini-kaars, kaartje, zakje en herinnersteen.",
    image_url: "/shop/mini-ritueelset.webp",
    price_cents: 2795,
    currency: "eur",
    inventory_count: 22,
    stripe_price_id: null,
    stripe_product_id: null,
    status: "published",
    featured: false,
    sort_order: 16
  }
];

export function formatShopPrice(priceCents: number, currency = "eur") {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(priceCents / 100);
}

export async function getPublishedShopProducts() {
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallbackShopProducts;

  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data?.length) return fallbackShopProducts;
  return data as ShopProduct[];
}

export async function getShopSettings() {
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallbackShopSettings;

  const { data, error } = await supabase.from("shop_settings").select("*").eq("id", "main").maybeSingle();
  if (error || !data) return fallbackShopSettings;
  return data as ShopSettings;
}

export async function getAdminShopProducts() {
  const admin = createSupabaseAdminClient();
  if (!admin) return fallbackShopProducts;

  const { data, error } = await admin
    .from("shop_products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return fallbackShopProducts;
  return (data ?? []) as ShopProduct[];
}

export async function getAdminShopOrders() {
  const admin = createSupabaseAdminClient();
  if (!admin) return [] as ShopOrder[];

  const { data, error } = await admin
    .from("shop_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return [];
  return (data ?? []) as ShopOrder[];
}

export async function getAdminShopSettings() {
  const admin = createSupabaseAdminClient();
  if (!admin) return fallbackShopSettings;

  const { data, error } = await admin.from("shop_settings").select("*").eq("id", "main").maybeSingle();
  if (error || !data) return fallbackShopSettings;
  return data as ShopSettings;
}
