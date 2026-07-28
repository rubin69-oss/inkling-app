import { LegalShell, SUPPORT_EMAIL } from "../legal/_shared";

export const metadata = { title: "Privacy Policy — Inkling" };

export default function PrivacyPolicy() {
  return (
    <LegalShell title="Privacy Policy" updated="July 27, 2026">
      <p>
        Inkling ("we," "us") built this policy to describe, plainly, what happens to the
        information you type into this app. There's less to explain than you might expect.
      </p>

      <h2>What we collect</h2>
      <p>
        Inkling does not require an account to use its core features. We do not collect your
        name, email address, or other personal information in order for you to search for a
        book, paste a passage, or generate a portrait.
      </p>
      <p>
        The information you actively type in — a book title, an optional character name, or a
        pasted passage — is used only to generate the response you asked for.
      </p>

      <h2>How your input is used</h2>
      <p>
        When you use Inkling, the text you submit is sent to Anthropic's Claude API to identify
        characters and extract descriptive detail, and to OpenAI's image API to generate the
        portrait. These calls happen live, each time you use the app. We do not maintain a
        database, and we do not store your inputs or the images generated for you after they are
        returned to your browser.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        Inkling does not currently use cookies, analytics, or advertising trackers of any kind.
        See our <a href="/cookies">Cookie Policy</a> for more detail.
      </p>

      <h2>Third-party processors</h2>
      <p>
        Your inputs are processed by Anthropic and OpenAI under their own privacy policies, which
        we encourage you to review directly:
      </p>
      <ul>
        <li><a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer">Anthropic's Privacy Policy</a></li>
        <li><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">OpenAI's Privacy Policy</a></li>
      </ul>
      <p>Inkling is also hosted on Vercel; see Vercel's own privacy documentation for details on their infrastructure.</p>

      <h2>Children's privacy</h2>
      <p>
        Inkling is not directed at children under 13, and we do not knowingly collect information
        from them.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        As Inkling evolves — for example, if we introduce accounts or paid plans — this policy
        will be updated to reflect what data we handle at that time, and the date above will
        change accordingly.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalShell>
  );
}
