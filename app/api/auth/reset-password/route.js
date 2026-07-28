import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset-password route error:", err);
    return NextResponse.json({ error: "Something went wrong sending that reset link." }, { status: 500 });
  }
}
