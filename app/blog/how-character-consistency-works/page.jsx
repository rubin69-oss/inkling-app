import { BlogPostShell } from "../_shared";

export const metadata = { title: "How Character Consistency Actually Works — Inkling Blog" };

export default function Post() {
  return (
    <BlogPostShell title="How Character Consistency Actually Works" date="July 27, 2026">
      <p>
        The first portrait Inkling paints for a character comes from a plain text-to-image
        request: a description of appearance, era, and mood goes in, an original image comes out.
        That's a fresh roll every time — nothing ties one generation to the next.
      </p>
      <p>
        "Same character, new scene" works differently on purpose. Instead of writing a brand new
        prompt from scratch, Inkling sends the <em>existing portrait itself</em> back to the image
        model as a reference, along with instructions to keep the exact same face and identity and
        change only the scene, pose, or outfit described. That's an image edit, not a new
        generation — the model is conditioned on the pixels of the original, not just a text
        description of the character.
      </p>
      <p>
        That's also why it isn't unlimited: each scene is a real edit call to the image model, so
        Inkling caps it at four scenes per character to keep things reasonable. And because each
        new scene is generated from the current portrait, switching a character's art style first
        and then generating a scene will carry that style into the new image too — the reference
        image is whatever is currently on the card at the time.
      </p>
    </BlogPostShell>
  );
}
