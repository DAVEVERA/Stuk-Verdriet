import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { ShopOrderItem, ShopProduct } from "@/types/content";

export async function POST(request: Request) {
  const formData = await request.formData();
  const productId = String(formData.get("product_id") ?? "").trim();
  const quantity = Math.min(10, Math.max(1, Number(formData.get("quantity") ?? 1)));
  const origin = new URL(request.url).origin;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

  if (!productId) {
    return NextResponse.redirect(new URL("/shop?checkout=missing-product", siteUrl), 303);
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.redirect(new URL("/shop?checkout=missing-supabase", siteUrl), 303);
  }

  const { data: product, error } = await admin
    .from("shop_products")
    .select("*")
    .eq("id", productId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !product) {
    return NextResponse.redirect(new URL("/shop?checkout=unavailable", siteUrl), 303);
  }

  const shopProduct = product as ShopProduct;
  if (shopProduct.inventory_count === 0) {
    return NextResponse.redirect(new URL("/shop?checkout=sold-out", siteUrl), 303);
  }

  const item: ShopOrderItem = {
    product_id: shopProduct.id,
    title: shopProduct.title,
    quantity,
    unit_amount_cents: shopProduct.price_cents,
    currency: shopProduct.currency
  };
  const totalCents = shopProduct.price_cents * quantity;

  const { data: order, error: orderError } = await admin
    .from("shop_orders")
    .insert({
      status: "pending",
      total_cents: totalCents,
      currency: shopProduct.currency,
      items: [item],
      metadata: {
        product_slug: shopProduct.slug,
        checkout_source: "shop"
      }
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.redirect(new URL("/shop?checkout=order", siteUrl), 303);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.redirect(new URL(`/shop?checkout=stripe-missing&order=${order.id}`, siteUrl), 303);
  }

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", `${siteUrl}/shop?checkout=success&order=${order.id}`);
  body.set("cancel_url", `${siteUrl}/shop?checkout=cancelled&order=${order.id}`);
  body.set("client_reference_id", order.id);
  body.set("metadata[order_id]", order.id);
  body.set("line_items[0][quantity]", String(quantity));
  if (shopProduct.stripe_price_id) {
    body.set("line_items[0][price]", shopProduct.stripe_price_id);
  } else {
    body.set("line_items[0][price_data][currency]", shopProduct.currency);
    body.set("line_items[0][price_data][unit_amount]", String(shopProduct.price_cents));
    body.set("line_items[0][price_data][product_data][name]", shopProduct.title);
    if (shopProduct.short_description) {
      body.set("line_items[0][price_data][product_data][description]", shopProduct.short_description);
    }
    if (shopProduct.image_url?.startsWith("https://")) {
      body.append("line_items[0][price_data][product_data][images][]", shopProduct.image_url);
    }
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${stripeKey}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });

  const checkout = await stripeResponse.json() as { id?: string; url?: string; payment_intent?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !checkout.url) {
    await admin
      .from("shop_orders")
      .update({
        status: "failed",
        metadata: {
          product_slug: shopProduct.slug,
          checkout_source: "shop",
          stripe_error: checkout.error?.message ?? "checkout-session-failed"
        }
      })
      .eq("id", order.id);
    return NextResponse.redirect(new URL(`/shop?checkout=stripe&order=${order.id}`, siteUrl), 303);
  }

  await admin
    .from("shop_orders")
    .update({
      stripe_checkout_session_id: checkout.id ?? null,
      stripe_payment_intent_id: typeof checkout.payment_intent === "string" ? checkout.payment_intent : null
    })
    .eq("id", order.id);

  return NextResponse.redirect(checkout.url, 303);
}
