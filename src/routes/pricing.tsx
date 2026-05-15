import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Check, ArrowRight, Sparkles, Zap, Crown, X, Star, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — EmailSend.ai" },
      { name: "description", content: "Simple, transparent pricing. Unlimited mailboxes on every paid plan. Start free, upgrade as you scale." },
      { property: "og:title", content: "Pricing — EmailSend.ai" },
      { property: "og:description", content: "Flat pricing. Unlimited mailboxes. No add-on tax." },
    ],
  }),
});

const plans = [
  {
    name: "Starter",
    icon: Sparkles,
    monthly: 0,
    yearly: 0,
    sub: "Free forever",
    desc: "For solo founders running their first cold outbound sequences.",
    features: [
      "1 connected mailbox",
      "1,000 emails / month",
      "Basic warmup",
      "AI Copilot (50 generations / mo)",
      "Community support",
    ],
    notIncluded: ["Reply Agent", "Webhooks & API"],
    cta: "Start for free",
    highlight: false,
  },
  {
    name: "Growth",
    icon: Zap,
    monthly: 49,
    yearly: 39,
    sub: "/ month",
    desc: "For founders and small sales teams who want to scale outbound.",
    features: [
      "Unlimited mailboxes",
      "30,000 emails / month",
      "Full warmup network",
      "AI Copilot (unlimited)",
      "AI Reply Agent",
      "Unified inbox",
      "Priority email support",
    ],
    notIncluded: [],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Scale",
    icon: Crown,
    monthly: 149,
    yearly: 119,
    sub: "/ month",
    desc: "For agencies and high-volume outbound teams that ship at scale.",
    features: [
      "Everything in Growth",
      "150,000 emails / month",
      "5 team seats included",
      "Webhooks & REST API",
      "Visitor identification",
      "Sub-account management",
      "Dedicated success manager",
    ],
    notIncluded: [],
    cta: "Start 14-day trial",
    highlight: false,
  },
];

function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(true);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-20 md:pt-28 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-mono uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-primary/80">Flat pricing · No per-seat tax</span>
        </div>
        <h1 className="text-display">
          Pricing built<br />for <span className="text-gradient">operators.</span>
        </h1>
        <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlimited mailboxes on every paid plan. No hidden warmup fees. No per-generation AI counters watching you write.
        </p>

        {/* Billing toggle */}
        <div className="mt-10 inline-flex items-center gap-1 p-1.5 rounded-full bg-card border border-border">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!yearly ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${yearly ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
          >
            Yearly
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${yearly ? "bg-white/20 text-white" : "bg-success/15 text-success"}`}>
              −20%
            </span>
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5 items-start">
        {plans.map((p) => {
          const price = yearly ? p.yearly : p.monthly;
          return (
            <div
              key={p.name}
              className={`relative rounded-3xl p-8 flex flex-col transition-all ${
                p.highlight
                  ? "bg-card border-2 border-primary ring-glow md:-translate-y-2"
                  : "bg-card border border-border hover:border-primary/30"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-glow whitespace-nowrap">
                  Most popular
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <p.icon className="w-4.5 h-4.5" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-lg">{p.name}</h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-6xl font-extrabold tracking-tight text-foreground">${price}</span>
                <span className="text-muted-foreground text-sm">{price === 0 ? p.sub : p.sub}</span>
              </div>
              {yearly && p.monthly > 0 && (
                <div className="text-xs text-muted-foreground line-through font-mono mb-1">${p.monthly}/mo billed monthly</div>
              )}

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>

              <Button
                className={`mt-6 w-full rounded-full h-11 font-semibold ${p.highlight ? "shadow-glow" : ""}`}
                variant={p.highlight ? "default" : "outline"}
                onClick={() => navigate({ to: "/login" })}
              >
                {p.cta} <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />
              </Button>

              <div className="my-6 h-px bg-border" />

              <ul className="space-y-3 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
                    </div>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
                {p.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-muted-foreground/50">
                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="line-through">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* What's included strip */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 grid md:grid-cols-3 gap-8 text-center md:text-left">
          {[
            { k: "Unlimited mailboxes", v: "Connect as many Google, Microsoft, or SMTP accounts as you need. No per-mailbox tax. Ever." },
            { k: "Free warmup, always", v: "Conversation-style warmup network included on every paid plan. Not a credit pack." },
            { k: "AI without metering", v: "Copilot and Reply Agent on Growth+. No 'per-generation' counters watching you write." },
          ].map((x) => (
            <div key={x.k}>
              <div className="text-eyebrow mb-2">Included</div>
              <h4 className="text-lg font-bold mb-2">{x.k}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{x.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { q: "Switched from Smartlead — setup was 10 minutes and we're sending 3x more volume.", n: "Alex P.", r: "Agency founder" },
            { q: "The warmup actually works. Domain reputation went from 62 to 94 in 3 weeks.", n: "Jamie K.", r: "Head of Outbound" },
            { q: "Copilot pays for the whole plan. We save 5+ hours a week on writing sequences.", n: "Morgan T.", r: "Sales Director" },
          ].map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">"{t.q}"</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {t.n[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold">{t.n}</div>
                  <div className="text-[11px] text-muted-foreground">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise band */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="absolute -top-16 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-80 mb-2">Enterprise</div>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Need 1M+ sends a month?</h3>
              <p className="mt-2 opacity-90 max-w-lg leading-relaxed">Custom volume pricing, SSO, dedicated IPs, SLA, and a private deliverability engineer assigned to your account.</p>
            </div>
            <Link to="/contact">
              <Button size="lg" className="rounded-full h-12 px-7 bg-white text-primary hover:bg-white/90 font-bold shrink-0">
                Talk to sales <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <PricingFAQ />
    </MarketingLayout>
  );
}

function PricingFAQ() {
  const items = [
    { q: "What counts as 'unlimited mailboxes'?", a: "Exactly that. Connect 5 or 500. We don't charge per inbox — never have, never will. Sending volume is the only thing that scales with your plan." },
    { q: "Are AI generations really unlimited on Growth?", a: "Yes, within fair-use. Run Copilot and Reply Agent without a credit counter ticking down. We've never throttled an honest user." },
    { q: "Can I cancel any time?", a: "Yes, one click in settings. We don't do annual lock-ins on monthly plans. Yearly is a discount, not a commitment trap." },
    { q: "Do you have a free trial on paid plans?", a: "14 days, no credit card required. Bring your mailboxes, run real campaigns, decide on day 14." },
    { q: "What about volumes above Scale?", a: "Talk to us. We have customers sending 5M+/mo on custom plans with dedicated IPs and SLA commitments." },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-3xl mx-auto px-6 pb-24">
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-10">Pricing, but make it honest.</h2>
      <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden">
        {items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left flex items-center justify-between gap-4 p-5 hover:bg-muted/30 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm md:text-base">{f.q}</span>
                {isOpen
                  ? <Minus className="w-4 h-4 text-primary shrink-0" />
                  : <Plus className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-10 text-center text-sm text-muted-foreground">
        Still unsure?{" "}
        <Link to="/contact" className="text-primary font-medium hover:underline">
          Talk to a real human
        </Link>.
      </div>
    </section>
  );
}
