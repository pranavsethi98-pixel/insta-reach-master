import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listAllCampaigns, setCampaignStatus } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/campaigns")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const f = useServerFn(listAllCampaigns); const s = useServerFn(setCampaignStatus);
  const { data, refetch } = useQuery({ queryKey: ["admin-campaigns"], queryFn: () => f() });
  const m = useMutation({
    mutationFn: async (fn: () => Promise<any>) => fn(),
    onSuccess: () => { refetch(); toast.success("Campaign updated"); },
    onError: (e: any) => toast.error(e?.message ?? "Action failed"),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">All campaigns</h1>
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground text-left">
            <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Owner</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Daily limit</th><th className="px-3 py-2">Created</th><th></th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{c.user_id.slice(0,8)}…</td>
                <td className="px-3 py-2"><Badge variant={c.status === "active" ? "default" : "outline"}>{c.status}</Badge></td>
                <td className="px-3 py-2">{c.daily_send_limit}</td>
                <td className="px-3 py-2 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-right">
                  {c.status !== "paused" && <Button size="sm" variant="outline" onClick={() => m.mutate(() => s({ data: { campaignId: c.id, status: "paused" } }))}>Pause</Button>}
                  {c.status !== "draft" && <Button size="sm" variant="ghost" className="ml-1" onClick={() => m.mutate(() => s({ data: { campaignId: c.id, status: "draft" } }))}>Kill</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
