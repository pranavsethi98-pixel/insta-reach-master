import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { BLOG_POSTS, CATEGORIES } from "@/lib/blog-posts";
import { useState } from "react";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Cold Email Blog — EmailSend.ai" },
      { name: "description", content: "Practical guides on cold email deliverability, copywriting, sequences, and lead generation. Written by people who actually send." },
      { property: "og:title", content: "Cold Email Blog — EmailSend.ai" },
      { property: "og:description", content: "Practical cold email guides, not recycled advice." },
    ],
  }),
});

function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const featured = BLOG_POSTS.filter((p) => p.featured);
  const rest = BLOG_POSTS.filter((p) => !p.featured);
  const filtered = activeCategory
    ? BLOG_POSTS.filter((p) => p.category === activeCategory)
    : null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-mono uppercase tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-muted-foreground">Written by senders, for senders</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
          Cold email,<br />
          <span className="text-primary">no fluff.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Practical guides on deliverability, copywriting, sequences, and outbound strategy. From the team that sends 12M+ emails a month.
        </p>
      </section>

      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              !activeCategory
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured posts (shown when no filter) */}
      {!filtered && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-5">Featured</div>
          <div className="grid md:grid-cols-3 gap-5">
            {featured.map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-primary">{post.category}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min</span>
                </div>
                <h2 className="text-lg font-bold leading-snug flex-1 group-hover:text-primary transition-colors">{post.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.description}</p>
                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="text-primary flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight className="w-3 h-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All posts / filtered */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        {!filtered && (
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-5">All posts</div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {(filtered ?? rest).map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group bg-card border border-border rounded-2xl p-5 flex gap-5 hover:border-primary/50 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary">{post.category}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{post.readTime} min</span>
                </div>
                <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-1 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="surface-1 rounded-3xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Put the reading to work.</h3>
          <p className="mt-3 text-muted-foreground">Start sending with EmailSend.ai. Free account, no credit card.</p>
          <div className="mt-6">
            <Link to="/login">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity">
                Start free <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
