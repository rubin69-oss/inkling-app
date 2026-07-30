import { NextResponse } from "next/server";
import { STYLE_PROMPTS, DEFAULT_STYLE } from "../../lib/styles";

export const maxDuration = 60;

function buildPrompt({ name, book, era, appearance, style }) {
  const styleDescription = STYLE_PROMPTS[style] || STYLE_PROMPTS[DEFAULT_STYLE];
  return [
    `Editorial book-illustration portrait of a fictional character named "${name}" from the novel "${book}".`,
    era ? `Setting: ${era}.` : "",
    appearance ? `Appearance: ${appearance}` : "",
    `Style: ${styleDescription}, waist-up portrait, facing slightly off-camera.`,
    "No text, no logos, no book covers, no reference to any actor or existing film/TV adaptation — an original artistic interpretation only.",
  ].filter(Boolean).join(" ");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, book, era, appearance, style, quality, size } = body || {};

    if (!name || !book) {
      return NextResponse.json({ error: "Character name and book are required." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing OPENAI_API_KEY. Add it to .env.local and restart." },
        { status: 500 }
      );
    }

    const prompt = buildPrompt({ name, book, era, appearance, style });
    const imageSize = size === "portrait" ? "1024x1536" : size === "landscape" ? "1536x1024" : "1024x1024";

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: imageSize,
        quality: quality === "high" ? "high" : "medium",
        n: 1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI image API error:", errText);
      return NextResponse.json(
        { error: "Image generation failed. Check your OPENAI_API_KEY and account credits." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image returned." }, { status: 502 });
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error("portrait route error:", err);
    return NextResponse.json({ error: "Something went wrong generating that portrait." }, { status: 500 });
  }
}
