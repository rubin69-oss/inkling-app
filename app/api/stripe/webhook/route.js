import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { stripe } from "../../../lib/stripe";

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode === "payment") {
        const userId = session.client_reference_id || session.metadata?.user_id;
        const credits = parseInt(session.metadata?.credits || "0", 10);

        if (userId && credits > 0) {
          // Avoid double-crediting if Stripe retries the webhook
          const { data: already } = await supabaseAdmin
            .from("credit_transactions")
            .select("id")
            .eq("stripe_checkout_session_id", session.id)
            .maybeSingle();

          if (!already) {
            await supabaseAdmin.from("credit_transactions").insert({
              user_id: userId,
              amount: credits,
              reason: "purchase",
              stripe_checkout_session_id: session.id,
            });

            const { data: existing } = await supabaseAdmin
              .from("credit_balances")
              .select("balance")
              .eq("user_id", userId)
              .maybeSingle();

            const newBalance = (existing?.balance ?? 3) + credits;

            await supabaseAdmin.from("credit_balances").upsert(
              { user_id: userId, balance: newBalance, updated_at: new Date().toISOString() },
              { onConflict: "user_id" }
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("stripe webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}
