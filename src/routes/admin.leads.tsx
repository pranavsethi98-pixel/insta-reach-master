import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { platformAnalytics } from "@/lib/admin.functions";
import { Database } from "lucide-react";

export const Route = createFileRoute("/admin/leads")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});
function Page() {
  const f = useServerFn(platformAnalytics);
  const { data } = useQuery({ queryKey: ["analytics-leads"], queryFn: () => f() });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Lead database</h1>
      <p className="text-muted-foreground text-sm">SuperSearch usage and enrichment activity, tracked via the credit ledger.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Total leads" value={data?.totalLeads ?? 0} />
        <Stat label="Enrichments (30d)" value={data?.enrichments30d ?? 0} />
        <Stat label="Verifications (30d)" value={data?.verifications30d ?? 0} />
      </div>
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Database className="w-4 h-4" /> Per-user enrichment usage is visible on each user's detail page.</div>
      </div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return <div className="bg-card border rounded-xl p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-3xl font-bold mt-1">{value.toLocaleString()}</div></div>;
}
