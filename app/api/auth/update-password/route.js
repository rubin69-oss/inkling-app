import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Your reset link has expired. Request a new one and try again." },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("update-password route error:", err);
    return NextResponse.json({ error: "Something went wrong updating your password." }, { status: 500 });
  }
}
