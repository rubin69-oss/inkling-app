import Link from "next/link";
import { PageShell } from "../_shared/PageShell";
import { POSTS } from "./_posts";

export const metadata = { title: "Blog — Inkling" };

export default function BlogIndex() {
  return (
    <PageShell title="Blog" subtitle="Notes from the Inkling team on how the app works and why it's built the way it is." wide>
      <div className="blog-list">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-item">
            <div className="blog-item-date">{p.date}</div>
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
