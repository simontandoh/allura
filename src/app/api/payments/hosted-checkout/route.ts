import Stripe from "stripe";

function getOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (!host) return "http://localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function GET(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  }

  const url = new URL(req.url);
  const amount = Math.max(0, Number(url.searchParams.get("amount") || 0) || 0);
  if (!amount) return new Response("Missing amount", { status: 400 });

  const origin = getOrigin(req);
  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-02-24.acacia" });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Allurahouse Order" },
          unit_amount: Math.round(amount),
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/checkout-success`,
    cancel_url: `${origin}/checkout`,
  });

  return Response.redirect(session.url!, 303);
}

