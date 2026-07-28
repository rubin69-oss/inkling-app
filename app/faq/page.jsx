import Link from "next/link";
import { PageShell } from "../_shared/PageShell";

export const metadata = { title: "FAQ — Inkling" };

const FAQS = [
  {
    q: "Do I need an account to use Inkling?",
    a: "Yes — revealing a book's characters spends one of your reveal credits, so you'll need a free account to keep track of those. Signing up gives you 3 reveal credits to start, no charge.",
  },
  {
    q: "What books can I search by title?",
    a: "Anything the underlying language model recognizes as a real, well-known work — mostly public-domain classics. If a title doesn't come back with results, try pasting a passage instead.",
  },
  {
    q: "Are the portraits real photos of anyone?",
    a: "No. Every portrait is an original AI illustration generated from the text description, never a photo of a real person, and never traced from an illustrator's artwork or a film adaptation.",
  },
  {
    q: "Can the same character appear in a different scene or outfit?",
    a: "Yes — that's the \"Same character, new scene\" feature on each character card. It conditions the new image on the original portrait so it stays recognizably the same character.",
  },
  {
    q: "What art styles are available?",
    a: "Painterly, Oil Painting, Realism, Watercolor, Renaissance, Anime, Ink Sketch, Art Nouveau, Impressionist, and Gothic. Pick one before searching, or change it per character afterward.",
  },
  {
    q: "Can I download what I make?",
    a: "Yes — every generated portrait can be exported as a Poster, a phone or desktop Wallpaper, a 300 DPI Print, a BookTok Art Card, an Aesthetic Board, or a Manuscript Pitch Deck.",
  },
  {
    q: "Does the AI train on what I type in?",
    a: (
      <>
        See our <Link href="/ai-policy">AI Policy</Link> for the full answer — short version: Inkling
        uses Anthropic's and OpenAI's developer APIs, which don't train on API data by default.
      </>
    ),
  },
  {
    q: "Who owns the portraits I generate?",
    a: (
      <>
        Also covered in the <Link href="/ai-policy">AI Policy</Link> — you're free to use portraits
        generated in your own session for personal purposes.
      </>
    ),
  },
  {
    q: "Something's not working — who do I tell?",
    a: (
      <>
        Reach out through <Link href="/contact">Contact Us</Link>. We read every message.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <PageShell title="Frequently Asked Questions">
      <div className="faq-list">
        {FAQS.map((f) => (
          <div key={f.q} className="faq-item">
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
