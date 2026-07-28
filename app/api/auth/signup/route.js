import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: name ? { name } : undefined },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const needsConfirmation = !data.session;
    return NextResponse.json({
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      needsConfirmation,
    });
  } catch (err) {
    console.error("signup route error:", err);
    return NextResponse.json({ error: "Something went wrong creating your account." }, { status: 500 });
  }
}
