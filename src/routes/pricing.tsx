import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Check, ArrowRight, Sparkles, Zap, Crown, X } from "lucide-react";
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
    sub: "Forever free",
    desc: "For solo founders shipping their first sequences.",
    features: ["1 mailbox", "1,000 emails / month", "Basic warmup", "AI Copilot (50 generations / mo)", "Community support"],
    notIncluded: ["Reply Agent", "API & webhooks"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    icon: Zap,
    monthly: 49,
    yearly: 39,
    sub: "/ month",
    desc: "For founders and small sales teams. The sweet spot.",
    features: ["Unlimited mailboxes", "30,000 emails / month", "Full warmup network", "AI Copilot (unlimited)", "Reply Agent", "Unified inbox", "Priority email support"],
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
    desc: "For agencies and high-volume outbound teams.",
    features: ["Everything in Growth", "150,000 emails / month", "5 team seats", "Webhooks & REST API", "Visitor identification", "Sub-account management", "Dedicated success mgr"],
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface-1 text-[11px] font-mono uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-muted-foreground">Flat pricing · No per-seat tax</span>
        </div>
        <h1 className="text-display">
          Pricing built<br />for <span className="text-gradient">operators.</span>
        </h1>
        <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlimited mailboxes on every paid plan. No hidden warmup fees. No per-generation AI nickel-and-diming.
        </p>

        {/* Billing toggle */}
        <div className="mt-10 inline-flex items-center gap-2 p-1.5 rounded-full surface-1">
          <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-full text-sm font-semibold transition ${!yearly ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}>Monthly</button>
          <button onClick={() => setYearly(true)} className={`px-5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${yearly ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}>
            Yearly <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${yearly ? "bg-white/20" : "bg-success/15 text-success"}`}>−20%</span>
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5 items-stretch">
        {plans.map((p) => {
          const price = yearly ? p.yearly : p.monthly;
          return (
            <div
              key={p.name}
              className={`relative rounded-3xl p-8 flex flex-col transition-all ${
                p.highlight
                  ? "surface-2 ring-glow scale-[1.015] md:-translate-y-2"
                  : "surface-1 hover:border-primary/30"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-glow">
                  Most popular
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <p.icon className="w-4.5 h-4.5" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-lg">{p.name}</h3>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-6xl font-extrabold tracking-tight">${price}</span>
                <span className="text-muted-foreground text-sm">{price === 0 ? p.sub : p.sub}</span>
              </div>
              {yearly && p.monthly > 0 && (
                <div className="mt-1 text-xs text-muted-foreground line-through font-mono">${p.monthly}/mo</div>
              )}
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>

              <Button
                className={`mt-6 w-full rounded-full h-11 ${p.highlight ? "shadow-glow" : ""}`}
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
                    <span>{f}</span>
                  </li>
                ))}
                {p.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-muted-foreground/60">
                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="line-through">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Compare strip */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl surface-1 p-8 md:p-12 grid md:grid-cols-3 gap-8 text-center md:text-left">
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

      {/* Enterprise band */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 25% 30%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-80 mb-2">Enterprise</div>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Need 1M+ sends a month?</h3>
              <p className="mt-2 opacity-90 max-w-lg">Custom volume pricing, SSO, dedicated IPs, SLA, and a private deliverability engineer assigned to your account.</p>
            </div>
            <Link to="/contact"><Button size="lg" className="rounded-full h-12 px-7 bg-white text-primary hover:bg-white/90">Talk to sales <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} /></Button></Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-10">Pricing, but make it honest.</h2>
        <div className="space-y-3">
          {[
            { q: "What counts as 'unlimited mailboxes'?", a: "Exactly that. Connect 5 or 500. We don't charge per inbox — never have, never will. Sending volume is the only thing that scales with plan." },
            { q: "Are AI generations really unlimited on Growth?", a: "Yes, within fair-use. Run Copilot and Reply Agent without a credit counter ticking down. We've never throttled an honest user." },
            { q: "Can I cancel any time?", a: "Yes, one click in settings. We don't do annual lock-ins on monthly plans. Yearly is a discount, not a commitment trap." },
            { q: "Do you have a free trial on paid plans?", a: "14 days, no credit card required. Bring your mailboxes, run real campaigns, decide on day 14." },
            { q: "What about volumes above Scale?", a: "Talk to us. We have customers sending 5M+/mo on custom plans with dedicated IPs and SLA." },
          ].map((f, i) => (
            <details key={i} className="group surface-1 rounded-2xl px-5 py-4 cursor-pointer">
              <summary className="flex items-center justify-between font-semibold list-none">
                {f.q}
                <ArrowRight className="w-4 h-4 text-primary transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 text-center text-sm text-muted-foreground">
          Still unsure? <Link to="/contact" className="text-primary font-medium hover:underline">Talk to a human</Link>.
        </div>
      </section>
    </MarketingLayout>
  );
}
