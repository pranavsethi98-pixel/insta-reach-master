import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Plug, RefreshCw, Upload } from "lucide-react";
import { ghlStatus, ghlTestConnection, ghlRecentLog } from "@/lib/ghl.functions";
import { getGhlSettings, updateGhlSettings, backfillUsersToGhl } from "@/lib/ghl-sync.functions";

export const Route = createFileRoute("/admin/integrations/ghl")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

const FEATURES: Array<{ key: "push_signups" | "push_leads" | "tag_replies" | "tag_plan_changes" | "log_email_activity"; label: string; help: string }> = [
  { key: "push_signups", label: "Auto-push signups", help: "Every new EmailSend user becomes a GHL contact, tagged emailsend-user." },
  { key: "tag_replies", label: "Tag replies", help: "When a lead replies, tag their GHL contact (replied / objection / meeting-booked, etc.)." },
  { key: "tag_plan_changes", label: "Tag plan changes", help: "Apply churned / past_due / upgraded tags from billing webhooks." },
  { key: "push_leads", label: "Push leads", help: "Mirror every campaign lead to GHL as a contact (heavy — enable when ready)." },
  { key: "log_email_activity", label: "Log email activity", help: "Add notes for sends/opens/clicks (batched). Verbose — off by default." },
];

function Page() {
  const qc = useQueryClient();
  const status = useServerFn(ghlStatus);
  const test = useServerFn(ghlTestConnection);
  const log = useServerFn(ghlRecentLog);
  const getS = useServerFn(getGhlSettings);
  const saveS = useServerFn(updateGhlSettings);
  const backfill = useServerFn(backfillUsersToGhl);

  const { data: s } = useQuery({ queryKey: ["ghl-status"], queryFn: () => status() });
  const { data: l, refetch: refetchLog } = useQuery({ queryKey: ["ghl-log"], queryFn: () => log() });
  const { data: settings } = useQuery({ queryKey: ["ghl-settings"], queryFn: () => getS() });

  const runTest = useMutation({
    mutationFn: () => test({}),
    onSuccess: (r: any) => { toast.success(`Connected to "${r.name ?? r.id}"`); qc.invalidateQueries({ queryKey: ["ghl-log"] }); },
    onError: (e: any) => { toast.error(e?.message ?? "Failed"); refetchLog(); },
  });

  const toggle = useMutation({
    mutationFn: (patch: any) => saveS({ data: patch }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ghl-settings"] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const [running, setRunning] = useState(false);
  const runBackfill = async () => {
    setRunning(true);
    try {
      const r: any = await backfill({ data: { limit: 100 } });
      toast.success(`Backfill: ${r.ok} ok · ${r.fail} fail · ${r.skipped} skipped · ${r.remaining} remaining`);
      qc.invalidateQueries({ queryKey: ["ghl-log"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setRunning(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Plug className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">GoHighLevel</h1>
          <p className="text-sm text-muted-foreground">Admin CRM — every EmailSend user, lead and reply syncs to your GHL sub-account.</p>
        </div>
      </div>

      {/* Connection */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Connection</div>
            <div className="flex items-center gap-2 mt-1">
              {s?.configured ? (
                <Badge className="gap-1"><CheckCircle2 className="w-3 h-3" />Configured</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1"><AlertCircle className="w-3 h-3" />Not configured</Badge>
              )}
              {s?.locationId && <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{s.locationId}</code>}
            </div>
          </div>
          <Button onClick={() => runTest.mutate()} disabled={runTest.isPending || !s?.configured}>
            <RefreshCw className={`w-4 h-4 mr-2 ${runTest.isPending ? "animate-spin" : ""}`} />
            Test connection
          </Button>
        </div>
      </div>

      {/* Sync toggles */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="font-semibold">Sync features</div>
        <div className="space-y-3">
          {FEATURES.map((f) => (
            <div key={f.key} className="flex items-start justify-between gap-4 border-b last:border-0 pb-3 last:pb-0">
              <div>
                <Label className="font-medium">{f.label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{f.help}</p>
              </div>
              <Switch
                checked={!!(settings as any)?.[f.key]}
                onCheckedChange={(v) => toggle.mutate({ [f.key]: v })}
                disabled={toggle.isPending}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Backfill */}
      <div className="bg-card border rounded-xl p-6 flex items-center justify-between">
        <div>
          <div className="font-semibold">Backfill existing users</div>
          <div className="text-sm text-muted-foreground">Push every existing EmailSend user to GHL (100 per click, paced for rate limits).</div>
        </div>
        <Button onClick={runBackfill} disabled={running || !s?.configured} variant="secondary">
          <Upload className={`w-4 h-4 mr-2 ${running ? "animate-pulse" : ""}`} />
          {running ? "Pushing…" : "Backfill 100"}
        </Button>
      </div>

      {/* Activity */}
      <div className="bg-card border rounded-xl p-6">
        <div className="font-semibold mb-3">Recent sync activity</div>
        <div className="space-y-1 text-sm">
          {(l?.rows ?? []).length === 0 && (
            <div className="text-muted-foreground">No activity yet.</div>
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
