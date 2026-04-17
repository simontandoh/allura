import Stripe from "stripe";
import { NextResponse } from "next/server";

type CreateIntentBody = {
  items?: Array<{
    id?: string;
    name?: string;
    price?: number | string;
    quantity?: number | string;
  }>;
};

function toCents(value: unknown) {
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export async function POST(req: Request) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json(
        { error: "Server not configured: missing STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as CreateIntentBody;
    const items = Array.isArray(body.items) ? body.items : [];

    const amount = items.reduce((sum, item) => {
      const quantity = Math.max(1, Number(item?.quantity ?? 1) || 1);
      return sum + toCents(item?.price) * quantity;
    }, 0);

    if (!amount) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-02-24.acacia" });
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

