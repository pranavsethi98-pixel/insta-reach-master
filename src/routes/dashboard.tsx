import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Users, Send, CheckCircle2, Eye, Reply, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth><AppShell><Dashboard /></AppShell></RequireAuth>
  ),
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [mb, leads, camps, sent, log] = await Promise.all([
        supabase.from("mailboxes").select("id,warmup_enabled", { count: "exact" }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id,status", { count: "exact" }),
        supabase.from("send_log").select("id", { count: "exact", head: true }).eq("status", "sent"),
        supabase.from("send_log").select("opened_at,replied_at").limit(5000),
      ]);
      const opens = (log.data ?? []).filter(l => l.opened_at).length;
      const replies = (log.data ?? []).filter(l => l.replied_at).length;
      return {
        mailboxes: mb.count ?? 0,
        warming: (mb.data ?? []).filter(m => m.warmup_enabled).length,
        leads: leads.count ?? 0,
        campaigns: camps.count ?? 0,
        active: (camps.data ?? []).filter(c => c.status === "active").length,
        sent: sent.count ?? 0,
        opens, replies,
      };
    },
  });

  const stats = [
    { label: "Mailboxes", value: data?.mailboxes ?? 0, icon: Mail, sub: `${data?.warming ?? 0} warming` },
    { label: "Leads", value: data?.leads ?? 0, icon: Users, sub: "" },
    { label: "Campaigns", value: data?.campaigns ?? 0, icon: Send, sub: `${data?.active ?? 0} active` },
    { label: "Sent", value: data?.sent ?? 0, icon: CheckCircle2, sub: "" },
    { label: "Opens", value: data?.opens ?? 0, icon: Eye, sub: "" },
    { label: "Replies", value: data?.replies ?? 0, icon: Reply, sub: "" },
  ];

  const needsMailbox = (data?.mailboxes ?? 0) === 0;
  const needsLeads = !needsMailbox && (data?.leads ?? 0) === 0;
  const needsCampaign = !needsMailbox && !needsLeads && (data?.campaigns ?? 0) === 0;
  const needsWarmup = (data?.mailboxes ?? 0) > 0 && (data?.warming ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your outreach at a glance.</p>
      </div>

      {(needsMailbox || needsLeads || needsCampaign) && (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Get sending in 3 steps</h2>
            <Link to="/onboarding"><Button size="sm">Guided setup <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <StepCard num={1} done={!needsMailbox} title="Connect a mailbox" desc="Add your SMTP credentials" to="/mailboxes" />
            <StepCard num={2} done={!needsMailbox && !needsLeads} title="Import your leads" desc="Upload a CSV with emails" to="/leads" disabled={needsMailbox} />
            <StepCard num={3} done={!needsMailbox && !needsLeads && !needsCampaign} title="Launch a campaign" desc="Build your sequence" to="/campaigns" disabled={needsMailbox || needsLeads} />
          </div>
        </div>
      )}

      {needsWarmup && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <div className="font-semibold">Enable warmup</div>
              <div className="text-sm text-muted-foreground">Protect deliverability before you send at scale.</div>
            </div>
          </div>
          <Link to="/warmup"><Button variant="outline" size="sm">Set up <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>{label}</span><Icon className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold mt-2">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCard({ num, title, desc, to, done, disabled }: any) {
  const inner = (
    <div className={`bg-card border rounded-lg p-4 h-full transition-all ${done ? "opacity-60" : "hover:border-primary"} ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}`}>
          {done ? "✓" : num}
        </div>
        <div className="font-semibold text-sm">{title}</div>
      </div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
  return disabled ? inner : <Link to={to}>{inner}</Link>;
}
