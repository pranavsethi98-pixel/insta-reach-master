import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Inbox, CheckCircle2, XCircle, Eye, Reply } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/inbox")({
  component: () => (
    <RequireAuth><AppShell><InboxPage /></AppShell></RequireAuth>
  ),
});

function InboxPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"activity" | "replies">("activity");
  const { data: log } = useQuery({
    queryKey: ["send-log"],
    queryFn: async () => (await supabase.from("send_log").select("*").order("sent_at", { ascending: false }).limit(200)).data ?? [],
    refetchInterval: 5000,
  });

  const markReplied = async (id: string) => {
    await supabase.from("send_log").update({ replied_at: new Date().toISOString() }).eq("id", id);
    toast.success("Marked as replied. Campaign will pause for this lead.");
    qc.invalidateQueries({ queryKey: ["send-log"] });
  };

  const items = tab === "replies" ? (log ?? []).filter(l => l.replied_at) : (log ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1">All outbound activity. Mark replies to auto-pause campaigns.</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["activity", "replies"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm rounded-md capitalize ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No {tab} yet.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl divide-y">
          {items.map((l) => (
            <div key={l.id} className="p-4 flex items-start gap-3">
              {l.status === "sent"
                ? <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                : <XCircle className="w-5 h-5 text-destructive mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium truncate">{l.subject || "(no subject)"}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(l.sent_at).toLocaleString()}</div>
                </div>
                <div className="text-sm text-muted-foreground">To: {l.to_email} · Step {l.step_order}</div>
                <div className="flex gap-2 mt-2 items-center">
                  {l.opened_at && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-500/15 text-blue-600"><Eye className="w-3 h-3" /> Opened</span>}
                  {l.replied_at && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-success/15 text-success"><Reply className="w-3 h-3" /> Replied</span>}
                  {l.status === "sent" && !l.replied_at && (
                    <Button size="sm" variant="outline" onClick={() => markReplied(l.id)}>
                      <Reply className="w-3 h-3 mr-1" /> Mark replied
                    </Button>
                  )}
                </div>
                {l.error && <div className="text-xs text-destructive mt-1">{l.error}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
