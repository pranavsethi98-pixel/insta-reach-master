import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listAllMailboxes, setMailboxAdminSuspended, listWarmupPools, moveMailboxToPool } from "@/lib/admin.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/mailboxes")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const [low, setLow] = useState(false);
  const [poolSelections, setPoolSelections] = useState<Record<string, string>>({});
  const fm = useServerFn(listAllMailboxes); const fp = useServerFn(listWarmupPools);
  const sus = useServerFn(setMailboxAdminSuspended); const mv = useServerFn(moveMailboxToPool);
  const { data: mbs, refetch } = useQuery({ queryKey: ["admin-mbs", low], queryFn: () => fm({ data: { lowHealthOnly: low } }) });
  const { data: pools } = useQuery({ queryKey: ["admin-pools"], queryFn: () => fp() });
  const m = useMutation({
    mutationFn: async (fn: () => Promise<any>) => fn(),
    onSuccess: () => { refetch(); toast.success("Updated"); },
    onError: (e: any) => toast.error(e?.message ?? "Action failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mailboxes</h1>
        <Button variant={low ? "default" : "outline"} size="sm" onClick={() => setLow(!low)}>Low health only</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(pools ?? []).map((p: any) => (
          <div key={p.id} className="bg-card border rounded-xl p-4">
            <div className="text-xs uppercase text-muted-foreground">{p.tier} pool</div>
            <div className="font-bold text-xl">{p.name}</div>
            <div className="text-2xl font-bold mt-1">{p.member_count}</div>
            <div className="text-xs text-muted-foreground">members</div>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground text-left">
            <tr>
              <th className="px-3 py-2">Mailbox</th>
              <th className="px-3 py-2">Health</th>
              <th className="px-3 py-2">Deliverability</th>
              <th className="px-3 py-2">Today</th>
              <th className="px-3 py-2">Pool</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(mbs ?? []).map((mb: any) => (
              <tr key={mb.id} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-medium">{mb.label}</div>
                  <div className="text-xs text-muted-foreground">{mb.from_email}</div>
                </td>
                <td className="px-3 py-2">{mb.health_score}</td>
                <td className="px-3 py-2">{mb.deliverability_score}%</td>
                <td className="px-3 py-2">{mb.sent_today}/{mb.daily_limit}</td>
                <td className="px-3 py-2">
                  <select
                    className="bg-transparent border rounded px-2 py-1 text-xs"
                    value={poolSelections[mb.id] ?? (mb.warmup_pool_id ?? "")}
                    onChange={(e) => {
                      const poolId = e.target.value;
                      setPoolSelections(prev => ({ ...prev, [mb.id]: poolId }));
                      m.mutate(() => mv({ data: { mailboxId: mb.id, poolId } }));
                    }}
                  >
                    <option value="">—</option>
                    {(pools ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.tier}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  {mb.admin_suspended ? <Badge variant="destructive">suspended</Badge> : <Badge variant="outline">active</Badge>}
                </td>
                <td className="px-3 py-2">
                  <Button size="sm" variant="outline" onClick={() => m.mutate(() => sus({ data: { mailboxId: mb.id, suspend: !mb.admin_suspended } }))}>
                    {mb.admin_suspended ? "Resume" : "Suspend"}
                  </Button>
                </td>
              </tr>
            ))}
            {!mbs?.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No mailboxes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
