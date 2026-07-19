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
