import { LegalShell, SUPPORT_EMAIL } from "../legal/_shared";

export const metadata = { title: "Security — Inkling" };

export default function Security() {
  return (
    <LegalShell title="Security" updated="July 27, 2026">
      <p>
        Inkling is a small, focused app, and its security model is correspondingly simple. Here's
        what actually happens under the hood.
      </p>

      <h2>Infrastructure</h2>
      <p>
        Inkling runs on Vercel's serverless platform. There is no separate server for us to
        manage, patch, or misconfigure — Vercel operates the underlying infrastructure.
      </p>

      <h2>API keys</h2>
      <p>
        Our Anthropic and OpenAI API keys are stored as encrypted environment variables on
        Vercel's platform. They are only ever used server-side, inside serverless functions, and
        are never sent to or exposed in your browser.
      </p>

      <h2>Data storage</h2>
      <p>
        Inkling does not operate a database. Book titles, passages, and character details you
        submit are processed in-memory for the duration of a single request and are not written
        to persistent storage on our side. Generated portraits are streamed back to your browser
        and are not retained on our servers afterward.
      </p>

      <h2>Encryption in transit</h2>
      <p>
        All traffic between your browser and Inkling is encrypted over HTTPS/TLS, as is traffic
        between Inkling's servers and the Anthropic and OpenAI APIs.
      </p>

      <h2>Backups</h2>
      <p>
        Because Inkling does not store user data, there is no user data to back up. The
        application itself is redeployed from its source code as updates are made.
      </p>

      <h2>Reporting a vulnerability</h2>
      <p>
        If you believe you've found a security issue in Inkling, please email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with details. We'll do our best to
        respond promptly.
      </p>

      <h2>No absolute guarantee</h2>
      <p>
        No system is perfectly secure. This page describes our practices in good faith, but we
        can't guarantee against every possible risk.
      </p>
    </LegalShell>
  );
}
