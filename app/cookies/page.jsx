import { LegalShell, SUPPORT_EMAIL } from "../legal/_shared";

export const metadata = { title: "Cookie Policy — Inkling" };

export default function CookiePolicy() {
  return (
    <LegalShell title="Cookie Policy" updated="July 27, 2026">
      <p>
        Inkling does not currently use cookies, web beacons, local-storage tracking, or any
        similar technology for analytics, advertising, or profiling.
      </p>

      <h2>What about infrastructure providers?</h2>
      <p>
        Inkling is hosted on Vercel. Vercel's platform may set minimal technical cookies as part
        of standard web hosting and security (for example, to route traffic or mitigate abuse).
        Inkling does not use these for tracking, and they aren't used to build a profile of you.
      </p>

      <h2>If this changes</h2>
      <p>
        If Inkling ever adds analytics, marketing cookies, or account-related session cookies,
        this page will be updated first to describe exactly what's used, why, and — where
        applicable — how to opt out.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalShell>
  );
}
