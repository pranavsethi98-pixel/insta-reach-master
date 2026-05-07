import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Inbox } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  component: () => (
    <RequireAuth><AppShell><InboxPage /></AppShell></RequireAuth>
  ),
});

function InboxPage() {
  const { data: log } = useQuery({
    queryKey: ["send-log"],
    queryFn: async () => {
      const { data } = await supabase.from("send_log").select("*").order("sent_at", { ascending: false }).limit(200);
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground mt-1">Every email sent through your campaigns.</p>
      </div>
      {log?.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No activity yet.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl divide-y">
          {log?.map((l) => (
            <div key={l.id} className="p-4 flex items-start gap-3">
              {l.status === "sent" ? <CheckCircle2 className="w-5 h-5 text-success mt-0.5" /> : <XCircle className="w-5 h-5 text-destructive mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{l.subject || "(no subject)"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(l.sent_at).toLocaleString()}</div>
                </div>
                <div className="text-sm text-muted-foreground">To: {l.to_email} · Step {l.step_order}</div>
                {l.error && <div className="text-xs text-destructive mt-1">{l.error}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
