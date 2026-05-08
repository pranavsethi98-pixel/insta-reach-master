import { useNavigate } from "@tanstack/react-router";
import { Check, X, ArrowRight, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";

export type Comparison = {
  competitor: string;
  competitorTagline: string;
  hero: { headline: string; sub: string };
  verdict: { winner: "us" | "them" | "tie"; oneLiner: string };
  rows: { feature: string; us: string | true | false; them: string | true | false; note?: string }[];
  whenToChoose: { us: string[]; them: string[] };
  pricing: { us: string; them: string };
  switchPitch: string;
};

function Cell({ v }: { v: string | true | false }) {
  if (v === true) return <Check className="w-5 h-5 text-success" />;
  if (v === false) return <X className="w-5 h-5 text-destructive/70" />;
  if (v === "—") return <Minus className="w-5 h-5 text-muted-foreground" />;
  return <span className="text-sm">{v}</span>;
}

export function ComparisonPage({ c }: { c: Comparison }) {
  const navigate = useNavigate();
  return (
    <MarketingLayout>
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-12 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-border bg-card text-xs font-mono uppercase tracking-wider mb-6">
          <span className="text-primary">EmailSend</span>
          <span className="text-muted-foreground">vs</span>
          <span>{c.competitor}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.95]">
          {c.hero.headline}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{c.hero.sub}</p>

        <div className="mt-10 inline-block bg-card border border-primary/30 rounded-2xl p-6 max-w-xl text-left">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">The honest verdict</div>
          <p className="text-base leading-relaxed">{c.verdict.oneLiner}</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Button size="lg" className="rounded-full h-12 px-6" onClick={() => navigate({ to: "/login" })}>
            Try EmailSend free <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-full h-12 px-6" onClick={() => navigate({ to: "/pricing" })}>
            See pricing
          </Button>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Side by side</div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">No marketing spin. Just the deltas.</h2>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-muted/40 border-b border-border">
            <div className="p-4 font-semibold text-sm">Feature</div>
            <div className="p-4 font-semibold text-sm text-center text-primary">EmailSend</div>
            <div className="p-4 font-semibold text-sm text-center text-muted-foreground">{c.competitor}</div>
          </div>
          {c.rows.map((r, i) => (
            <div key={r.feature} className={`grid grid-cols-[1.5fr_1fr_1fr] border-b border-border/40 ${i % 2 ? "bg-background/40" : ""}`}>
              <div className="p-4">
                <div className="font-medium text-sm">{r.feature}</div>
                {r.note && <div className="text-xs text-muted-foreground mt-1">{r.note}</div>}
              </div>
              <div className="p-4 flex items-center justify-center"><Cell v={r.us} /></div>
              <div className="p-4 flex items-center justify-center text-muted-foreground"><Cell v={r.them} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* WHEN TO CHOOSE */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-5">
        <div className="bg-card border border-primary/40 rounded-2xl p-7">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Choose EmailSend if</div>
          <ul className="space-y-3">
            {c.whenToChoose.us.map((x) => (
              <li key={x} className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card border border-border rounded-2xl p-7">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Stick with {c.competitor} if</div>
          <ul className="space-y-3">
            {c.whenToChoose.them.map((x) => (
              <li key={x} className="flex items-start gap-3 text-sm">
                <Minus className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRICING DELTA */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Pricing reality</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">What you actually pay.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-card border border-primary/40 rounded-2xl p-7">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">EmailSend</div>
            <p className="text-base leading-relaxed">{c.pricing.us}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-7">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">{c.competitor}</div>
            <p className="text-base leading-relaxed text-muted-foreground">{c.pricing.them}</p>
          </div>
        </div>
      </section>

      {/* SWITCH PITCH / CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-primary/15 to-card border border-primary/30 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Thinking about switching?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{c.switchPitch}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" className="rounded-full h-12 px-6" onClick={() => navigate({ to: "/login" })}>
              Start free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 px-6" onClick={() => navigate({ to: "/contact" })}>
              Talk to us
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
