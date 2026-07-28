import { BlogPostShell } from "../_shared";

export const metadata = { title: "Why We Built Inkling — Inkling Blog" };

export default function Post() {
  return (
    <BlogPostShell title="Why We Built Inkling" date="July 27, 2026">
      <p>
        Every reader pictures characters differently. Ask ten people what Elizabeth Bennet looks
        like and you'll get ten different faces — all built from the same handful of sentences in
        the text, filtered through each reader's own imagination. That picture is vivid, personal,
        and almost always stays exactly where it started: in your head.
      </p>
      <p>
        Inkling started as an attempt to put that picture somewhere else — on the page, literally.
        Not by illustrating a "definitive" version of a character (there isn't one), but by taking
        the same descriptive detail a reader's imagination works from — build, hair, expression,
        clothing, era, mood — and asking an AI model to paint an honest interpretation of it.
      </p>
      <p>
        We were specific about a few things early on. Portraits had to be original interpretations,
        never traced from an illustrator's cover art or a film adaptation. The text had to do the
        work — no shortcuts like "make them look like [actor]." And the tool had to work for more
        than just a title search: sometimes you don't have the book in front of you, you just have
        a passage you remember, or one you're reading right now. That's why pasting a raw excerpt
        works the same way searching a title does — the model reads what's actually in front of it.
      </p>
      <p>
        Everything after that — the art styles, the ability to keep a character consistent across
        new scenes, the export formats — grew out of the same basic idea: your mental picture of a
        character is worth taking seriously, and it deserves better than staying invisible.
      </p>
    </BlogPostShell>
  );
}
