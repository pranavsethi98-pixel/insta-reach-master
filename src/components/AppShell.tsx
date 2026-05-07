import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Mail, Users, Send, Inbox, LogOut, Zap, Flame, BarChart3, Ban, KanbanSquare, UsersRound, Settings, Webhook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaigns", icon: Send },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/mailboxes", label: "Mailboxes", icon: Mail },
  { to: "/warmup", label: "Warmup", icon: Flame },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/suppressions", label: "Suppressions", icon: Ban },
  { to: "/team", label: "Team", icon: UsersRound },
  { to: "/webhooks", label: "Webhooks", icon: Webhook },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { location } = useRouterState();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col p-4 border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-white">Outreachly</span>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50",
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <Button
          variant="ghost"
          onClick={logout}
          className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
