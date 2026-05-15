import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Users, Send, CheckCircle2, Reply, Flame, ArrowRight, Activity, Sparkles, ChevronDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, Panel, EmptyState, StatusPill } from "@/components/app/PageHeader";
import { ensureSelfSyncedToGhl } from "@/lib/ghl-sync.functions";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth><AppShell><Dashboard /></AppShell></RequireAuth>
  ),
});

function Dashboard() {
  const ensureSync = useServerFn(ensureSelfSyncedToGhl);
  useEffect(() => { ensureSync({}).catch(() => {}); }, [ensureSync]);

  const [showMore, setShowMore] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("dashboard-show-more") === "1";
  });
  useEffect(() => {
    try { window.localStorage.setItem("dashboard-show-more", showMore ? "1" : "0"); } catch {}
  }, [showMore]);

  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const since14 = new Date(Date.now() - 14 * 86400000).toISOString();
      const [mb, leads, camps, sent, log, recent] = await Promise.all([
        supabase.from("mailboxes").select("id,warmup_enabled,health_score,from_email,deliverability_score", { count: "exact" }).limit(50),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id,status,name", { count: "exact" }),
        supabase.from("send_log").select("id", { count: "exact", head: true }).eq("status", "sent"),
        supabase.from("send_log").select("opened_at,replied_at,sent_at,status").gte("sent_at", since14).limit(5000),
        supabase.from("send_log").select("to_email,sent_at,status,opened_at,replied_at").eq("status", "sent").order("sent_at", { ascending: false }).limit(8),
      ]);
      const opens = (log.data ?? []).filter(l => l.opened_at).length;
      const replies = (log.data ?? []).filter(l => l.replied_at).length;
      const sentCount = (log.data ?? []).filter(l => l.status === "sent").length;
      const replyRate = sentCount ? Math.round((replies / sentCount) * 100) : 0;

      // 14d series
      const days: { date: string; sent: number; replies: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const dayLog = (log.data ?? []).filter((l: any) => l.sent_at?.slice(0, 10) === d);
        days.push({
          date: d.slice(5),
          sent: dayLog.filter((l: any) => l.status === "sent").length,
          replies: dayLog.filter((l: any) => l.replied_at).length,
        });
      }

      return {
        mailboxes: mb.count ?? 0,
        warming: (mb.data ?? []).filter(m => m.warmup_enabled).length,
        avgHealth: mb.data?.length ? Math.round(mb.data.reduce((s, m) => s + (m.health_score ?? 100), 0) / mb.data.length) : 100,
        leads: leads.count ?? 0,
        campaigns: camps.count ?? 0,
        active: (camps.data ?? []).filter(c => c.status === "active").length,
        topCampaigns: (camps.data ?? []).slice(0, 4),
        sent: sent.count ?? 0,
        opens, replies, replyRate,
        days,
        recent: recent.data ?? [],
        topMailboxes: (mb.data ?? []).slice(0, 5),
      };
    },
  });

  const needsMailbox = (data?.mailboxes ?? 0) === 0;
  const needsLeads = !needsMailbox && (data?.leads ?? 0) === 0;
  const needsCampaign = !needsMailbox && !needsLeads && (data?.campaigns ?? 0) === 0;
  // Guard against flashing onboarding panel while data is still loading
  const needsWarmup = !statsLoading && (data?.mailboxes ?? 0) > 0 && (data?.warming ?? 0) === 0;
  const showOnboarding = !statsLoading && (needsMailbox || needsLeads || needsCampaign);

  const days = data?.days ?? [];
  const maxSent = Math.max(1, ...days.map(d => d.sent));

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Operator console"
        title="Dashboard"
        desc="Live state of your outbound — mailboxes, sends, and replies in one feed."
        meta={
          <>
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> live</span>
            <span>{data?.mailboxes ?? 0} mailboxes</span>
            <span>{data?.active ?? 0} active campaigns</span>
            <span>health {data?.avgHealth ?? 100}%</span>
          </>
        }
        actions={
          <Link to="/campaigns">
            <Button className="rounded-full shadow-glow"><Send className="w-4 h-4 mr-1.5" /> New campaign</Button>
          </Link>
        }
      />

      {/* Onboarding panel */}
      {showOnboarding && (
        <div className="relative rounded-2xl bg-gradient-to-br from-primary/15 via-card to-card border border-primary/30 p-6 overflow-hidden">
          <div className="absolute inset-0 bg-dots opacity-[0.06]" />
          <div className="relative flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1">Setup · 3 steps to first send</div>
              <h2 className="font-bold text-xl">Get sending in under 5 minutes</h2>
            </div>
            <Link to="/onboarding"><Button variant="outline" className="rounded-full"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Guided setup</Button></Link>
          </div>
          <div className="relative grid md:grid-cols-3 gap-3">
            <StepCard num={1} done={!needsMailbox} title="Connect a mailbox" desc="Add your SMTP credentials" to="/mailboxes" />
            <StepCard num={2} done={!needsMailbox && !needsLeads} title="Import your leads" desc="Upload a CSV with emails" to="/leads" disabled={needsMailbox} />
            <StepCard num={3} done={!needsMailbox && !needsLeads && !needsCampaign} title="Launch a campaign" desc="Build your sequence" to="/campaigns" disabled={needsMailbox || needsLeads} />
          </div>
        </div>
      )}

      {needsWarmup && !showOnboarding && (
        <div className="rounded-2xl border border-warning/30 bg-warning/5 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-warning-foreground" />
            </div>
            <div>
              <div className="font-semibold">Warmup is off on all mailboxes</div>
              <div className="text-xs text-muted-foreground">Protect deliverability before you scale sends.</div>
            </div>
          </div>
          <Link to="/warmup"><Button variant="outline" size="sm">Enable warmup <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button></Link>
        </div>
      )}

      {/* KPIs — focused on outcomes */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/mailboxes"><StatCard label="Mailboxes" value={data?.mailboxes ?? 0} sub={`${data?.warming ?? 0} warming`} icon={Mail} /></Link>
          <Link to="/leads"><StatCard label="Leads" value={data?.leads ?? 0} sub="In your CRM" icon={Users} /></Link>
          <Link to="/inbox"><StatCard label="Replies" value={data?.replies ?? 0} sub="Last 14 days" icon={Reply} accent /></Link>
          <Link to="/analytics"><StatCard label="Reply rate" value={`${data?.replyRate ?? 0}%`} sub={`${data?.sent ?? 0} sent · all-time`} icon={TrendingUp} /></Link>
        </div>
      )}

      {/* Chart */}
      <Panel
        title="Send volume · 14 days"
        desc="Daily sends and replies"
        actions={<StatusPill tone="primary">Live</StatusPill>}
      >
        {statsLoading ? (
          <div className="h-44 rounded-lg bg-muted/40 animate-pulse" />
        ) : days.length > 0 && days.some(d => d.sent > 0) ? (
          <div>
            <div className="space-y-1">
              {/* Bar chart — fixed-height parent, absolute-positioned bars grow from bottom */}
              <div className="flex items-end gap-1" style={{ height: 140 }}>
                {days.map((d) => (
                  <div key={d.date} className="flex-1 relative h-full rounded-t overflow-hidden bg-primary/10">
                    <div
                      className="absolute bottom-0 w-full rounded-t bg-gradient-to-t from-primary to-primary/60"
                      style={{ height: `${(d.sent / maxSent) * 100}%` }}
                      title={`${d.sent} sent · ${d.replies} replies`}
                    />
                    {d.replies > 0 && (
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-success"
                        style={{ height: `${Math.min(d.replies, d.sent) / maxSent * 100}%` }}
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Date labels */}
              <div className="flex gap-1">
                {days.map((d) => (
                  <div key={d.date} className="flex-1 text-center text-[9px] font-mono text-muted-foreground truncate">{d.date}</div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-4 text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-primary" /> Sent</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-success" /> Replies</span>
            </div>
          </div>
        ) : (
          <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">No send activity yet.</div>
        )}
      </Panel>

      {/* Show more toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowMore((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full border border-border hover:border-primary/40 transition-colors"
        >
          {showMore ? "Hide details" : "Show more details"}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMore ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showMore && (
        <div className="space-y-5">
          <Panel title="Recent activity" desc="Latest sends across your mailboxes — click to open in Inbox" actions={<StatusPill tone="ok">Streaming</StatusPill>}>
            {data?.recent?.length ? (
              <div className="-mx-1 divide-y divide-border/60">
                {data.recent.map((r: any, i: number) => {
                  const tone = r.replied_at ? "ok" : r.opened_at ? "warn" : r.status === "sent" ? "neutral" : "bad";
                  const label = r.replied_at ? "replied" : r.opened_at ? "opened" : r.status;
                  return (
                    <Link
                      key={i}
                      to="/inbox"
                      search={{ q: r.to_email } as any}
                      className="px-1 py-2.5 flex items-center gap-2 text-xs hover:bg-accent/40 rounded transition-colors"
                    >
                      <Send className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <span className="font-mono truncate flex-1">{r.to_email}</span>
                      <StatusPill tone={tone as any}>{label}</StatusPill>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-6 text-center">No sends yet.</div>
            )}
          </Panel>

          <div className="grid lg:grid-cols-2 gap-5">
            <Panel title="Mailbox health" desc="Top 5 by activity" actions={<Link to="/mailboxes" className="text-xs text-primary hover:underline">View all</Link>}>
              {data?.topMailboxes?.length ? (
                <div className="space-y-3">
                  {data.topMailboxes.map((m: any) => {
                    const score = m.health_score ?? 100;
                    const tone = score >= 90 ? "ok" : score >= 70 ? "warn" : "bad";
                    return (
                      <Link key={m.id} to="/mailboxes" className="flex items-center gap-3 -mx-2 px-2 py-1.5 rounded-lg hover:bg-accent/40 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold">
                          {m.from_email?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{m.from_email}</div>
                          <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full ${tone === "ok" ? "bg-success" : tone === "warn" ? "bg-warning" : "bg-destructive"}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground w-10 text-right">{score}%</div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={Mail} title="No mailboxes" desc="Connect your first mailbox to start sending." action={<Link to="/mailboxes"><Button size="sm">Connect mailbox</Button></Link>} />
              )}
            </Panel>

            <Panel title="Campaigns" desc="Status across your workspace" actions={<Link to="/campaigns" className="text-xs text-primary hover:underline">View all</Link>}>
              {data?.topCampaigns?.length ? (
                <div className="space-y-2">
                  {data.topCampaigns.map((c: any) => {
                    const tone = c.status === "active" ? "ok" : c.status === "paused" ? "warn" : "neutral";
                    return (
                      <Link key={c.id} to="/campaigns/$id" params={{ id: c.id }} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-sm font-medium truncate">{c.name}</span>
                        </div>
                        <StatusPill tone={tone as any}>{c.status}</StatusPill>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={Send} title="No campaigns yet" desc="Build your first sequence in 30 seconds with AI Copilot." action={<Link to="/copilot"><Button size="sm"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Start with Copilot</Button></Link>} />
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function StepCard({ num, title, desc, to, done, disabled }: any) {
  const inner = (
    <div className={`relative rounded-xl bg-card/80 border p-4 h-full transition-all ${done ? "border-success/40 opacity-80" : "border-border hover:border-primary/50"} ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${done ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground shadow-glow"}`}>
          {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : num}
        </div>
        <div className="font-semibold text-sm">{title}</div>
      </div>
      <div className="text-xs text-muted-foreground">{desc}</div>
      {!done && !disabled && (
        <div className="mt-2 inline-flex items-center text-[11px] text-primary font-semibold gap-1">
          Start <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );
  if (disabled) return inner;
  // Use TanStack Router Link so back/forward navigation stays within the SPA
  return (
    <Link to={to} className="block">
      {inner}
    </Link>
  );
}
