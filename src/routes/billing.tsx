import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { createCheckoutSession } from "@/lib/checkout.functions";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string);

const PLANS = [
  { id: "starter_monthly", name: "Starter", price: 37, credits: "2,000", features: ["1,000 active leads", "Unlimited email accounts", "Email warm-up", "Basic campaigns"] },
  { id: "growth_monthly", name: "Growth", price: 97, credits: "10,000", features: ["25,000 active leads", "Email A/B testing", "AI Reply Agent (HITL)", "Advanced analytics"], featured: true },
  { id: "hypergrowth_monthly", name: "Hypergrowth", price: 358, credits: "60,000", features: ["100,000 active leads", "Subsequences", "AI Autopilot mode", "Salesflows", "Premium support"] },
];
const TOPUPS = [
  { id: "credits_1k", label: "1,000 Credits", price: 15 },
  { id: "credits_10k", label: "10,000 Credits", price: 120 },
];

export const Route = createFileRoute("/billing")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: (s.session_id as string) ?? undefined,
    success: (s.success as string) ?? undefined,
  }),
  component: () => <RequireAuth><AppShell><Page /></AppShell></RequireAuth>,
});

function Page() {
  const search = useSearch({ from: "/billing" });
  const navigate = useNavigate();
  const create = useServerFn(createCheckoutSession);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (search.session_id || search.success) {
      // Refresh after redirect from checkout
      const t = setTimeout(() => navigate({ to: "/billing", search: {} }), 3000);
      return () => clearTimeout(t);
    }
  }, [search.session_id, search.success, navigate]);

  const startCheckout = async (priceId: string) => {
    setLoadingId(priceId);
    try {
      const res: any = await create({ data: { priceId, returnUrl: `${window.location.origin}/billing` } });
      setClientSecret(res.clientSecret);
    } catch (e: any) {
      alert(e.message ?? "Checkout failed");
    } finally { setLoadingId(null); }
  };

  if (clientSecret) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setClientSecret(null)} className="mb-4">← Back</Button>
        <div className="bg-card border rounded-xl overflow-hidden">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Plans & Billing</h1>
        <p className="text-muted-foreground mt-1">Test mode — use card 4242 4242 4242 4242 with any future expiry and CVC.</p>
      </div>

      {(search.session_id || search.success) && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg p-4">
          ✓ Payment received. Your account is being updated…
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((p) => (
          <div key={p.id} className={`bg-card border rounded-xl p-6 ${p.featured ? "border-primary ring-2 ring-primary/30" : ""}`}>
            {p.featured && <div className="text-xs font-semibold text-primary uppercase mb-2">Most popular</div>}
            <div className="font-bold text-xl">{p.name}</div>
            <div className="mt-2"><span className="text-4xl font-bold">${p.price}</span><span className="text-muted-foreground">/mo</span></div>
            <div className="text-sm text-muted-foreground mt-1">{p.credits} credits/month</div>
            <ul className="space-y-2 mt-4 text-sm">
              {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{f}</li>)}
            </ul>
            <Button className="w-full mt-5" variant={p.featured ? "default" : "outline"} disabled={loadingId === p.id} onClick={() => startCheckout(p.id)}>
              {loadingId === p.id ? "Loading…" : "Subscribe"}
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-bold text-lg mb-4">Top up credits</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {TOPUPS.map((t) => (
            <div key={t.id} className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <div className="font-semibold">{t.label}</div>
                <div className="text-sm text-muted-foreground">${t.price} one-time</div>
              </div>
              <Button variant="outline" disabled={loadingId === t.id} onClick={() => startCheckout(t.id)}>
                {loadingId === t.id ? "Loading…" : "Buy"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
