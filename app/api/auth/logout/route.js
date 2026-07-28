import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("logout route error:", err);
    return NextResponse.json({ error: "Something went wrong signing you out." }, { status: 500 });
  }
}
