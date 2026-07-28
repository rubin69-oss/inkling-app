import { BookOpen, Wand2, Palette, Repeat, ScrollText, Download } from "lucide-react";
import { PageShell } from "../_shared/PageShell";

export const metadata = { title: "Features — Inkling" };

const FEATURES = [
  {
    icon: BookOpen,
    title: "AI Casting from Any Book",
    body: "Name a title and Inkling reads it, identifies major characters, and extracts the descriptive detail a portrait artist would need — no manual prompt writing required.",
  },
  {
    icon: ScrollText,
    title: "Paste a Passage",
    body: "Don't know the title, or working from your own excerpt? Paste any passage and Inkling extracts a character's traits directly from that text — including a verbatim quote pulled from what you pasted.",
  },
  {
    icon: Palette,
    title: "10 Original Art Styles",
    body: "Oil Painting, Watercolor, Renaissance, Anime, Ink Sketch, Art Nouveau, Impressionist, Gothic, Realism, and Painterly — pick a style before you search, or repaint any character afterward.",
  },
  {
    icon: Repeat,
    title: "Character Consistency",
    body: "Keep a character's identity intact across new scenes and outfits. Inkling conditions each new image on the original portrait, so it's recognizably the same character, not a fresh roll of the dice.",
  },
  {
    icon: Wand2,
    title: "Biographies & Quotes",
    body: "Every character comes with a short biography and a real line pulled from the source text — not a generic summary.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    body: "Turn any portrait into a matted Poster, a phone or desktop Wallpaper, a 300 DPI Print, a BookTok Art Card, an Aesthetic Board, or a Manuscript Pitch Deck — all generated client-side, free.",
  },
];

export default function Features() {
  return (
    <PageShell title="What Inkling Can Do" subtitle="Every feature below is live in the app today — nothing here is a roadmap item." wide>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <f.icon size={22} className="feature-icon" />
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
