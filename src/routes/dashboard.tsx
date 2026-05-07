import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Users, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <AppShell>
        <Dashboard />
      </AppShell>
    </RequireAuth>
  ),
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [mb, leads, camps, sent] = await Promise.all([
        supabase.from("mailboxes").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id", { count: "exact", head: true }),
        supabase.from("send_log").select("id", { count: "exact", head: true }).eq("status", "sent"),
      ]);
      return {
        mailboxes: mb.count ?? 0,
        leads: leads.count ?? 0,
        campaigns: camps.count ?? 0,
        sent: sent.count ?? 0,
      };
    },
  });

  const stats = [
    { label: "Mailboxes", value: data?.mailboxes ?? 0, icon: Mail },
    { label: "Leads", value: data?.leads ?? 0, icon: Users },
    { label: "Campaigns", value: data?.campaigns ?? 0, icon: Send },
    { label: "Emails sent", value: data?.sent ?? 0, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your outreach.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>{label}</span><Icon className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold mt-2">{value}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-2">Getting started</h2>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Connect one or more SMTP mailboxes</li>
          <li>Import your leads via CSV</li>
          <li>Create a campaign with a sequence and assign leads</li>
          <li>Activate the campaign — sends run automatically within your window</li>
        </ol>
      </div>
    </div>
  );
}
