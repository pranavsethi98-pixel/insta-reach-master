import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/goals")({
  component: () => (<RequireAuth><AppShell><GoalsPage /></AppShell></RequireAuth>),
});

const METRICS = [
  { v: "meetings_booked", l: "Meetings booked" },
  { v: "replies", l: "Replies" },
  { v: "sent", l: "Emails sent" },
  { v: "revenue", l: "Revenue ($)" },
];

function GoalsPage() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ metric: "meetings_booked", target: 20, period: "month" });
  const { confirm, dialog: confirmDialog } = useConfirm();

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      return (await supabase.from("goals").select("*").eq("user_id", user.id).order("starts_at", { ascending: false })).data ?? [];
    },
  });

  // Memoised period boundaries — avoids stale queryFn closures on re-render
  const { monthStart, quarterStart } = useMemo(() => {
    const ms = new Date(); ms.setUTCDate(1); ms.setUTCHours(0, 0, 0, 0);
    const qs = new Date(); qs.setUTCMonth(Math.floor(qs.getUTCMonth() / 3) * 3, 1); qs.setUTCHours(0, 0, 0, 0);
    return { monthStart: ms, quarterStart: qs };
  }, []);

  // Fetch from the earliest boundary needed (quarter start covers month too)
  const { data: log, isLoading: logLoading } = useQuery({
    queryKey: ["goal-progress", quarterStart.toISOString()],
    queryFn: async () => (await supabase.from("send_log").select("status, replied_at, sent_at").gte("sent_at", quarterStart.toISOString())).data ?? [],
  });
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["goal-leads"],
    queryFn: async () => (await supabase.from("leads").select("pipeline_stage, deal_value, closed_at, meeting_booked_at")).data ?? [],
  });

  // Progress by period so quarterly goals show quarterly actuals
  const makeProgress = (since: Date) => ({
    sent: (log ?? []).filter(l => l.status === "sent" && new Date(l.sent_at) >= since).length,
    replies: (log ?? []).filter(l => l.replied_at && new Date(l.replied_at) >= since).length,
    meetings_booked: (leads ?? []).filter(l => l.pipeline_stage === "meeting" && l.meeting_booked_at && new Date(l.meeting_booked_at) >= since).length,
    revenue: (leads ?? []).filter(l => l.closed_at && new Date(l.closed_at) >= since).reduce((s, l) => s + Number(l.deal_value || 0), 0),
  });
  const monthProgress = makeProgress(monthStart);
  const quarterProgress = makeProgress(quarterStart);
  const progressFor = (period: string) => period === "quarter" ? quarterProgress : monthProgress;

  const refresh = () => { qc.invalidateQueries({ queryKey: ["goals"] }); };

  const create = async () => {
    if (!Number.isFinite(draft.target) || draft.target <= 0) { toast.error("Target must be a number greater than 0"); return; }
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("goals").insert({ ...draft, user_id: u.user.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Goal created");
    setAdding(false); refresh();
  };

  const remove = async (id: string, label: string) => {
    const ok = await confirm({
      title: `Delete "${label}" goal?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Goal deleted");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Target className="w-7 h-7 text-primary" /> Goals</h1>
          <p className="text-muted-foreground mt-1">Track monthly targets across your outreach.</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-2" /> New goal</Button>
      </div>

      {adding && (
        <div className="bg-card border rounded-xl p-4 grid sm:grid-cols-4 gap-3 items-end">
          <div><Label>Metric</Label>
            <select className="w-full h-10 rounded-md border bg-background px-2 text-sm" value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value })}>
              {METRICS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
          <div><Label>Target</Label><Input type="number" min={1} value={draft.target} onChange={(e) => setDraft({ ...draft, target: Number(e.target.value) })} /></div>
          <div><Label>Period</Label>
            <select className="w-full h-10 rounded-md border bg-background px-2 text-sm" value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })}>
              <option value="month">Month</option><option value="quarter">Quarter</option>
            </select>
          </div>
          <div className="flex gap-2"><Button onClick={create}>Save</Button><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
        </div>
      )}

      {(goalsLoading || logLoading || leadsLoading) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2].map(i => <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {(goals ?? []).map((g: any) => {
          const prog = progressFor(g.period);
          const cur = (prog as any)[g.metric] ?? 0;
          const pct = Math.min(100, Math.round((cur / Math.max(1, Number(g.target))) * 100));
          const label = METRICS.find(m => m.v === g.metric)?.l ?? g.metric;
          return (
            <div key={g.id} className="bg-card border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">{g.period}</div>
                  <div className="font-semibold">{label}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(g.id, label)}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <div className="mt-3 text-2xl font-bold">{cur} <span className="text-sm font-normal text-muted-foreground">/ {g.target}</span></div>
              <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{pct}% of target</div>
            </div>
          );
        })}
        {!goalsLoading && !goals?.length && !adding && <div className="col-span-2 bg-card border rounded-xl p-8 text-center text-muted-foreground">No goals yet.</div>}
      </div>
      {confirmDialog}
    </div>
  );
}
