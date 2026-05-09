import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { listMeetings, markMeeting } from "@/lib/meetings.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({ component: MeetingsPage });

const statusColor: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  no_show: "bg-rose-500/10 text-rose-600",
  rescheduled: "bg-amber-500/10 text-amber-600",
  cancelled: "bg-slate-500/10 text-slate-600",
};

function MeetingsPage() {
  const list = useServerFn(listMeetings);
  const mark = useServerFn(markMeeting);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["meetings"], queryFn: () => list() });
  const m = useMutation({
    mutationFn: (v: any) => mark({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["meetings"] }); },
  });

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="w-7 h-7"/> Meetings</h1>
          <p className="text-muted-foreground">Booked meetings and no-show recovery. Mark a no-show to trigger automatic 1h / 24h / 48h follow-ups.</p>
        </div>

        <div className="grid gap-3">
          {data?.items.map((mt: any) => (
            <Card key={mt.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{mt.lead?.first_name ?? mt.lead?.email ?? "Lead"} — {mt.lead?.company}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3"/> {mt.scheduled_at ? new Date(mt.scheduled_at).toLocaleString() : "—"}
                  <Badge className={statusColor[mt.status]}>{mt.status.replace("_"," ")}</Badge>
                  {mt.no_show_followups_sent > 0 && <span className="text-xs">{mt.no_show_followups_sent} recovery sent</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => m.mutate({ id: mt.id, status: "completed" })}><CheckCircle2 className="w-3 h-3 mr-1"/> Showed</Button>
                <Button size="sm" variant="outline" onClick={() => m.mutate({ id: mt.id, status: "no_show" })}><XCircle className="w-3 h-3 mr-1"/> No-show</Button>
              </div>
            </Card>
          ))}
          {!data?.items.length && (
            <Card className="p-10 text-center space-y-3">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-medium">No meetings yet</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">Meetings appear here automatically when a prospect books via your calendar link, or when the AI Reply Agent detects a confirmed booking. Connect Calendly under Settings → Integrations.</p>
              <Button onClick={() => location.assign("/settings")}>Open settings</Button>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
