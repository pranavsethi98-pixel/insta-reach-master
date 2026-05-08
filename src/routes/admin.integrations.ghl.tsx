import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Plug, RefreshCw } from "lucide-react";
import { ghlStatus, ghlTestConnection, ghlRecentLog } from "@/lib/ghl.functions";

export const Route = createFileRoute("/admin/integrations/ghl")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const qc = useQueryClient();
  const status = useServerFn(ghlStatus);
  const test = useServerFn(ghlTestConnection);
  const log = useServerFn(ghlRecentLog);

  const { data: s } = useQuery({ queryKey: ["ghl-status"], queryFn: () => status() });
  const { data: l, refetch: refetchLog } = useQuery({ queryKey: ["ghl-log"], queryFn: () => log() });

  const runTest = useMutation({
    mutationFn: () => test({}),
    onSuccess: (r: any) => { toast.success(`Connected to "${r.name ?? r.id}"`); qc.invalidateQueries({ queryKey: ["ghl-log"] }); },
    onError: (e: any) => { toast.error(e?.message ?? "Failed"); refetchLog(); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Plug className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">GoHighLevel</h1>
          <p className="text-sm text-muted-foreground">Sub-account CRM sync via Private Integration Token.</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="flex items-center gap-2 mt-1">
              {s?.configured ? (
                <Badge className="gap-1"><CheckCircle2 className="w-3 h-3" />Configured</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1"><AlertCircle className="w-3 h-3" />Not configured</Badge>
              )}
              {s?.locationId && (
                <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{s.locationId}</code>
              )}
            </div>
          </div>
          <Button onClick={() => runTest.mutate()} disabled={runTest.isPending || !s?.configured}>
            <RefreshCw className={`w-4 h-4 mr-2 ${runTest.isPending ? "animate-spin" : ""}`} />
            Test connection
          </Button>
        </div>
        <div className="text-xs text-muted-foreground border-t pt-3">
          Token & Location ID are stored as backend secrets. To rotate, update the <code>GHL_PRIVATE_TOKEN</code> or <code>GHL_LOCATION_ID</code> secret in Lovable Cloud.
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <div className="font-semibold mb-3">Recent sync activity</div>
        <div className="space-y-1 text-sm">
          {(l?.rows ?? []).length === 0 && (
            <div className="text-muted-foreground">No activity yet. Run a test connection above.</div>
          )}
          {(l?.rows ?? []).map((r: any) => (
            <div key={r.id} className="flex items-center justify-between border-b last:border-0 py-2">
              <div className="flex items-center gap-3">
                <Badge variant={r.status === "ok" ? "default" : "destructive"} className="capitalize">{r.status}</Badge>
                <span className="font-mono text-xs">{r.direction}</span>
                <span>{r.action}</span>
                {r.http_status ? <span className="text-muted-foreground text-xs">HTTP {r.http_status}</span> : null}
              </div>
              <div className="flex items-center gap-3">
                {r.error && <span className="text-destructive text-xs truncate max-w-md">{r.error}</span>}
                <span className="text-muted-foreground text-xs">{new Date(r.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
