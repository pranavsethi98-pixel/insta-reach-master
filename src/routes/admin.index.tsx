import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { getPlatformOverview, platformAnalytics } from "@/lib/admin.functions";
import { Users, Mail, Send, AlertTriangle, CheckCircle2, DollarSign, LifeBuoy, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const fetchOv = useServerFn(getPlatformOverview);
  const fetchAn = useServerFn(platformAnalytics);
  const { data: ov } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fetchOv() });
  const { data: an } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => fetchAn() });

  const stats = [
    { label: "Users", value: ov?.users ?? 0, icon: Users },
    { label: "Active subs", value: ov?.activeSubs ?? 0, icon: CheckCircle2 },
    { label: "Mailboxes", value: ov?.mailboxes ?? 0, icon: Mail, sub: `${ov?.lowHealthMailboxes ?? 0} low health` },
    { label: "Active campaigns", value: ov?.activeCampaigns ?? 0, icon: Send, sub: `${ov?.campaigns ?? 0} total` },
    { label: "Sent (all-time)", value: ov?.totalSent ?? 0, icon: Activity },
    { label: "Open tickets", value: ov?.openTickets ?? 0, icon: LifeBuoy },
    { label: "MRR", value: `$${((an?.mrrCents ?? 0) / 100).toFixed(0)}`, icon: DollarSign },
    { label: "Revenue 30d", value: `$${((an?.revenueCents30d ?? 0) / 100).toFixed(0)}`, icon: DollarSign, sub: `${an?.signups30d ?? 0} signups` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform overview</h1>
        <p className="text-muted-foreground mt-1">All accounts, all activity, all health.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>{label}</span><Icon className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold mt-2">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">Sends · 30d</div>
          <div className="text-2xl font-bold">{an?.sends30d ?? 0}</div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">Replies · 30d</div>
          <div className="text-2xl font-bold">{an?.replies30d ?? 0}</div>
        </div>
        <div className="bg-card border rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Bounces · 30d</div>
            <div className="text-2xl font-bold">{an?.bounces30d ?? 0}</div>
          </div>
          {(an?.bounces30d ?? 0) > 100 && <AlertTriangle className="w-6 h-6 text-orange-500" />}
        </div>
      </div>
    </div>
  );
}
