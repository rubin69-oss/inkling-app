import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BlogPostShell({ title, date, children }) {
  return (
    <div className="content-page">
      <Link href="/blog" className="legal-back">
        <ArrowLeft size={14} /> Back to Blog
      </Link>
      <h1>{title}</h1>
      <p className="content-subtitle blog-byline">The Inkling Team · {date}</p>
      <div className="blog-post-body">{children}</div>
    </div>
  );
}
