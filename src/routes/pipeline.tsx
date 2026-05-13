import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/pipeline")({
  component: () => (
    <RequireAuth><AppShell><PipelinePage /></AppShell></RequireAuth>
  ),
});

function PipelinePage() {
  const qc = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Attach a non-passive wheel listener so we can preventDefault() and translate
  // vertical scroll into horizontal scroll (React's synthetic onWheel is passive).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const { data: stages, isLoading: l1 } = useQuery({
    queryKey: ["pipeline_stages"],
    queryFn: async () => (await supabase.from("pipeline_stages").select("*").order("sort_order")).data ?? [],
  });
  const { data: leads, isLoading: l2 } = useQuery({
    queryKey: ["pipeline_leads"],
    queryFn: async () => (await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const moveTo = async (stageKey: string) => {
    if (!dragId) return;
    const stage = stages?.find(s => s.key === stageKey);
    const patch: any = { pipeline_stage: stageKey };
    if (stage?.is_won || stage?.is_lost) patch.closed_at = new Date().toISOString();
    const movedId = dragId;
    setDragId(null);
    // Optimistic update: move the card immediately in the cache.
    qc.setQueryData(["pipeline_leads"], (prev: any[]) =>
      (prev ?? []).map(l => l.id === movedId ? { ...l, ...patch } : l)
    );
    const { error } = await supabase.from("leads").update(patch).eq("id", movedId);
    if (error) {
      // Roll back on failure.
      qc.invalidateQueries({ queryKey: ["pipeline_leads"] });
      toast.error("Failed to move deal: " + error.message);
    } else {
      toast.success(`Moved to ${stage?.label}`);
    }
  };

  const totalValue = (key: string) =>
    (leads ?? []).filter(l => (l.pipeline_stage ?? "new") === key).reduce((s, l) => s + Number(l.deal_value || 0), 0);

  const saveEdit = async () => {
    if (!editing) return;
    const raw = Number(editing.deal_value || 0);
    if (!Number.isFinite(raw) || raw < 0) return toast.error("Deal value must be 0 or greater");
    if (raw > 1_000_000_000) return toast.error("Deal value can't exceed $1,000,000,000");
    const patch = { deal_value: raw, notes: editing.notes ?? null };
    const savedId = editing.id;
    // Optimistic update.
    qc.setQueryData(["pipeline_leads"], (prev: any[]) =>
      (prev ?? []).map(l => l.id === savedId ? { ...l, ...patch } : l)
    );
    setEditing(null);
    const { error } = await supabase.from("leads").update(patch).eq("id", savedId);
    if (error) {
      qc.invalidateQueries({ queryKey: ["pipeline_leads"] });
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Deal updated");
    }
  };

  const loading = l1 || l2;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Pipeline</h1>
      <p className="text-muted-foreground mb-6">Drag deals between stages. Scroll horizontally to see all stages. Click a card to edit deal value.</p>
      {loading ? (
        <div className="flex gap-4">
          {[1,2,3,4].map(i => <div key={i} className="min-w-[280px] flex-1 h-64 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : (
      {!loading && !(stages ?? []).length && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium mb-1">No pipeline stages yet</p>
          <p className="text-sm">Pipeline stages are set up automatically. Refresh the page or contact support if they don't appear.</p>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]"
        style={{ scrollbarColor: "hsl(var(--muted-foreground) / 0.3) transparent" }}
      >
        {(stages ?? []).map(stage => {
          const items = (leads ?? []).filter(l => (l.pipeline_stage ?? "new") === stage.key);
          return (
            <div
              key={stage.id}
              className="min-w-[280px] flex-1 bg-muted/30 rounded-lg p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => moveTo(stage.key)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: stage.color ?? "#6366f1" }} />
                  <span className="font-semibold">{stage.label}</span>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  ${totalValue(stage.key).toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                {items.map(lead => (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    onClick={() => setEditing({ ...lead })}
                    className="p-3 cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="font-medium text-sm truncate">
                      {lead.first_name || lead.last_name
                        ? `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim()
                        : lead.email}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{lead.email}</div>
                    {lead.company && <div className="text-xs text-muted-foreground truncate">{lead.company}</div>}
                    {Number(lead.deal_value) > 0 && (
                      <div className="text-xs font-semibold text-primary mt-1">
                        ${Number(lead.deal_value).toLocaleString()}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      )}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit deal</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{editing.email}</div>
              <div>
                <Label>Deal value ($)</Label>
                <Input type="number" min={0} max={1000000000} step="0.01" value={editing.deal_value ?? 0} onChange={(e) => setEditing({ ...editing, deal_value: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <textarea className="w-full min-h-24 rounded-md border bg-background p-2 text-sm" value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveEdit}>Save</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
