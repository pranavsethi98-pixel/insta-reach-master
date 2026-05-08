import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — EmailSend" },
      { name: "description", content: "Simple, transparent pricing. Start free, upgrade as you scale. No per-mailbox fees." },
      { property: "og:title", content: "Pricing — EmailSend" },
      { property: "og:description", content: "Free to start. Unlimited mailboxes on every paid plan." },
    ],
  }),
});

const plans = [
  {
    name: "Starter",
    price: "$0",
    sub: "Forever free",
    desc: "For solo founders just getting started.",
    features: ["1 mailbox", "1,000 emails / month", "Basic warmup", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$49",
    sub: "/ month",
    desc: "For founders and small sales teams.",
    features: ["Unlimited mailboxes", "30,000 emails / month", "Full warmup network", "AI Copilot", "Email support"],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Scale",
    price: "$149",
    sub: "/ month",
    desc: "For agencies and high-volume teams.",
    features: ["Unlimited mailboxes", "150,000 emails / month", "AI Reply Agent", "Webhooks & API", "Priority support", "Team seats"],
    cta: "Start 14-day trial",
    highlight: false,
  },
];

function PricingPage() {
  const navigate = useNavigate();
  return (
    <MarketingLayout>
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Simple <span className="text-primary">pricing.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">No per-mailbox fees. No hidden add-ons. Cancel anytime.</p>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl p-8 border transition-all ${
              p.highlight
                ? "bg-primary text-primary-foreground border-transparent shadow-2xl scale-[1.02]"
                : "bg-card border-border"
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-warning text-warning-foreground text-xs font-semibold">
                Most popular
              </div>
            )}
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight">{p.price}</span>
              <span className={p.highlight ? "opacity-80" : "text-muted-foreground"}>{p.sub}</span>
            </div>
            <p className={`mt-2 text-sm ${p.highlight ? "opacity-90" : "text-muted-foreground"}`}>{p.desc}</p>
            <Button
              className={`mt-6 w-full rounded-full ${p.highlight ? "bg-white text-primary hover:bg-white/90" : ""}`}
              variant={p.highlight ? "default" : "outline"}
              onClick={() => navigate({ to: "/login" })}
            >
              {p.cta}
            </Button>
            <ul className="mt-6 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "" : "text-primary"}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center text-sm text-muted-foreground">
        Need higher volumes or custom contracts? <a href="/contact" className="text-primary font-medium">Talk to us</a>.
      </section>
    </MarketingLayout>
  );
}
