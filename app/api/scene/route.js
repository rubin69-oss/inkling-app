import { NextResponse } from "next/server";
import { STYLE_PROMPTS, DEFAULT_STYLE } from "../../lib/styles";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { referenceImage, name, book, scene, style } = body || {};

    if (!referenceImage || !scene || !scene.trim() || !name || !book) {
      return NextResponse.json(
        { error: "Reference image, character, and scene description are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing OPENAI_API_KEY. Add it to .env.local and restart." },
        { status: 500 }
      );
    }

    const base64 = referenceImage.includes(",") ? referenceImage.split(",")[1] : referenceImage;
    const buffer = Buffer.from(base64, "base64");
    const styleDescription = STYLE_PROMPTS[style] || STYLE_PROMPTS[DEFAULT_STYLE];

    const prompt = [
      `This is the fictional character "${name}" from the novel "${book}", shown in the reference image.`,
      "Keep the exact same face, identity, proportions, and likeness as the reference — it must clearly be recognizable as the same character.",
      `Change only the scene, pose, and/or outfit to: ${scene.trim()}.`,
      `Maintain the art style: ${styleDescription}.`,
      "No text, no logos, no watermark, no reference to any actor or existing film/TV adaptation.",
    ].join(" ");

    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("image", new Blob([buffer], { type: "image/png" }), "reference.png");
    form.append("prompt", prompt);
    form.append("size", "1024x1024");
    form.append("quality", "low");
    form.append("n", "1");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI image edit API error:", errText);
      return NextResponse.json(
        { error: "Scene generation failed. Check your OPENAI_API_KEY and account credits." },
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
    console.error("scene route error:", err);
    return NextResponse.json({ error: "Something went wrong generating that scene." }, { status: 500 });
  }
}
