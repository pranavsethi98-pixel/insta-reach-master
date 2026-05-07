import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/pipeline")({
  component: () => (
    <RequireAuth><AppShell><PipelinePage /></AppShell></RequireAuth>
  ),
});

function PipelinePage() {
  const qc = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);

  const { data: stages } = useQuery({
    queryKey: ["pipeline_stages"],
    queryFn: async () => (await supabase.from("pipeline_stages").select("*").order("sort_order")).data ?? [],
  });
  const { data: leads } = useQuery({
    queryKey: ["pipeline_leads"],
    queryFn: async () => (await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const moveTo = async (stageKey: string) => {
    if (!dragId) return;
    const stage = stages?.find(s => s.key === stageKey);
    const patch: any = { pipeline_stage: stageKey };
    if (stage?.is_won || stage?.is_lost) patch.closed_at = new Date().toISOString();
    await supabase.from("leads").update(patch).eq("id", dragId);
    setDragId(null);
    qc.invalidateQueries({ queryKey: ["pipeline_leads"] });
    toast.success(`Moved to ${stage?.label}`);
  };

  const totalValue = (key: string) =>
    (leads ?? []).filter(l => (l.pipeline_stage ?? "new") === key).reduce((s, l) => s + Number(l.deal_value || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Pipeline</h1>
      <p className="text-muted-foreground mb-6">Drag deals between stages. Won/Lost auto-records the close date.</p>
      <div className="flex gap-4 overflow-x-auto pb-4">
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
                  <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
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
                    className="p-3 cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
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
    </div>
  );
}
