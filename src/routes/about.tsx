import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Wrench, Zap, CheckCircle2, Mail, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — EmailSend.ai" },
      { name: "description", content: "We're building the cold email tool we always wished we had — clean, fast, fairly priced, and honest about deliverability." },
      { property: "og:title", content: "About — EmailSend.ai" },
      { property: "og:description", content: "The story behind EmailSend.ai and the team building it." },
    ],
  }),
});

function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative max-w-4xl mx-auto px-6 pt-20 md:pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 hero-spotlight" />
        <div className="relative">
          <div className="text-eyebrow mb-5">About us</div>
          <h1 className="text-display">
            Built for teams<br />
            that <span className="text-gradient">actually send.</span>
          </h1>
          <p className="mt-7 text-xl text-muted-foreground max-w-2xl leading-relaxed">
            EmailSend started as an internal tool for our agency. We were paying over $400/mo across four different platforms and still missing replies. So we built the stack we always wanted — and turned it into a product.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-6 pb-20 space-y-6">
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Every cold email tool we tried felt designed in 2014 and bolted-onto for the next decade. Bloated UIs. Per-mailbox pricing that punished growth. Warmup that quietly made our domains worse. AI that billed per generation while writing things we'd never actually send.
          </p>
          <p className="text-foreground/90 font-medium">
            So we made three commitments and refused to break them:{" "}
            <span className="text-foreground">unlimited mailboxes on every paid plan</span>,{" "}
            <span className="text-foreground">real warmup that mimics human conversation</span>, and{" "}
            <span className="text-foreground">AI you can leave running without watching a counter.</span>
          </p>
          <p>
            What started as an agency tool is now used by over 1,000 outbound teams — from solo founders running their first sequences to agencies managing hundreds of client campaigns. Every feature we ship started because we needed it ourselves.
          </p>
          <p>
            We're a small, distributed team — operators, deliverability nerds, and product engineers — obsessed with one metric: replies per send. If that's also your obsession, you'll feel right at home.
          </p>
        </div>

        {/* Pull quote */}
        <div className="border-l-2 border-primary pl-6 py-2 my-8">
          <p className="text-xl font-semibold text-foreground leading-relaxed">
            "We don't think cold email is broken. We think the tools for it are. That's what we're fixing."
          </p>
          <div className="mt-3 text-sm text-muted-foreground">— The EmailSend team</div>
        </div>
      </section>

      {/* Principles */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-5">
        {[
          {
            icon: Wrench,
            k: "Built by operators",
            v: "Every feature ships because we needed it ourselves at our agency first. No PM-led roadmap fluff. If it doesn't make outbound better, it doesn't ship.",
          },
          {
            icon: Heart,
            k: "Fair by default",
            v: "Flat pricing. Unlimited mailboxes. No upsells disguised as add-ons. The price you see is the price you pay — no surprises on your next invoice.",
          },
          {
            icon: Zap,
            k: "Deliverability first",
            v: "If your sends don't land in the inbox, nothing else matters. Warmup, caps, rotation, and bounce handling are non-negotiable defaults — not premium add-ons.",
          },
        ].map((p) => (
          <div key={p.k} className="bg-card border border-border rounded-3xl p-7 hover:border-primary/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-5">
              <p.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-3">{p.k}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.v}</p>
          </div>
        ))}
      </section>

      {/* Numbers */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            {[
              { n: "2024", l: "Founded" },
              { n: "12M+", l: "Sends / mo" },
              { n: "1,000+", l: "Teams using" },
              { n: "1 stack", l: "No bolt-ons" },
            ].map((s) => (
              <div key={s.l} className="p-7 text-center">
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">{s.n}</div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we're working on */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-eyebrow mb-5">What we're focused on</div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-10">The roadmap, in plain English.</h2>
        <div className="space-y-3">
          {[
            { icon: Mail, label: "Smarter warmup", desc: "Improving our network to mimic engagement patterns from real, high-reputation senders.", status: "Shipping Q2" },
            { icon: BarChart3, label: "Advanced analytics", desc: "Cohort views, reply-rate benchmarks by industry, and team leaderboards for competitive sales orgs.", status: "Shipping Q3" },
            { icon: Shield, label: "Deliverability alerts", desc: "Proactive alerts when placement drops before it becomes a problem — with one-click remediation.", status: "In design" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.status}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Come build outbound that lands.</h2>
        <p className="mt-4 text-muted-foreground text-lg">Free to start. First send in five minutes. No credit card required.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login">
            <Button size="lg" className="rounded-full h-12 px-7 shadow-glow group">
              Start free <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-2">
              Say hi
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
