import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";
import { parseJsonLoose } from "../../lib/parseJsonLoose";

const SYSTEM_PROMPT = `You are a literary visual-extraction assistant. The user pastes a raw excerpt or quote from a book (public domain). Extract ONLY what the passage itself supports — do not invent plot details beyond it, and do not rely on outside knowledge of the book. Respond with ONLY raw JSON (no markdown fences, no commentary) in exactly this shape:
{"found":true|false,"book":"<book/source title if given or clearly mentioned, else empty string>","character":{"name":"<character name from the passage, or a short label like 'The Narrator' if unnamed>","blurb":"<one vivid sentence, max 20 words, describing them, based only on this passage>","era":"<short setting tag if inferable from the passage, else empty string>","appearance":"<2-3 sentence physical description a portrait artist could work from, built ONLY from details in the passage — build, hair, expression, clothing, mood. If the passage lacks physical detail, infer the barest neutral detail consistent with tone, never invent specifics the text doesn't support>","bio":"<1-2 sentence summary of what this passage reveals about them>","quotes":["<the single most evocative line copied VERBATIM from the pasted passage, max ~25 words, no surrounding quotation marks added>"]}}
Rules:
- "quotes" MUST be copied verbatim from the pasted text, not paraphrased or invented.
- If the passage does not describe or feature any person/character at all, set "found" to false and omit "character".
- Never include text outside the JSON object.`;

export async function POST(request) {
  const supabase = await createClient();
  let creditSpent = false;
  let userId = null;

  try {
    const { excerpt, source } = await request.json();

    if (!excerpt || !excerpt.trim()) {
      return NextResponse.json({ error: "Paste a passage first." }, { status: 400 });
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

    const userText = source && source.trim()
      ? `Source: "${source.trim()}".\nPassage:\n${excerpt.trim()}`
      : `Passage:\n${excerpt.trim()}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userText }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      await supabase.rpc("refund_credit", { p_user_id: userId });
      return NextResponse.json({ error: "Couldn't reach the extraction service." }, { status: 502 });
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
      console.error("extract route JSON parse error:", parseErr, textBlock.text);
      await supabase.rpc("refund_credit", { p_user_id: userId });
      return NextResponse.json({ error: "That passage confused the extractor. Try again." }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("extract route error:", err);
    if (creditSpent && userId) {
      await supabase.rpc("refund_credit", { p_user_id: userId });
    }
    return NextResponse.json({ error: "Something went wrong extracting that passage." }, { status: 500 });
  }
}
