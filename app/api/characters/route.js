import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";
import { parseJsonLoose } from "../../lib/parseJsonLoose";

const SYSTEM_PROMPT = `You are a literary casting director and archivist. Given a book title, and optionally a character name, respond with ONLY raw JSON (no markdown fences, no commentary) in exactly this shape:
{"book":"<normalized book title>","found":true|false,"characters":[{"name":"<character name>","blurb":"<one vivid sentence, max 20 words, no spoilers, original phrasing>","era":"<short setting tag, e.g. 'Regency England'>","appearance":"<2-3 sentence physical description a portrait artist could work from: build, hair, expression, clothing style, mood — no named real actors, no reference to any film/TV adaptation>","bio":"<2-3 sentence biography covering who they are, their role in the story, and their arc, no ending spoilers>","quotes":["<a short line actually spoken by or written about this character in the original public-domain text, quoted as accurately as you can recall, max ~25 words>"]}]}
Rules:
- If a specific character name was given, return exactly 1 character (that one).
- If no character was given, return exactly 3 major characters from the book.
- "appearance" must describe an ORIGINAL interpretation of the character from the text itself, never based on a movie, illustration, or real actor.
- "quotes" must contain 1-2 real lines from the original book's text (it is public domain), remembered as faithfully as possible. If you are not confident of an exact quote, include only the ones you are confident about rather than inventing one. Do NOT wrap the quote text itself in quotation marks — the display layer adds those.
- If the title is not recognizable as a real or well-known work, set "found" to false and "characters" to [].
- Never include text outside the JSON object.`;

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
        model: "claude-sonnet-4-6",
        max_tokens: 1600,
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
