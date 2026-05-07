import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { platformAnalytics } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/analytics")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const f = useServerFn(platformAnalytics);
  const { data } = useQuery({ queryKey: ["pa"], queryFn: () => f() });
  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  const stats = [
    { l: "Sends · 30d", v: data.sends30d },
    { l: "Opens · 30d", v: data.opens30d },
    { l: "Replies · 30d", v: data.replies30d },
    { l: "Bounces · 30d", v: data.bounces30d },
    { l: "Signups · 30d", v: data.signups30d },
    { l: "MRR", v: `$${(data.mrrCents/100).toFixed(0)}` },
    { l: "Revenue · 30d", v: `$${(data.revenueCents30d/100).toFixed(0)}` },
    { l: "Reply rate", v: `${data.sends30d ? ((data.replies30d/data.sends30d)*100).toFixed(1) : 0}%` },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.l} className="bg-card border rounded-xl p-5">
            <div className="text-sm text-muted-foreground">{s.l}</div>
            <div className="text-3xl font-bold mt-1">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
