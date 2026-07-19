import { createSupabaseAdminClient, createSupabasePublicClient } from "@/lib/supabase";
import type { ShopOrder, ShopProduct, ShopSettings } from "@/types/content";

export const fallbackShopSettings: ShopSettings = {
  id: "main",
  eyebrow: "Shop met aandacht",
  title: "Geef iets kleins dat dichtbij blijft",
  intro:
    "Voor wie iemand mist, iemand wil steunen of een herinnering tastbaar wil maken. Elk product is gekozen met hart: ingetogen, bruikbaar en klaar om met aandacht te geven.",
  service_points: ["met zorg gekozen", "veilig afrekenen via Stripe", "kleine oplages, snel weg"],
  checkout_note: "Zoek je een rustig cadeau? Kies wat past bij het moment; groot uitleggen hoeft niet."
};

export const fallbackShopProducts: ShopProduct[] = [
  {
    id: "fallback-serene-vlam-kaarsenset",
    title: "Serene Vlam kaarsenset",
    slug: "serene-vlam-kaarsenset",
    description: "Drie matte keramieken kaarsen in pine, sage en paper. Voor naast een foto, op tafel of op die plek in huis waar je even stilvalt. Een zacht cadeau voor iemand die rouw niet steeds wil uitleggen.",
    short_description: "Drie kaarsen voor een klein ritueel thuis, met liefde gekozen voor stille dagen.",
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
    description: "Drie glazen herinnerkaarsen op een houten tray. Mooi om te branden bij een naam, een datum of een moment waarop iemand extra dichtbij voelt. Een cadeau dat niets hoeft op te lossen, maar wel iets zegt.",
    short_description: "Glazen herinnerkaarsen voor aandacht, nabijheid en een naam die mag blijven.",
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
    description: "Een giftbox met drie warme kaarsen voor een stille avond, herdenkingsplek of eerste moeilijke datum. Ingetogen verpakt, zodat je iets kunt geven zonder grote woorden te zoeken.",
    short_description: "Een warme giftbox voor herdenken, stilstaan en iemand zacht dichtbij houden.",
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
    title: "Stuk Verdriet tote bag",
    slug: "katoenen-stuk-verdriet-tote-bag",
    description: "Een stevige katoenen tas met het Stuk Verdriet logo in pine groen. Voor boodschappen, boeken, bloemen of spullen die je door de dag heen meeneemt. Sober genoeg voor elke dag, herkenbaar voor wie het voelt.",
    short_description: "Stevige katoenen tas voor dagelijks gebruik, met een herkenbaar teken van steun.",
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
    title: "Fotolijsten trio voor herinneringen",
    slug: "fotolijsten-trio",
    description: "Drie rustige lijsten voor foto's, kaartjes of een briefje dat niet in een la hoort te verdwijnen. Samen vormen ze een kleine herinneringsplek die warm oogt zonder zwaar te worden.",
    short_description: "Drie lijsten voor foto's, kaartjes en herinneringen die zichtbaar mogen blijven.",
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
    title: "Logo sleutelhanger",
    slug: "logo-sleutelhanger-steunproduct",
    description: "Een kleine emaille sleutelhanger in de vorm van het Stuk Verdriet logo. Voor aan je sleutelbos, tas of etui. Je draagt een klein teken mee en steunt tegelijk het platform achter de verhalen.",
    short_description: "Een klein teken aan je sleutelbos, en tegelijk steun voor Stuk Verdriet.",
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
    title: "Sage tote bag",
    slug: "sage-stuk-verdriet-tote-bag",
    description: "Een zachte sage tote met warm paper logo. Stevig voor elke dag en rustig in uitstraling. Mooi als praktisch cadeau voor iemand die vaak onderweg is en iets zachts dichtbij wil dragen.",
    short_description: "Zachte sage tas voor elke dag, praktisch en warm als klein gebaar.",
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
    description: "Een kleine crossbody pouch voor telefoon, sleutels, een briefje of iets dat je letterlijk dichtbij wilt dragen. Naturel canvas met sage band en subtiel logo.",
    short_description: "Kleine pouch voor dagelijkse spullen en een aandenken dat dichtbij mag blijven.",
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
    description: "Een zachte katoenen deken in warme paper tinten met sage randstiksel. Voor op de bank, naast bed of tijdens een avond waarop troost vooral praktisch mag zijn: warmte, rust en iets om vast te pakken.",
    short_description: "Zachte deken voor warmte, rust en een avond waarop iemand iets nodig heeft.",
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
    description: "Een linnen boekje voor namen, zinnen, herinneringen en kleine rituelen. Blanco pagina's, rustige afwerking en genoeg ruimte voor alles wat niet in een app of agenda past.",
    short_description: "Linnen boekje voor woorden, namen en herinneringen die mogen blijven.",
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
    description: "Een matte keramieken mok met pine groene binnenkant en klein Stuk Verdriet logo. Voor koffie, thee of een pauze waarin niemand iets hoeft te zeggen. Fijn voor thuis of als warm gebaar.",
    short_description: "Matte mok voor thee, koffie en een pauze waarin niets hoeft.",
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
    description: "Een set stevige kaarten met enveloppen in rustige Stuk Verdriet tinten. Voor een zin, naam, herinnering of simpel: ik denk aan je. Juist wanneer grote woorden niet passen.",
    short_description: "Kaarten voor steun, herinnering en die ene zin die iemand nodig heeft.",
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
    description: "Een klein linnen trekkoordzakje voor sieraden, kaartjes, steentjes of andere tastbare herinneringen. Naturel met sage koord en subtiel logo. Klein, maar vaak precies genoeg.",
    short_description: "Linnen zakje voor sieraden, kaartjes en kleine herinneringen.",
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
    title: "Ritueelset met lucifers en snuffer",
    slug: "ritueelset-lucifers-en-snuffer",
    description: "Een kleine set voor kaarsrituelen: lucifers in pine sleeve, een messingkleurige snuffer en een rustige tray. Voor wie een vast moment wil maken van aansteken, stilstaan en afsluiten.",
    short_description: "Lucifers, snuffer en tray voor een klein ritueel met aandacht.",
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
    title: "Logo emaille pin",
    slug: "logo-emaille-pin-steunproduct",
    description: "Een kleine emaille pin van het Stuk Verdriet logo. Voor op een jas, tas of etui. Een subtiel teken dat verdriet er mag zijn, en een laagdrempelige manier om het platform te steunen.",
    short_description: "Subtiele pin voor op jas of tas, als klein teken van steun.",
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
    description: "Een kleine box met mini-kaars, blanco kaartje, linnen zakje en herinnersteen. Een compleet gebaar voor iemand die je iets wilt geven, maar niet met lege woorden wilt aankomen.",
    short_description: "Ritueelbox met kaars, kaartje, zakje en steen. Klaar om te geven.",
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
