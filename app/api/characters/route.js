import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";
import { parseJsonLoose } from "../../lib/parseJsonLoose";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a literary casting director. Given a book title, and optionally a character name, respond with ONLY raw JSON (no markdown fences, no commentary) in exactly this shape:
{"book":"<normalized book title>","found":true|false,"characters":[{"name":"<character name>","blurb":"<one vivid sentence, max 20 words, no spoilers>","era":"<short setting tag>","appearance":"<1-2 concise sentences a portrait artist could work from: build, hair, expression, clothing — no real actors/adaptations>","bio":"<1-2 concise sentences: who they are, their role, no ending spoilers>","quotes":["<one short real line from the original public-domain text, max ~20 words>"]}]}
Rules:
- If a character name was given, return exactly 1 character (that one). Else return exactly 3 major characters from the book.
- "appearance" is an ORIGINAL interpretation from the text itself, never based on a movie, illustration, or real actor.
- "quotes" must be a real line remembered as faithfully as possible; include only if confident, do not invent one. Do NOT wrap the quote text itself in quotation marks — the display layer adds those.
- If the title is not recognizable as a real or well-known work, set "found" to false and "characters" to [].
- Be concise. Never include text outside the JSON object.`;

export async function POST(request) {
  const supabase = await createClient();
  let creditSpent = false;
  let userId = null;

  try {
    const { book, character } = await request.json();

    if (!book || !book.trim()) {
      return NextResponse.json({ error: "Book title is required." }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in to reveal characters.", code: "AUTH_REQUIRED" }, { status: 401 });
    }
    userId = user.id;

    const { data: spent, error: spendError } = await supabase.rpc("spend_credit", { p_user_id: user.id });
    if (spendError) {
      console.error("spend_credit error:", spendError);
      return NextResponse.json({ error: "Something went wrong checking your credits." }, { status: 500 });
    }
    if (!spent) {
      return NextResponse.json(
        { error: "You're out of reveal credits. Buy a pack to keep going.", code: "OUT_OF_CREDITS" },
        { status: 402 }
      );
    }
    creditSpent = true;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      await supabase.rpc("refund_credit", { p_user_id: userId });
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart." },
        { status: 500 }
      );
    }

    const userText = character && character.trim()
      ? `Book: "${book}". Character: "${character}".`
      : `Book: "${book}". No specific character given.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userText }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      await supabase.rpc("refund_credit", { p_user_id: userId });
      return NextResponse.json(
        { error: "Couldn't reach the character-reading service." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    if (!textBlock) {
      await supabase.rpc("refund_credit", { p_user_id: userId });
      return NextResponse.json({ error: "No response from model." }, { status: 502 });
    }

    let parsed;
    try {
      parsed = parseJsonLoose(textBlock.text);
    } catch (parseErr) {
      console.error("characters route JSON parse error:", parseErr, textBlock.text);
      await supabase.rpc("refund_credit", { p_user_id: userId });
      return NextResponse.json({ error: "That book confused the casting director. Try again." }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("characters route error:", err);
    if (creditSpent && userId) {
      await supabase.rpc("refund_credit", { p_user_id: userId });
    }
    return NextResponse.json({ error: "Something went wrong reading that book." }, { status: 500 });
  }
}
