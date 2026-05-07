import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listAllMailboxes, listWarmupPools } from "@/lib/admin.functions";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/deliverability")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});
function Page() {
  const fm = useServerFn(listAllMailboxes); const fp = useServerFn(listWarmupPools);
  const { data: mb } = useQuery({ queryKey: ["all-mailboxes"], queryFn: () => fm({ data: {} }) });
  const { data: pools } = useQuery({ queryKey: ["pools"], queryFn: () => fp() });
  const low = (mb ?? []).filter((m: any) => (m.health_score ?? 100) < 70);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Deliverability</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Total mailboxes" value={mb?.length ?? 0} />
        <Stat label="At-risk (health &lt; 70)" value={low.length} accent />
        <Stat label="Warmup pools" value={pools?.length ?? 0} />
      </div>
      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">At-risk mailboxes</h2>
        <div className="divide-y">
          {low.slice(0, 25).map((m: any) => (
            <div key={m.id} className="flex justify-between py-2 text-sm">
              <span>{m.email_address}</span>
              <Badge variant="destructive">health {m.health_score ?? 0}</Badge>
            </div>
          ))}
          {low.length === 0 && <div className="text-sm text-muted-foreground py-4">All mailboxes healthy.</div>}
        </div>
      </div>
    </div>
  );
}
function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return <div className={`bg-card border rounded-xl p-4 ${accent && value > 0 ? "border-destructive/50" : ""}`}>
    <div className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: label }} />
    <div className="text-3xl font-bold mt-1">{value}</div>
  </div>;
}
