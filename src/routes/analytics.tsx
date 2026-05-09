import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Eye, Reply, AlertTriangle, BarChart3 } from "lucide-react";
import { PageHeader, StatCard, Panel, StatusPill } from "@/components/app/PageHeader";

export const Route = createFileRoute("/analytics")({
  component: () => (
    <RequireAuth><AppShell><AnalyticsPage /></AppShell></RequireAuth>
  ),
});

function AnalyticsPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const { data } = useQuery({
    queryKey: ["analytics", periodDays],
    queryFn: async () => {
      const since = new Date(Date.now() - periodDays * 86400000).toISOString();
      const [{ data: log }, { data: events }, { data: campaigns }] = await Promise.all([
        supabase.from("send_log").select("*").gte("sent_at", since).limit(5000),
        supabase.from("email_events").select("*").gte("created_at", since).limit(5000),
        supabase.from("campaigns").select("*"),
      ]);
      return { log: log ?? [], events: events ?? [], campaigns: campaigns ?? [] };
    },
    refetchInterval: 15000,
  });

  if (!data) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const sent = data.log.filter(l => l.status === "sent").length;
  const failed = data.log.filter(l => l.status === "failed").length;
  const opened = data.log.filter(l => l.opened_at).length;
  const replied = data.log.filter(l => l.replied_at).length;
  const bounced = data.log.filter(l => l.bounced_at).length;
  const openRate = sent ? Math.round((opened / sent) * 100) : 0;
  const replyRate = sent ? Math.round((replied / sent) * 100) : 0;

  const byCampaign = data.campaigns.map((c) => {
    const lg = data.log.filter(l => l.campaign_id === c.id);
    const s = lg.filter(l => l.status === "sent").length;
    const o = lg.filter(l => l.opened_at).length;
    const r = lg.filter(l => l.replied_at).length;
    return { ...c, sent: s, opened: o, replied: r, openRate: s ? Math.round(o / s * 100) : 0, replyRate: s ? Math.round(r / s * 100) : 0 };
  }).filter(c => c.sent > 0).sort((a, b) => b.sent - a.sent);

  const days: { date: string; sent: number; opened: number; replied: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const dayLog = data.log.filter(l => l.sent_at.slice(0, 10) === d);
    days.push({
      date: d.slice(5),
      sent: dayLog.filter(l => l.status === "sent").length,
      opened: dayLog.filter(l => l.opened_at).length,
      replied: dayLog.filter(l => l.replied_at).length,
    });
  }
  const max = Math.max(1, ...days.map(d => d.sent));

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={`Reporting · ${periodDays} days`}
        title="Analytics"
        desc="Sends, opens, replies, and bounces — sliced by campaign and day."
        meta={
          <>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> auto-refresh · 15s</span>
            <span>{sent.toLocaleString()} sent</span>
            <span>{replyRate}% reply rate</span>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="h-7 rounded-md border bg-background px-2 text-[11px] font-mono"
              aria-label="Reporting period"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Sent · 30d" value={sent.toLocaleString()} sub={`${failed} failed`} icon={Mail} />
        <StatCard label="Open rate" value={`${openRate}%`} sub={`${opened} opens`} icon={Eye} accent />
        <StatCard label="Reply rate" value={`${replyRate}%`} sub={`${replied} replies`} icon={Reply} accent />
        <StatCard label="Bounces" value={bounced} sub="Auto-suppressed" icon={AlertTriangle} />
      </div>

      <Panel title="Daily volume · 14d" desc="Sent vs replied" actions={<StatusPill tone="primary">Live</StatusPill>}>
        <div className="flex items-end gap-1.5 h-48">
          {days.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex-1 flex flex-col-reverse">
                <div className="w-full rounded-t bg-gradient-to-t from-primary to-primary/60" style={{ height: `${(d.sent / max) * 100}%` }} title={`${d.sent} sent`} />
                {d.replied > 0 && (
                  <div className="absolute bottom-0 left-0 w-full rounded-t bg-success" style={{ height: `${(d.replied / max) * 100}%` }} />
                )}
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">{d.date}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-primary" /> Sent</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-success" /> Replies</span>
        </div>
      </Panel>

      <Panel title="Per-campaign performance" desc="Ranked by send volume" pad={false}>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            <tr>
              <th className="text-left p-3.5 font-semibold">Campaign</th>
              <th className="text-right p-3.5 font-semibold">Sent</th>
              <th className="text-right p-3.5 font-semibold">Opens</th>
              <th className="text-right p-3.5 font-semibold">Open %</th>
              <th className="text-right p-3.5 font-semibold">Replies</th>
              <th className="text-right p-3.5 font-semibold">Reply %</th>
            </tr>
          </thead>
          <tbody>
            {byCampaign.map(c => (
              <tr key={c.id} className="border-t border-border/60 hover:bg-muted/20 transition-colors">
                <td className="p-3.5 font-medium">{c.name}</td>
                <td className="p-3.5 text-right font-mono">{c.sent}</td>
                <td className="p-3.5 text-right font-mono">{c.opened}</td>
                <td className="p-3.5 text-right font-mono text-foreground/80">{c.openRate}%</td>
                <td className="p-3.5 text-right font-mono text-success">{c.replied}</td>
                <td className="p-3.5 text-right font-mono text-success">{c.replyRate}%</td>
              </tr>
            ))}
            {byCampaign.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No campaign data yet.
              </td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
