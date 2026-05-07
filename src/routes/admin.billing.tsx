import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listPlans, upsertPlan, listCoupons, upsertCoupon } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/admin/billing")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const fp = useServerFn(listPlans); const up = useServerFn(upsertPlan);
  const fc = useServerFn(listCoupons); const uc = useServerFn(upsertCoupon);
  const { data: plans, refetch: rp } = useQuery({ queryKey: ["plans"], queryFn: () => fp() });
  const { data: coupons, refetch: rc } = useQuery({ queryKey: ["coupons"], queryFn: () => fc() });
  const m = useMutation({ mutationFn: async (fn: () => Promise<any>) => fn(), onSuccess: () => { rp(); rc(); } });

  const [code, setCode] = useState("PROMO10");
  const [pct, setPct] = useState("10");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Billing & Plans</h1>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(plans ?? []).map((p: any) => (
            <div key={p.id} className="border rounded-lg p-4">
              <div className="font-bold">{p.name}</div>
              <div className="text-2xl font-bold mt-1">${(p.price_cents/100).toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/{p.interval}</span></div>
              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <div>{p.monthly_credits} credits/mo</div>
                <div>{p.max_mailboxes ?? "∞"} mailboxes</div>
                <div>{p.max_active_campaigns ?? "∞"} campaigns</div>
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => {
                const credits = prompt("Monthly credits", String(p.monthly_credits));
                if (credits) m.mutate(() => up({ data: { ...p, monthly_credits: parseInt(credits) } }));
              }}>Edit</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Coupons</h2>
        <div className="flex gap-2 mb-3">
          <Input placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <Input type="number" placeholder="% off" value={pct} onChange={(e) => setPct(e.target.value)} />
          <Button onClick={() => m.mutate(() => uc({ data: { code, discount_pct: parseInt(pct), is_active: true } }))}>Create</Button>
        </div>
        <div className="space-y-1">
          {(coupons ?? []).map((c: any) => (
            <div key={c.id} className="flex justify-between items-center py-2 border-b text-sm">
              <div className="font-mono">{c.code}</div>
              <div>{c.discount_pct ? `${c.discount_pct}%` : `$${(c.discount_cents/100).toFixed(2)}`} off · {c.redemptions}/{c.max_redemptions ?? "∞"}</div>
              <Button size="sm" variant="ghost" onClick={() => m.mutate(() => uc({ data: { ...c, is_active: !c.is_active } }))}>{c.is_active ? "Disable" : "Enable"}</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
