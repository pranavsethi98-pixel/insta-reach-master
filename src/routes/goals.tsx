import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

  const { data: goals } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => (await supabase.from("goals").select("*").order("starts_at", { ascending: false })).data ?? [],
  });

  // Compute simple progress per metric for current month
  const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  const { data: log } = useQuery({
    queryKey: ["goal-progress"],
    queryFn: async () => (await supabase.from("send_log").select("status, replied_at, sent_at").gte("sent_at", monthStart.toISOString())).data ?? [],
  });
  const { data: leads } = useQuery({
    queryKey: ["goal-leads"],
    queryFn: async () => (await supabase.from("leads").select("pipeline_stage, deal_value, closed_at")).data ?? [],
  });
  const progress = {
    sent: (log ?? []).filter(l => l.status === "sent").length,
    replies: (log ?? []).filter(l => l.replied_at).length,
    meetings_booked: (leads ?? []).filter(l => l.pipeline_stage === "meeting").length,
    revenue: (leads ?? []).filter(l => l.closed_at && new Date(l.closed_at) >= monthStart).reduce((s, l) => s + Number(l.deal_value || 0), 0),
  };

  const refresh = () => { qc.invalidateQueries({ queryKey: ["goals"] }); };

  const create = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("goals").insert({ ...draft, user_id: u.user.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Goal created");
    setAdding(false); refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this goal?")) return;
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
          <div><Label>Target</Label><Input type="number" value={draft.target} onChange={(e) => setDraft({ ...draft, target: Number(e.target.value) })} /></div>
          <div><Label>Period</Label>
            <select className="w-full h-10 rounded-md border bg-background px-2 text-sm" value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })}>
              <option value="month">Month</option><option value="quarter">Quarter</option>
            </select>
          </div>
          <div className="flex gap-2"><Button onClick={create}>Save</Button><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {(goals ?? []).map((g: any) => {
          const cur = (progress as any)[g.metric] ?? 0;
          const pct = Math.min(100, Math.round((cur / Math.max(1, Number(g.target))) * 100));
          const label = METRICS.find(m => m.v === g.metric)?.l ?? g.metric;
          return (
            <div key={g.id} className="bg-card border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">{g.period}</div>
                  <div className="font-semibold">{label}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(g.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <div className="mt-3 text-2xl font-bold">{cur} <span className="text-sm font-normal text-muted-foreground">/ {g.target}</span></div>
              <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{pct}% of target</div>
            </div>
          );
        })}
        {!goals?.length && !adding && <div className="col-span-2 bg-card border rounded-xl p-8 text-center text-muted-foreground">No goals yet.</div>}
      </div>
    </div>
  );
}
