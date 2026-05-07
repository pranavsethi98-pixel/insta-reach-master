import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listAuditLog } from "@/lib/admin.functions";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/audit")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const f = useServerFn(listAuditLog);
  const { data } = useQuery({ queryKey: ["audit"], queryFn: () => f() });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Audit log</h1>
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground text-left">
            <tr><th className="px-3 py-2">When</th><th className="px-3 py-2">Actor</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Target</th><th className="px-3 py-2">Metadata</th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((e: any) => (
              <tr key={e.id} className="border-t">
                <td className="px-3 py-2 text-muted-foreground text-xs">{new Date(e.created_at).toLocaleString()}</td>
                <td className="px-3 py-2 font-mono text-xs">{e.actor_id.slice(0,8)}…</td>
                <td className="px-3 py-2"><Badge variant="outline">{e.action}</Badge></td>
                <td className="px-3 py-2 text-xs">{e.target_type}/{e.target_id?.slice(0,8) ?? "—"}</td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{JSON.stringify(e.metadata)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
