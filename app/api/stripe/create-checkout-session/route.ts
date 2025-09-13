import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe"

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, userEmail } = body; // expected: 'subscription' or 'one_time'

    const defaultUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? defaultUrl}/?checkout=success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? defaultUrl}/?checkout=canceled`;

    let session;

    if (mode === "subscription") {
      // price ID should be configured in env or replaced with your Stripe Price ID for recurring EUR 11.99
      const priceId = process.env.STRIPE_PRICE_SUBSCRIPTION_ID;
      if (!priceId) {
        return NextResponse.json({ error: "Missing STRIPE_PRICE_SUBSCRIPTION_ID" }, { status: 500 });
      }

      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: userEmail, // prefill customer email
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });


    } else if (mode === "one_time") {
      // price ID for one-time 200 EUR
      const priceId = process.env.STRIPE_PRICE_ONETIME_ID;
      if (!priceId) {
        return NextResponse.json({ error: "Missing STRIPE_PRICE_ONETIME_ID" }, { status: 500 });
      }

      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: userEmail, // prefill customer email
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: { message?: string } | any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
