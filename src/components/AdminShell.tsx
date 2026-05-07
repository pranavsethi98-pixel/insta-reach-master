import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Users, CreditCard, Building2, Mail, Send, Database, Coins, Bot, ShieldAlert, Globe, Plug, BarChart3, FileWarning, Library, LifeBuoy, KeyRound, ArrowLeft, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getMyAdminRoles, claimFirstSuperAdmin } from "@/lib/admin.functions";

const sections = [
  { to: "/admin", label: "Overview", icon: ShieldCheck, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/billing", label: "Billing & Plans", icon: CreditCard },
  { to: "/admin/credits", label: "Credits", icon: Coins },
  { to: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { to: "/admin/mailboxes", label: "Mailboxes", icon: Mail },
  { to: "/admin/campaigns", label: "Campaigns", icon: Send },
  { to: "/admin/leads", label: "Lead Database", icon: Database },
  { to: "/admin/ai", label: "AI Controls", icon: Bot },
  { to: "/admin/deliverability", label: "Deliverability", icon: ShieldAlert },
  { to: "/admin/visitors", label: "Visitors", icon: Globe },
  { to: "/admin/integrations", label: "Integrations", icon: Plug },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/compliance", label: "Compliance", icon: FileWarning },
  { to: "/admin/content", label: "Content", icon: Library },
  { to: "/admin/support", label: "Support", icon: LifeBuoy },
  { to: "/admin/rbac", label: "Admins & Roles", icon: KeyRound },
  { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const fetchRoles = useServerFn(getMyAdminRoles);
  const claim = useServerFn(claimFirstSuperAdmin);
  const [bootBusy, setBootBusy] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-admin-roles"],
    queryFn: () => fetchRoles(),
  });

  useEffect(() => {
    if (!isLoading && data && data.roles.length === 0) {
      // not admin — kick to dashboard
      // small delay so the bootstrap card can render once
    }
  }, [isLoading, data]);

  const logout = async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading admin…</div>;
  }

  if (!data || data.roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="max-w-md bg-card border rounded-xl p-6 space-y-4">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            You don't have an admin role. If this platform has no super admin yet, you can claim it now (one-time bootstrap).
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              disabled={bootBusy}
              onClick={async () => {
                setBootBusy(true);
                try {
                  await claim();
                  await refetch();
                } catch (e: any) {
                  alert(e.message ?? "Failed");
                } finally { setBootBusy(false); }
              }}
            >
              {bootBusy ? "Claiming…" : "Claim super admin"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4 border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-destructive-foreground" />
          </div>
          <div>
            <div className="font-bold text-white">Admin</div>
            <div className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider">{data.roles[0].replace("_"," ")}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {sections.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50",
              )}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 pt-2 border-t border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-sidebar-accent/50">
            <ArrowLeft className="w-4 h-4" /> Back to app
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
