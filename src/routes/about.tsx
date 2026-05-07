import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Outreachly" },
      { name: "description", content: "We're building the cold email tool we always wished we had — clean, fast, and built for teams that ship." },
      { property: "og:title", content: "About — Outreachly" },
      { property: "og:description", content: "The story behind Outreachly and the team building it." },
    ],
  }),
});

function AboutPage() {
  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8">
          Built for teams that <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">actually send.</span>
        </h1>
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-5">
          <p>
            We started Outreachly because every existing cold email tool felt like it was designed in 2014 and then bolted onto for the next decade. Bloated UIs. Per-mailbox pricing that punished growth. Warmup that quietly made your domain worse.
          </p>
          <p>
            So we built the tool we always wanted: clean, fast, and honest. Unlimited mailboxes on every paid plan. Real warmup that actually mimics human conversation. AI that helps you write — not generic spam.
          </p>
          <p>
            We're a small, distributed team obsessed with deliverability, fair pricing, and craft. If that resonates, you'll feel right at home here.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
