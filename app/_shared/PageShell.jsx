import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageShell({ title, subtitle, wide, children }) {
  return (
    <div className={"content-page" + (wide ? " wide" : "")}>
      <Link href="/" className="legal-back">
        <ArrowLeft size={14} /> Back to Inkling
      </Link>
      <h1>{title}</h1>
      {subtitle && <p className="content-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}
