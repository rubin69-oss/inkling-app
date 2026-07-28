import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ credits: null });
    }

    const { data } = await supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      return NextResponse.json({ credits: data.balance });
    }

    // First time we've seen this user — grant the starting free credits.
    const { data: created } = await supabase
      .from("credit_balances")
      .insert({ user_id: user.id, balance: 3 })
      .select("balance")
      .single();

    return NextResponse.json({ credits: created?.balance ?? 3 });
  } catch (err) {
    console.error("credits route error:", err);
    return NextResponse.json({ credits: null });
  }
}
