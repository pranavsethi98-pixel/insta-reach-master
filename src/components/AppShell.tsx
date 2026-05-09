import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Mail, Users, Send, Inbox, LogOut, ArrowRight, Flame, BarChart3, Ban, KanbanSquare,
  UsersRound, Settings, Webhook, Sparkles, Workflow, Globe, BookOpen, Target, Bot, GitBranch, Calendar,
  ShieldCheck, Search, Command, ChevronDown, Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: any };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/inbox", label: "Inbox", icon: Inbox },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Outbound",
    items: [
      { to: "/campaigns", label: "Campaigns", icon: Send },
      { to: "/subsequences", label: "Subsequences", icon: GitBranch },
      { to: "/salesflows", label: "Salesflows", icon: Workflow },
      { to: "/copilot", label: "AI Copilot", icon: Sparkles },
      { to: "/reply-agent", label: "Reply Agent", icon: Bot },
    ],
  },
  {
    title: "Pipeline",
    items: [
      { to: "/leads", label: "Leads", icon: Users },
      { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { to: "/meetings", label: "Meetings", icon: Calendar },
      { to: "/visitors", label: "Visitors", icon: Globe },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { to: "/mailboxes", label: "Mailboxes", icon: Mail },
      { to: "/warmup", label: "Warmup", icon: Flame },
      { to: "/suppressions", label: "Suppressions", icon: Ban },
      { to: "/library", label: "Library", icon: BookOpen },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/team", label: "Team", icon: UsersRound },
      { to: "/goals", label: "Goals", icon: Target },
      { to: "/webhooks", label: "Webhooks", icon: Webhook },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isAdmin = user?.email?.toLowerCase() === "pranav@insanex.io";

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("full_name,email").eq("id", data.user.id).maybeSingle();
      setUser({ email: data.user.email, full_name: p?.full_name ?? data.user.email ?? "" });
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const initials = (user?.full_name || user?.email || "??").slice(0, 2).toUpperCase();
  const currentLabel = groups.flatMap(g => g.items).find(i => location.pathname.startsWith(i.to))?.label ?? "Workspace";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[252px] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        {/* Brand */}
        <div className="px-4 pt-5 pb-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-glow ring-1 ring-white/10">
              <ArrowRight className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-extrabold text-[15px] text-white leading-tight">EmailSend<span className="text-sidebar-foreground/50 font-normal">.ai</span></div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/50">v2.0 · operator</div>
            </div>
          </Link>
        </div>

        {/* Search hint */}
        <div className="px-3 pb-2">
          <button onClick={() => setPaletteOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/40 hover:bg-sidebar-accent text-sidebar-foreground/70 text-[12px] transition-colors border border-sidebar-border/50">
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sidebar/80 border border-sidebar-border flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="px-2 mb-1.5 text-[9px] font-mono uppercase tracking-[0.18em] text-sidebar-foreground/40">{g.title}</div>
              <div className="space-y-0.5">
                {g.items.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
                  return (
                    <a
                      key={to}
                      href={to}
                      onClick={(e) => { e.preventDefault(); navigate({ to: to as any }); }}
                      className={cn(
                        "relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-all group",
                        active
                          ? "bg-primary text-primary-foreground font-semibold shadow-glow"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: status + admin + user */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-mono text-sidebar-foreground/60">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-success" />
            </span>
            <span>all systems operational</span>
          </div>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] bg-destructive/15 text-destructive hover:bg-destructive/25 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin panel
            </Link>
          )}
          <div className="flex items-center gap-2 px-1.5 py-1.5">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold ring-1 ring-white/10 shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate text-white">{user?.full_name || "—"}</div>
              <div className="text-[10px] text-sidebar-foreground/50 font-mono truncate">{user?.email}</div>
            </div>
            <button onClick={logout} aria-label="Sign out" className="p-1.5 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Top bar */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="text-foreground/60">workspace</span>
              <ChevronDown className="w-3 h-3 opacity-60 -rotate-90" />
              <span className="text-foreground font-semibold">{currentLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground" onClick={() => navigate({ to: "/analytics" })}>
                <Activity className="w-3.5 h-3.5" /> Live
              </Button>
              <Link to="/campaigns">
                <Button size="sm" className="h-8 rounded-full text-xs shadow-glow gap-1">
                  <Send className="w-3 h-3" /> New campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Jump to a page…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          {groups.map((g) => (
            <CommandGroup key={g.title} heading={g.title}>
              {g.items.map((it) => (
                <CommandItem key={it.to} value={`${it.label} ${it.to}`} onSelect={() => { setPaletteOpen(false); navigate({ to: it.to as any }); }}>
                  <it.icon className="w-4 h-4 mr-2" /> {it.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
