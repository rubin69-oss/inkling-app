import { NextResponse } from "next/server";
import { stripe, PRICE_IDS, CREDIT_AMOUNTS } from "../../../lib/stripe";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request) {
  try {
    const { plan } = await request.json();
    const priceId = PRICE_IDS[plan];
    const credits = CREDIT_AMOUNTS[plan];

    if (!priceId || !credits) {
      return NextResponse.json({ error: "Unknown credit pack." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in first to buy credits." }, { status: 401 });
    }

    const origin = request.headers.get("origin") || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/success`,
      cancel_url: `${origin}/billing/canceled`,
      metadata: { user_id: user.id, plan, credits: String(credits) },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout route error:", err);
    return NextResponse.json({ error: "Something went wrong starting checkout." }, { status: 500 });
  }
}
