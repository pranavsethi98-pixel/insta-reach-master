import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { platformAnalytics } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/visitors")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});
function Page() {
  const f = useServerFn(platformAnalytics);
  const { data } = useQuery({ queryKey: ["analytics-vis"], queryFn: () => f() });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Website visitors</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Total visits (30d)" value={data?.visits30d ?? 0} />
        <Stat label="Resolved companies" value={data?.resolvedCompanies ?? 0} />
        <Stat label="Pixels installed" value={data?.visitorPixels ?? 0} />
      </div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return <div className="bg-card border rounded-xl p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-3xl font-bold mt-1">{value.toLocaleString()}</div></div>;
}
