import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag } from "lucide-react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { getBlogPost, BLOG_POSTS } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  head: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) return { meta: [{ title: "Post not found — EmailSend.ai" }] };
    return {
      meta: [
        { title: `${post.title} — EmailSend.ai Blog` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
      ],
    };
  },
});

function BlogPost() {
  const { slug } = Route.useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <MarketingLayout>
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-8">This article may have moved or been removed.</p>
          <Link to="/blog/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>
        </div>
      </MarketingLayout>
    );
  }

  const related = BLOG_POSTS.filter(
    (p) => p.slug !== slug && (p.category === post.category || p.featured)
  ).slice(0, 3);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <MarketingLayout>
      {/* Header */}
      <section className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 pb-10">
        <Link to="/blog/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest">{post.category}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime} min read</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(post.publishedAt)}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">{post.title}</h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{post.description}</p>
      </section>

      {/* Article body */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div
          className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-extrabold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:text-base prose-p:leading-[1.75] prose-p:text-foreground/90
            prose-li:text-base prose-li:leading-[1.7]
            prose-strong:text-foreground
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-ol:space-y-1 prose-ul:space-y-1"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </section>

      {/* CTA band */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-10">
          <h3 className="text-2xl font-extrabold tracking-tight">Start sending smarter today.</h3>
          <p className="mt-2 opacity-90 text-sm">Free account. Unlimited mailboxes. No credit card.</p>
          <Link to="/login">
            <button className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-opacity">
              Get started free <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </Link>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-5">More reading</div>
          <div className="grid md:grid-cols-3 gap-4">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-2">{p.category}</div>
                <h4 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{p.title}</h4>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />{p.readTime} min
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </MarketingLayout>
  );
}
