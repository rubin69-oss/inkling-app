import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const SUPPORT_EMAIL = "inklingapp.contact@gmail.com";

export function LegalShell({ title, updated, children }) {
  return (
    <div className="legal-page">
      <Link href="/" className="legal-back">
        <ArrowLeft size={14} /> Back to Inkling
      </Link>
      <h1>{title}</h1>
      <p className="legal-updated">Last updated {updated}</p>
      {children}
      <LegalFooterNav />
    </div>
  );
}

export function LegalFooterNav() {
  return (
    <nav className="legal-footer-nav">
      <Link href="/privacy">Privacy Policy</Link>
      <Link href="/terms">Terms of Service</Link>
      <Link href="/cookies">Cookie Policy</Link>
      <Link href="/security">Security</Link>
      <Link href="/ai-policy">AI Policy</Link>
      <Link href="/contact">Contact Us</Link>
    </nav>
  );
}
