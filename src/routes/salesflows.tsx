import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Play, Workflow } from "lucide-react";
import { saveSalesflow, runSalesflows } from "@/lib/salesflows.functions";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/salesflows")({
  component: () => (<RequireAuth><AppShell><SalesflowsPage /></AppShell></RequireAuth>),
});

const FIELDS = [
  { v: "opened_count", l: "Opens" },
  { v: "clicked_count", l: "Clicks" },
  { v: "replied_count", l: "Replies" },
  { v: "sent_count", l: "Sent" },
  { v: "bounced", l: "Bounces" },
];
const OPS = [{ v: "gte", l: "≥" }, { v: "lte", l: "≤" }, { v: "eq", l: "=" }];

const PRESETS = [
  { name: "Hot lead — opened 3x, no reply", conditions: [
    { field: "opened_count", op: "gte", value: 3, window_days: 7 },
    { field: "replied_count", op: "eq", value: 0 },
  ], actions: [{ type: "set_stage", stage: "interested" }] },
  { name: "Stalled — sent 4+, silent 14d", conditions: [
    { field: "sent_count", op: "gte", value: 4 },
    { field: "replied_count", op: "eq", value: 0, window_days: 14 },
  ], actions: [{ type: "add_tag", tag: "stalled" }] },
  { name: "Engaged clicker", conditions: [
    { field: "clicked_count", op: "gte", value: 1, window_days: 7 },
  ], actions: [{ type: "set_stage", stage: "engaged" }] },
];

function SalesflowsPage() {
  const qc = useQueryClient();
  const save = useServerFn(saveSalesflow);
  const run = useServerFn(runSalesflows);
  const [editing, setEditing] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const { data: flows, isLoading: flowsLoading } = useQuery({
    queryKey: ["salesflows"],
    queryFn: async () => (await supabase.from("salesflows").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["salesflows"] });

  const onSave = async () => {
    if (!editing?.name?.trim()) return toast.error("Name required");
    if (!editing?.conditions?.length) return toast.error("Add at least one condition — flows without conditions would match every lead");
    if (!editing?.actions?.length) return toast.error("Add at least one action");
    for (const a of editing.actions) {
      if (a.type === "set_stage" && !a.stage?.trim()) return toast.error("Set pipeline stage: stage name cannot be empty");
      if (a.type === "add_tag" && !a.tag?.trim()) return toast.error("Add tag: tag cannot be empty");
      if (a.type === "webhook" && !a.url?.trim()) return toast.error("Webhook: URL cannot be empty");
    }
    setSaving(true);
    try {
      // Strip null/empty description so the optional() validator on the server
      // doesn't reject it (z.optional() does not accept explicit null).
      const payload = { ...editing, name: editing.name.trim() };
      if (payload.description == null || payload.description === "") delete payload.description;
      await save({ data: payload });
      toast.success("Flow saved");
      setEditing(null); refresh();
    } catch (e: any) {
      // Never expose raw Zod / API JSON to the user.
      const raw = e?.message ?? "";
      const friendly = raw.startsWith("[") || raw.includes('"code"')
        ? "Couldn't save this flow — please check the fields and try again."
        : raw || "Failed to save";
      toast.error(friendly);
    } finally { setSaving(false); }
  };

  const remove = async (id: string, name: string) => {
    const ok = await confirm({
      title: `Delete salesflow "${name}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const { error } = await supabase.from("salesflows").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  const triggerRun = async () => {
    setRunning(true);
    try {
      const { matched } = await run({});
      toast.success(`Matched ${matched} new lead${matched === 1 ? "" : "s"}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Run failed");
    } finally { setRunning(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Workflow className="w-7 h-7 text-primary" /> Salesflows</h1>
          <p className="text-muted-foreground mt-1">Behavior-triggered automations. "If lead opens 3x in 7 days but no reply → mark Interested."</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={triggerRun} disabled={running}><Play className="w-4 h-4 mr-2" /> {running ? "Running…" : "Run now"}</Button>
          <Button onClick={() => setEditing({ name: "", conditions: [{ field: "opened_count", op: "gte", value: 1 }], actions: [], is_active: true })}>
            <Plus className="w-4 h-4 mr-2" /> New flow
          </Button>
        </div>
      </div>

      {flowsLoading && (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      )}

      {!flowsLoading && !flows?.length && !editing && (
        <div className="bg-card border rounded-xl p-8 space-y-3">
          <p className="text-muted-foreground">Start from a preset:</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {PRESETS.map((p) => (
              <button key={p.name} className="text-left bg-muted/40 hover:bg-muted rounded-lg p-3" onClick={() => setEditing({ ...p, is_active: true })}>
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.conditions.length} conditions · {p.actions.length} actions</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>

          <div>
            <div className="flex items-center justify-between mb-2"><Label>Conditions (all must match)</Label>
              <Button size="sm" variant="ghost" onClick={() => setEditing({ ...editing, conditions: [...editing.conditions, { field: "opened_count", op: "gte", value: 1 }] })}><Plus className="w-3 h-3 mr-1" /> Add</Button>
            </div>
            {editing.conditions.map((c: any, i: number) => (
              <div key={i} className="flex flex-wrap items-center gap-2 mb-2">
                <select className="h-9 rounded-md border bg-background px-2 text-sm" value={c.field} onChange={(e) => {
                  const n = [...editing.conditions]; n[i] = { ...c, field: e.target.value }; setEditing({ ...editing, conditions: n });
                }}>{FIELDS.map(f => <option key={f.v} value={f.v}>{f.l}</option>)}</select>
                <select className="h-9 rounded-md border bg-background px-2 text-sm" value={c.op} onChange={(e) => {
                  const n = [...editing.conditions]; n[i] = { ...c, op: e.target.value }; setEditing({ ...editing, conditions: n });
                }}>{OPS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
                <Input type="number" min={0} className="w-20 h-9" value={c.value} onChange={(e) => {
                  const n = [...editing.conditions]; n[i] = { ...c, value: Math.max(0, Number(e.target.value)) }; setEditing({ ...editing, conditions: n });
                }} />
                <span className="text-sm text-muted-foreground">in last</span>
                <Input type="number" min={1} className="w-20 h-9" value={c.window_days ?? ""} placeholder="∞" onChange={(e) => {
                  const n = [...editing.conditions]; const v = e.target.value ? Math.max(1, Number(e.target.value)) : undefined; n[i] = { ...c, window_days: v }; setEditing({ ...editing, conditions: n });
                }} />
                <span className="text-sm text-muted-foreground">days</span>
                <Button size="icon" variant="ghost" onClick={() => setEditing({ ...editing, conditions: editing.conditions.filter((_: any, j: number) => j !== i) })}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2"><Label>Actions</Label>
              <Button size="sm" variant="ghost" onClick={() => setEditing({ ...editing, actions: [...editing.actions, { type: "set_stage", stage: "interested" }] })}><Plus className="w-3 h-3 mr-1" /> Add</Button>
            </div>
            {editing.actions.map((a: any, i: number) => (
              <div key={i} className="flex flex-wrap items-center gap-2 mb-2">
                <select className="h-9 rounded-md border bg-background px-2 text-sm" value={a.type} onChange={(e) => {
                  const n = [...editing.actions];
                  const defaults: Record<string, object> = { set_stage: { stage: "interested" }, add_tag: { tag: "" }, webhook: { url: "" } };
                  n[i] = { type: e.target.value, ...(defaults[e.target.value] ?? {}) };
                  setEditing({ ...editing, actions: n });
                }}>
                  <option value="set_stage">Set pipeline stage</option>
                  <option value="add_tag">Add tag</option>
                  <option value="webhook">Fire webhook</option>
                </select>
                {a.type === "set_stage" && (
                  <Input className="h-9 w-40" placeholder="stage name" value={a.stage ?? ""} onChange={(e) => { const n = [...editing.actions]; n[i] = { ...a, stage: e.target.value }; setEditing({ ...editing, actions: n }); }} />
                )}
                {a.type === "add_tag" && (
                  <Input className="h-9 w-40" placeholder="tag" value={a.tag ?? ""} onChange={(e) => { const n = [...editing.actions]; n[i] = { ...a, tag: e.target.value }; setEditing({ ...editing, actions: n }); }} />
                )}
                {a.type === "webhook" && (
                  <Input className="h-9 w-64" placeholder="https://…" value={a.url ?? ""} onChange={(e) => { const n = [...editing.actions]; n[i] = { ...a, url: e.target.value }; setEditing({ ...editing, actions: n }); }} />
                )}
                <Button size="icon" variant="ghost" onClick={() => setEditing({ ...editing, actions: editing.actions.filter((_: any, j: number) => j !== i) })}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2"><Button onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save flow"}</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
        </div>
      )}

      <div className="space-y-2">
        {(flows ?? []).map((f: any) => (
          <div key={f.id} className="bg-card border rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="font-medium">{f.name}</div>
              {f.description && <div className="text-sm text-muted-foreground">{f.description}</div>}
              <div className="text-xs text-muted-foreground mt-1">{(() => { const c = (f.conditions || []).length; const a = (f.actions || []).length; return `${c} ${c === 1 ? "condition" : "conditions"} · ${a} ${a === 1 ? "action" : "actions"} · ${f.is_active ? "Active" : "Paused"}`; })()}</div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={async () => {
                const { error } = await supabase.from("salesflows").update({ is_active: !f.is_active }).eq("id", f.id);
                if (error) { toast.error(error.message); return; }
                toast.success(f.is_active ? "Flow paused" : "Flow resumed");
                refresh();
              }}>{f.is_active ? "Pause" : "Resume"}</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(f)}>Edit</Button>
              <Button size="icon" variant="ghost" onClick={() => remove(f.id, f.name)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      {confirmDialog}
    </div>
  );
}
