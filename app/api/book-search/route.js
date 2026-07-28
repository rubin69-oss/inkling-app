import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ titles: [] });
    }

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=title,author_name,first_publish_year&limit=20`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Inkling/1.0 (character-portrait app; contact via app)" },
    });

    if (!res.ok) {
      return NextResponse.json({ titles: [] });
    }

    const data = await res.json();
    const seen = new Set();
    const titles = [];

    for (const doc of data.docs || []) {
      const title = doc.title?.trim();
      if (!title) continue;
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      titles.push({ title, author: doc.author_name?.[0] || null });
      if (titles.length >= 8) break;
    }

    return NextResponse.json({ titles });
  } catch (err) {
    console.error("book-search route error:", err);
    return NextResponse.json({ titles: [] });
  }
}
