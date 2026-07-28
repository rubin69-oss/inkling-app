import { Mail } from "lucide-react";
import { LegalShell, SUPPORT_EMAIL } from "../legal/_shared";

export const metadata = { title: "Contact Us — Inkling" };

export default function Contact() {
  return (
    <LegalShell title="Contact Us" updated="July 27, 2026">
      <p>
        Inkling is an independent, actively-developed project. If something's broken, confusing,
        or you just want to say hello, email is the best way to reach us.
      </p>

      <a href={`mailto:${SUPPORT_EMAIL}`} className="contact-email-card">
        <Mail size={18} />
        <span>{SUPPORT_EMAIL}</span>
      </a>

      <p>We aim to respond to real questions and bug reports as quickly as we can.</p>
    </LegalShell>
  );
}
