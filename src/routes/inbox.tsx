import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Inbox, CheckCircle2, XCircle, Eye, Reply, MousePointerClick, AlertTriangle, Copy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { suggestReply, categorizeReply } from "@/lib/copilot.functions";

export const Route = createFileRoute("/inbox")({
  component: () => (
    <RequireAuth><AppShell><InboxPage /></AppShell></RequireAuth>
  ),
});

const CATEGORY_STYLE: Record<string, string> = {
  interested: "bg-success/15 text-success",
  not_interested: "bg-muted text-muted-foreground",
  out_of_office: "bg-amber-500/15 text-amber-600",
  unsubscribe: "bg-destructive/15 text-destructive",
  question: "bg-blue-500/15 text-blue-600",
  other: "bg-muted text-muted-foreground",
};

function InboxPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"replies" | "activity" | "setup">("replies");

  // If arriving with ?q=... (e.g. from dashboard's "Recent activity"), default to
  // the Activity tab where the matching sent email lives.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) setTab("activity");
  }, []);

  const { data: convs } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () =>
      (await supabase.from("conversations").select("*, messages(*)").order("last_message_at", { ascending: false }).limit(100)).data ?? [],
    refetchInterval: 5000,
  });

  const { data: log } = useQuery({
    queryKey: ["send-log"],
    queryFn: async () => (await supabase.from("send_log").select("*").order("sent_at", { ascending: false }).limit(200)).data ?? [],
    refetchInterval: 5000,
  });

  const markReplied = async (id: string) => {
    qc.setQueryData(["send-log"], (prev: any) => (prev ?? []).map((l: any) => l.id === id ? { ...l, replied_at: new Date().toISOString() } : l));
    await supabase.from("send_log").update({ replied_at: new Date().toISOString() }).eq("id", id);
    toast.success("Marked as replied. Campaign will pause for this lead.");
    qc.invalidateQueries({ queryKey: ["send-log"] });
  };

  const unmarkReplied = async (id: string) => {
    qc.setQueryData(["send-log"], (prev: any) => (prev ?? []).map((l: any) => l.id === id ? { ...l, replied_at: null } : l));
    await supabase.from("send_log").update({ replied_at: null }).eq("id", id);
    toast.success("Reply mark removed. Campaign will resume.");
    qc.invalidateQueries({ queryKey: ["send-log"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1">Replies are categorized by AI. Bounces auto-suppress.</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["replies", "activity", "setup"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm rounded-md capitalize ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "replies" && <RepliesPanel convs={convs ?? []} />}
      {tab === "activity" && <ActivityPanel log={log ?? []} onMarkReplied={markReplied} onUnmarkReplied={unmarkReplied} />}
      {tab === "setup" && <SetupPanel />}
    </div>
  );
}

function RepliesPanel({ convs }: { convs: any[] }) {
  if (convs.length === 0) return (
    <div className="bg-card border rounded-xl p-12 text-center">
      <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">No replies yet. Configure inbound forwarding under Setup.</p>
    </div>
  );
  return (
    <div className="bg-card border rounded-xl divide-y">
      {convs.map((c) => {
        const last = (c.messages ?? []).slice().sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at))[0];
        const cat = c.ai_category as string | null;
        return (
          <div key={c.id} className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Reply className="w-4 h-4 text-success" />
              <div className="font-medium truncate flex-1">{c.subject || "(no subject)"}</div>
              {cat && (
                <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_STYLE[cat] ?? CATEGORY_STYLE.other}`}>
                  {cat.replace(/_/g, " ")}
                </span>
              )}
              <div className="text-xs text-muted-foreground">{new Date(c.last_message_at).toLocaleString()}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">From: {last?.from_email}</div>
            {c.ai_summary && <div className="text-xs text-muted-foreground italic mt-1">"{c.ai_summary}"</div>}
            {last?.body && <div className="text-sm mt-2 line-clamp-3 whitespace-pre-wrap">{last.body}</div>}
          </div>
        );
      })}
    </div>
  );
}

function ActivityPanel({ log, onMarkReplied, onUnmarkReplied }: { log: any[]; onMarkReplied: (id: string) => void; onUnmarkReplied: (id: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (log.length === 0) return (
    <div className="bg-card border rounded-xl p-12 text-center">
      <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">No activity yet.</p>
    </div>
  );
  return (
    <div className="bg-card border rounded-xl divide-y">
      {log.map((l) => {
        const isOpen = expanded === l.id;
        return (
        <div key={l.id} className="p-4 flex items-start gap-3">
          {l.bounced_at ? <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            : l.status === "sent" ? <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
            : <XCircle className="w-5 h-5 text-destructive mt-0.5" />}
          <div className="flex-1 min-w-0">
            <button className="w-full text-left" onClick={() => setExpanded(isOpen ? null : l.id)}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium truncate">{l.subject || "(no subject)"}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(l.sent_at).toLocaleString()}</div>
              </div>
              <div className="text-sm text-muted-foreground">To: {l.to_email} · Step {l.step_order}</div>
            </button>
            <div className="flex gap-2 mt-2 items-center flex-wrap">
              {l.opened_at && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-500/15 text-blue-600"><Eye className="w-3 h-3" /> Opened</span>}
              {l.clicked_at && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-purple-500/15 text-purple-600"><MousePointerClick className="w-3 h-3" /> {l.click_count} click{l.click_count > 1 ? "s" : ""}</span>}
              {l.replied_at && <button onClick={() => onUnmarkReplied(l.id)} title="Click to unmark replied" className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-success/15 text-success hover:bg-success/25 transition-colors"><Reply className="w-3 h-3" /> Replied · undo</button>}
              {l.bounced_at && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-destructive/15 text-destructive">Bounced ({l.bounce_type})</span>}
              {l.status === "sent" && !l.replied_at && !l.bounced_at && (
                <Button size="sm" variant="outline" onClick={() => onMarkReplied(l.id)}>
                  <Reply className="w-3 h-3 mr-1" /> Mark replied
                </Button>
              )}
            </div>
            {isOpen && (l.body || l.html) && (
              <pre className="text-xs whitespace-pre-wrap bg-muted/40 rounded p-3 mt-3 max-h-72 overflow-auto">{l.body || (l.html ? l.html.replace(/<[^>]+>/g, "") : "")}</pre>
            )}
            {l.error && <div className="text-xs text-destructive mt-1">{l.error}</div>}
            {l.bounce_reason && <div className="text-xs text-destructive mt-1">{l.bounce_reason}</div>}
          </div>
        </div>
        );
      })}
    </div>
  );
}

function SetupPanel() {
  const qc = useQueryClient();
  const { data: secret } = useQuery({
    queryKey: ["inbound-secret"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const existing = await supabase.from("inbound_secrets").select("secret").eq("user_id", u.user.id).maybeSingle();
      if (existing.data) return existing.data.secret;
      const created = await supabase.from("inbound_secrets").insert({ user_id: u.user.id }).select("secret").single();
      qc.invalidateQueries({ queryKey: ["inbound-secret"] });
      return created.data?.secret ?? null;
    },
  });

  const url = typeof window !== "undefined" && secret
    ? `${window.location.origin}/api/public/inbound/${secret}`
    : "";

  return (
    <div className="bg-card border rounded-xl p-6 space-y-4 max-w-2xl">
      <div>
        <h2 className="font-semibold">Inbound webhook URL</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Point your inbound email service (CloudMailin, SendGrid Inbound Parse, Mailgun Routes, or a self-hosted IMAP forwarder) at this URL.
          POST JSON with fields: <code className="bg-muted px-1 rounded text-xs">from, to, subject, text, html, in_reply_to, message_id</code>.
          For bounces include <code className="bg-muted px-1 rounded text-xs">is_bounce: true, bounce_type: "hard"|"soft"</code>.
        </p>
      </div>
      <div className="flex gap-2">
        <input readOnly value={url} className="flex-1 bg-muted text-foreground rounded px-3 py-2 text-sm font-mono" />
        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Copied"); }}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Replies match by <code>In-Reply-To</code> header (preferred) or by sender email. Hard bounces auto-add to suppressions. Replies trigger AI categorization (interested / not interested / out of office / unsubscribe / question).
      </p>
    </div>
  );
}
