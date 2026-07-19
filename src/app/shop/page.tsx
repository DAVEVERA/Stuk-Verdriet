import Image from "next/image";
import type { Metadata } from "next";
import { HeartHandshake, PackageCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { formatShopPrice, getPublishedShopProducts, getShopSettings } from "@/lib/shop";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop",
  description: "Een kleine Stuk Verdriet shop met zachte, betekenisvolle producten rond herinneren, rouw en nabijheid.",
  alternates: {
    canonical: "/shop"
  }
};

export default async function ShopPage() {
  const [products, settings] = await Promise.all([getPublishedShopProducts(), getShopSettings()]);
  const featured = products.find((product) => product.featured) ?? products[0];
  const icons = [Sparkles, HeartHandshake, Truck];
  const productJsonLd = products.map((product) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.short_description ?? product.description ?? undefined,
    image: product.image_url ? [new URL(product.image_url, site.url).toString()] : undefined,
    url: new URL(`/shop#${product.slug}`, site.url).toString(),
    brand: {
      "@type": "Brand",
      name: "Stuk Verdriet"
    },
    offers: {
      "@type": "Offer",
      price: (product.price_cents / 100).toFixed(2),
      priceCurrency: product.currency.toUpperCase(),
      availability: product.inventory_count === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: new URL(`/shop#${product.slug}`, site.url).toString()
    }
  }));

  return (
    <section className="shop-page" aria-labelledby="shop-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <div className="shop-hero">
        <div className="shop-hero-copy">
          <p className="eyebrow">{settings.eyebrow}</p>
          <h1 id="shop-title">{settings.title}</h1>
          <p>{settings.intro}</p>
          <div className="shop-hero-actions">
            <a className="button" href="#shop-producten">
              <ShoppingBag size={18} aria-hidden /> Bekijk producten
            </a>
            <span><PackageCheck size={17} aria-hidden /> Kleine oplages, zorgvuldig gekozen</span>
          </div>
        </div>
        {featured ? (
          <article className="shop-featured-product">
            <div className="shop-featured-media">
              {featured.image_url ? <Image src={featured.image_url} alt={`Productbeeld van ${featured.title}`} fill sizes="(max-width: 820px) 100vw, 420px" priority /> : <span>Stuk Verdriet</span>}
            </div>
            <div className="shop-featured-copy">
              <span>Uitgelicht in de shop</span>
              <strong>{featured.title}</strong>
              <p>{featured.short_description ?? featured.description}</p>
              <small>{formatShopPrice(featured.price_cents, featured.currency)}</small>
            </div>
          </article>
        ) : null}
      </div>

      <div className="shop-service-row" aria-label="Shop kenmerken">
        {settings.service_points.slice(0, 3).map((point, index) => {
          const Icon = icons[index] ?? Sparkles;
          return <span key={point}><Icon size={17} aria-hidden /> {point}</span>;
        })}
      </div>
      {settings.checkout_note ? <p className="shop-checkout-note">{settings.checkout_note}</p> : null}

      <div className="shop-section-heading" id="shop-producten">
        <p className="eyebrow">Producten</p>
        <h2>Voor woorden, herinneringen en kleine rituelen</h2>
      </div>

      <div className="shop-product-grid" aria-label="Shop producten">
        {products.map((product) => {
          const soldOut = product.inventory_count === 0;
          return (
            <article className="shop-product-card" id={product.slug} key={product.id}>
              <div className="shop-product-image">
                {product.image_url ? <Image src={product.image_url} alt={`Productbeeld van ${product.title}`} fill sizes="(max-width: 720px) 100vw, 33vw" /> : <span>Stuk Verdriet</span>}
              </div>
              <div className="shop-product-body">
                <div>
                  <span>{product.inventory_count === null ? "Op aanvraag" : `${product.inventory_count} beschikbaar`}</span>
                  <h2>{product.title}</h2>
                  <p>{product.short_description ?? product.description}</p>
                </div>
                <div className="shop-product-footer">
                  <strong>{formatShopPrice(product.price_cents, product.currency)}</strong>
                  <form action="/api/shop/checkout" method="post">
                    <input type="hidden" name="product_id" value={product.id} readOnly />
                    <input type="hidden" name="quantity" value="1" readOnly />
                    <button className="button" type="submit" disabled={soldOut}>
                      {soldOut ? "Uitverkocht" : "Bestel"}
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
