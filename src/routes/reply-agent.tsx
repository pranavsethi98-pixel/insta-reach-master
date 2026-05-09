import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { listReplyQueue, approveReply, rejectReply } from "@/lib/reply-agent.functions";
import { toast } from "sonner";
import { Bot, Check, X, Sparkles } from "lucide-react";

export const Route = createFileRoute("/reply-agent")({ component: () => (<RequireAuth><AppShell><ReplyAgentPage /></AppShell></RequireAuth>) });

const labelColor: Record<string, string> = {
  interested: "bg-emerald-500/10 text-emerald-600",
  meeting_booked: "bg-blue-500/10 text-blue-600",
  objection: "bg-amber-500/10 text-amber-600",
  referral: "bg-purple-500/10 text-purple-600",
  out_of_office: "bg-slate-500/10 text-slate-600",
  not_interested: "bg-rose-500/10 text-rose-600",
};

function ReplyAgentPage() {
  const list = useServerFn(listReplyQueue);
  const approve = useServerFn(approveReply);
  const reject = useServerFn(rejectReply);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["reply-queue"], queryFn: () => list() });

  const approveMut = useMutation({
    mutationFn: (v: { id: string; subject: string; body: string }) =>
      approve({ data: v }),
    onSuccess: () => { toast.success("Approved"); qc.invalidateQueries({ queryKey: ["reply-queue"] }); },
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => reject({ data: { id } }),
    onSuccess: () => { toast.success("Rejected"); qc.invalidateQueries({ queryKey: ["reply-queue"] }); },
  });

  return (
    <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Bot className="w-7 h-7"/> AI Reply Agent — Live Feed</h1>
          <p className="text-muted-foreground">Approve, edit, or reject AI-drafted replies before they send. Switch to Autopilot in Settings to skip approval.</p>
        </div>

        {isLoading && <p>Loading…</p>}
        {!isLoading && data?.items.length === 0 && (
          <Card className="p-8 text-center">
            <Sparkles className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Nothing to review</p>
            <p className="text-sm text-muted-foreground">When a prospect replies, the AI will draft a response here.</p>
          </Card>
        )}

        {data?.items.map((item: any) => (
          <ReplyCard
            key={item.id}
            item={item}
            onApprove={(subject: string, body: string) => approveMut.mutate({ id: item.id, subject, body })}
            onReject={() => rejectMut.mutate(item.id)}
          />
        ))}
      </div>
    </AppShell>
  );
}

function ReplyCard({ item, onApprove, onReject }: any) {
  const [subject, setSubject] = useState(item.draft_subject || "");
  const [body, setBody] = useState(item.draft_body || "");
  const lead = item.lead;

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{lead?.first_name} {lead?.email && <span className="text-muted-foreground text-sm">— {lead.email}</span>}</div>
          <div className="text-xs text-muted-foreground">{lead?.company}</div>
        </div>
        <div className="flex items-center gap-2">
          {item.classification && (
            <Badge className={labelColor[item.classification] || ""}>{item.classification.replace(/_/g, " ")}</Badge>
          )}
          {item.confidence && <span className="text-xs text-muted-foreground">{Math.round(item.confidence * 100)}%</span>}
        </div>
      </div>

      {item.context_summary && (
        <div className="text-sm bg-muted/50 p-3 rounded border-l-2 border-primary">
          <span className="text-muted-foreground">Their message: </span>{item.context_summary}…
        </div>
      )}

      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} />

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onReject}><X className="w-4 h-4 mr-1"/> Reject</Button>
        <Button onClick={() => onApprove(subject, body)}><Check className="w-4 h-4 mr-1"/> Approve & Send</Button>
      </div>
    </Card>
  );
}
