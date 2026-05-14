import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Wrench, Zap } from "lucide-react";
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
      <section className="relative max-w-4xl mx-auto px-6 pt-20 md:pt-28 pb-16">
        <div className="text-eyebrow mb-5">About</div>
        <h1 className="text-display">
          Built for teams<br />
          that <span className="text-gradient">actually send.</span>
        </h1>
        <p className="mt-7 text-xl text-muted-foreground max-w-2xl leading-relaxed">
          EmailSend started as an internal tool for our agency. We were paying $400/mo across four platforms and still missing replies. So we built the stack we always wanted — and turned it loose.
        </p>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-6 pb-20 space-y-8 text-lg leading-relaxed text-muted-foreground">
        <p>
          Every cold email tool we tried felt designed in 2014 and bolted onto for the next decade. Bloated UIs. Per-mailbox pricing that punished growth. Warmup that quietly made our domains worse. AI that billed per generation while writing things we'd never send.
        </p>
        <p className="text-foreground/90">
          So we made three commitments and refused to break them: <span className="text-foreground">unlimited mailboxes on every paid plan</span>, real warmup that mimics human conversation, and AI you can actually leave on without watching a counter.
        </p>
        <p>
          We're a small distributed team — operators, deliverability nerds, and product engineers — obsessed with one number: replies per send. If that's also your obsession, you'll feel right at home here.
        </p>
      </section>

      {/* Principles */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-5">
        {[
          { icon: Wrench, k: "Built by operators", v: "Every feature ships because we needed it ourselves at our agency. No PM-led roadmap fluff." },
          { icon: Heart, k: "Fair by default", v: "Flat pricing. Unlimited mailboxes. No upsells disguised as add-ons. The price you see is what you pay." },
          { icon: Zap, k: "Deliverability first", v: "If your sends don't land, nothing else matters. Warmup, caps, and rotation are non-negotiable defaults." },
        ].map((p) => (
          <div key={p.k} className="surface-1 rounded-3xl p-7 hover:border-primary/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-5">
              <p.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">{p.k}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.v}</p>
          </div>
        ))}
      </section>

      {/* Numbers */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl surface-1 p-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 rounded-[22px] overflow-hidden">
            {[
              { n: "2024", l: "Founded" },
              { n: "12M+", l: "Sends / mo" },
              { n: "4 yrs", l: "Building outbound" },
              { n: "1 stack", l: "No bolt-ons" },
            ].map((s) => (
              <div key={s.l} className="bg-card/90 p-7 text-center">
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">{s.n}</div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Come build outbound that lands.</h2>
        <p className="mt-4 text-muted-foreground">Free to start. First send in five minutes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login"><Button size="lg" className="rounded-full h-12 px-7 shadow-glow group">Start free <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} /></Button></Link>
          <Link to="/contact"><Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-2">Say hi</Button></Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
