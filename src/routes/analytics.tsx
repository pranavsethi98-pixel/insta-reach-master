import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Eye, Reply, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: () => (
    <RequireAuth><AppShell><AnalyticsPage /></AppShell></RequireAuth>
  ),
});

function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [{ data: log }, { data: events }, { data: campaigns }] = await Promise.all([
        supabase.from("send_log").select("*").gte("sent_at", since).limit(5000),
        supabase.from("email_events").select("*").gte("created_at", since).limit(5000),
        supabase.from("campaigns").select("*"),
      ]);
      return { log: log ?? [], events: events ?? [], campaigns: campaigns ?? [] };
    },
    refetchInterval: 15000,
  });

  if (!data) return <div>Loading…</div>;

  const sent = data.log.filter(l => l.status === "sent").length;
  const failed = data.log.filter(l => l.status === "failed").length;
  const opened = data.log.filter(l => l.opened_at).length;
  const replied = data.log.filter(l => l.replied_at).length;
  const bounced = data.log.filter(l => l.bounced_at).length;
  const openRate = sent ? Math.round((opened / sent) * 100) : 0;
  const replyRate = sent ? Math.round((replied / sent) * 100) : 0;

  // Per-campaign breakdown
  const byCampaign = data.campaigns.map((c) => {
    const lg = data.log.filter(l => l.campaign_id === c.id);
    const s = lg.filter(l => l.status === "sent").length;
    const o = lg.filter(l => l.opened_at).length;
    const r = lg.filter(l => l.replied_at).length;
    return { ...c, sent: s, opened: o, replied: r, openRate: s ? Math.round(o / s * 100) : 0, replyRate: s ? Math.round(r / s * 100) : 0 };
  }).filter(c => c.sent > 0);

  // 14-day timeline
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

  const stats = [
    { label: "Sent (30d)", value: sent, icon: Mail, sub: `${failed} failed` },
    { label: "Open rate", value: `${openRate}%`, icon: Eye, sub: `${opened} opens` },
    { label: "Reply rate", value: `${replyRate}%`, icon: Reply, sub: `${replied} replies` },
    { label: "Bounces", value: bounced, icon: AlertTriangle, sub: "Auto-suppressed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Last 30 days of outbound performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>{label}</span><Icon className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold mt-2">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Daily volume (14d)</h2>
        <div className="flex items-end gap-2 h-40">
          {days.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-muted rounded-t flex flex-col-reverse" style={{ height: "100%" }}>
                <div className="bg-primary rounded-t" style={{ height: `${(d.sent / max) * 100}%` }} title={`${d.sent} sent`} />
              </div>
              <div className="text-[10px] text-muted-foreground">{d.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 font-semibold">Per-campaign performance</div>
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Campaign</th>
              <th className="text-right p-3">Sent</th>
              <th className="text-right p-3">Opens</th>
              <th className="text-right p-3">Open %</th>
              <th className="text-right p-3">Replies</th>
              <th className="text-right p-3">Reply %</th>
            </tr>
          </thead>
          <tbody>
            {byCampaign.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-right">{c.sent}</td>
                <td className="p-3 text-right">{c.opened}</td>
                <td className="p-3 text-right">{c.openRate}%</td>
                <td className="p-3 text-right">{c.replied}</td>
                <td className="p-3 text-right">{c.replyRate}%</td>
              </tr>
            ))}
            {byCampaign.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No campaign data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
