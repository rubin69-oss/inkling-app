import { BlogPostShell } from "../_shared";

export const metadata = { title: "A Field Guide to All 10 Art Styles — Inkling Blog" };

const STYLE_NOTES = [
  ["Painterly", "The default. Dramatic single-source lighting and a muted literary palette — a safe, moody first choice for almost any character."],
  ["Oil Painting", "Classical, visible brushstrokes and Old Master studio lighting. Good for characters who feel like they belong in a portrait gallery."],
  ["Realism", "Photorealistic fine-art rendering with natural, neutral lighting. Best when you want the least stylization possible."],
  ["Watercolor", "Loose pigment bleeds and paper texture. Softer, more delicate — flatters wistful or melancholic characters."],
  ["Renaissance", "Egg-tempera and oil glazing, formal three-quarter pose, gilded backgrounds. Built for anyone regal, ancient, or ceremonial."],
  ["Anime", "Clean cel-shaded linework and flat, vibrant color. The obvious pick for stylized or larger-than-life characters."],
  ["Ink Sketch", "Monochrome pen-and-wash with crosshatched shading. Reads as immediate and unfinished — good for morally ambiguous characters."],
  ["Art Nouveau", "Flowing ornamental linework and floral borders, in the spirit of Alphonse Mucha. Best for characters tied to beauty or nature."],
  ["Impressionist", "Short visible brushstrokes and soft atmospheric light over hard detail. Flattering, dreamlike, a little unresolved."],
  ["Gothic", "Deep chiaroscuro shadow and candlelit mood. The obvious choice for anything from a horror or gothic-romance novel."],
];

export default function Post() {
  return (
    <BlogPostShell title="A Field Guide to All 10 Art Styles" date="July 27, 2026">
      <p>
        Every character card lets you repaint a portrait in a different style without starting
        over, so it's worth knowing what each one is actually good at. Here's the honest rundown.
      </p>
      {STYLE_NOTES.map(([name, note]) => (
        <p key={name}>
          <strong>{name}.</strong> {note}
        </p>
      ))}
      <p>
        None of these are locked to a genre — a watercolor Dracula or a Gothic Elizabeth Bennet
        both work, and sometimes the mismatch is the interesting part. The style picker is right
        above the search box, and every character card has its own style dropdown too, so nothing
        is a one-shot decision.
      </p>
    </BlogPostShell>
  );
}
