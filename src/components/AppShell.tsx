import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Mail, Users, Send, Inbox, LogOut, ArrowRight, Flame, BarChart3, Ban, KanbanSquare,
  UsersRound, Settings, Webhook, Sparkles, Workflow, Globe, BookOpen, Target, Bot, GitBranch, Calendar,
  ShieldCheck, Search, Command, ChevronDown, Activity, Sun, Moon, Plus, MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type NavItem = { to: string; label: string; icon: any };

// Primary: the 6 things operators touch every day.
const primary: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/campaigns", label: "Campaigns", icon: Send },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/mailboxes", label: "Mailboxes", icon: Mail },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

// Everything else, grouped, hidden behind a single "More" toggle.
const moreGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Outbound",
    items: [
      { to: "/subsequences", label: "Subsequences", icon: GitBranch },
      { to: "/salesflows", label: "Salesflows", icon: Workflow },
      { to: "/copilot", label: "AI Copilot", icon: Sparkles },
      { to: "/reply-agent", label: "Reply Agent", icon: Bot },
    ],
  },
  {
    title: "Pipeline",
    items: [
      { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { to: "/meetings", label: "Meetings", icon: Calendar },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { to: "/warmup", label: "Warmup", icon: Flame },
    ],
  },
];

// Reachable only via Cmd+K or direct URL — kept out of sidebar to reduce clutter.
const hiddenItems: NavItem[] = [
  { to: "/team", label: "Team", icon: UsersRound },
  { to: "/webhooks", label: "Webhooks", icon: Webhook },
  { to: "/suppressions", label: "Suppressions", icon: Ban },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/visitors", label: "Visitors", icon: Globe },
];

const allItems: NavItem[] = [...primary, ...moreGroups.flatMap(g => g.items), ...hiddenItems, { to: "/settings", label: "Settings", icon: Settings }];

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const { theme, toggle: toggleTheme } = useTheme();
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isAdmin = user?.email?.toLowerCase() === "pranav@insanex.io";

  // Auto-open "More" if the active route lives inside it.
  const moreItemPaths = moreGroups.flatMap(g => g.items.map(i => i.to));
  const activeIsInMore = moreItemPaths.some(p => location.pathname.startsWith(p));
  const [moreOpen, setMoreOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("nav-more-open") === "1";
  });
  useEffect(() => {
    if (activeIsInMore) setMoreOpen(true);
  }, [activeIsInMore]);
  useEffect(() => {
    try { window.localStorage.setItem("nav-more-open", moreOpen ? "1" : "0"); } catch {}
  }, [moreOpen]);

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

  // Dismiss any lingering toasts when the user navigates so they don't bleed
  // onto the next page.
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  // Light-weight data search for Cmd+K. Only loads when palette is open.
  const { data: searchData } = useQuery({
    queryKey: ["cmdk-search-data"],
    enabled: paletteOpen,
    staleTime: 30_000,
    queryFn: async () => {
      const [campaignsRes, leadsRes, flowsRes] = await Promise.all([
        supabase.from("campaigns").select("id, name").limit(50),
        supabase.from("leads").select("id, email, first_name, last_name, company").limit(100),
        supabase.from("salesflows").select("id, name").limit(50),
      ]);
      return {
        campaigns: campaignsRes.data ?? [],
        leads: leadsRes.data ?? [],
        flows: flowsRes.data ?? [],
      };
    },
  });

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const initials = (user?.full_name || user?.email || "??").slice(0, 2).toUpperCase();
  const currentLabel = allItems.find(i => location.pathname === i.to) ? allItems.find(i => location.pathname === i.to)!.label
    : allItems.find(i => i.to !== "/dashboard" && location.pathname.startsWith(i.to))?.label ?? "Workspace";

  const renderItem = ({ to, label, icon: Icon }: NavItem) => {
    const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
    return (
      <a
        key={to}
        href={to}
        onClick={(e) => { e.preventDefault(); navigate({ to: to as any }); }}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-all",
          active
            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-foreground"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
        <span className="truncate">{label}</span>
      </a>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[240px] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        {/* Brand */}
        <div className="px-4 pt-5 pb-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-glow">
              <ArrowRight className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-[15px] text-foreground leading-tight tracking-tight">EmailSend<span className="text-sidebar-foreground/50 font-normal">.ai</span></div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/45">operator</div>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <button onClick={() => setPaletteOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground/70 text-[12px] transition-colors border border-sidebar-border/60">
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/50 border border-sidebar-border flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="space-y-1">
            {primary.map(renderItem)}
          </div>

          <button
            onClick={() => setMoreOpen(o => !o)}
            className={cn(
              "mt-4 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors",
              "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-foreground",
              activeIsInMore && !moreOpen && "text-foreground"
            )}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="flex-1 text-left">More</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", moreOpen && "rotate-180")} />
          </button>

          {moreOpen && (
            <div className="mt-2 space-y-4">
              {moreGroups.map((g) => (
                <div key={g.title}>
                  <div className="px-3 mb-1 text-[9px] font-mono uppercase tracking-[0.18em] text-sidebar-foreground/40">{g.title}</div>
                  <div className="space-y-0.5">{g.items.map(renderItem)}</div>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-1.5">
          {renderItem({ to: "/settings", label: "Settings", icon: Settings })}
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
          <div className="flex items-center gap-2 px-1 pt-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate text-foreground">{user?.full_name || "—"}</div>
              <div className="text-[10px] text-sidebar-foreground/55 font-mono truncate">{user?.email}</div>
            </div>
            <button onClick={logout} aria-label="Sign out" className="p-1.5 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-foreground">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Top bar */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>workspace</span>
              <ChevronDown className="w-3 h-3 opacity-60 -rotate-90" />
              <span className="text-foreground font-semibold">{currentLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground" onClick={() => navigate({ to: "/analytics" })}>
                <Activity className="w-3.5 h-3.5" /> Live
              </Button>
              <Link to="/campaigns">
                <Button size="sm" className="h-8 rounded-full text-xs shadow-sm gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> New campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div key={location.pathname} className="max-w-7xl mx-auto p-8">{children}</div>
      </main>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Jump to a page…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandGroup heading="Primary">
            {primary.map((it) => (
              <CommandItem key={it.to} value={`${it.label} ${it.to}`} onSelect={() => { setPaletteOpen(false); navigate({ to: it.to as any }); }}>
                <it.icon className="w-4 h-4 mr-2" /> {it.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {moreGroups.map((g) => (
            <CommandGroup key={g.title} heading={g.title}>
              {g.items.map((it) => (
                <CommandItem key={it.to} value={`${it.label} ${it.to}`} onSelect={() => { setPaletteOpen(false); navigate({ to: it.to as any }); }}>
                  <it.icon className="w-4 h-4 mr-2" /> {it.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="More">
            {hiddenItems.map((it) => (
              <CommandItem key={it.to} value={`${it.label} ${it.to}`} onSelect={() => { setPaletteOpen(false); navigate({ to: it.to as any }); }}>
                <it.icon className="w-4 h-4 mr-2" /> {it.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Account">
            <CommandItem value="settings" onSelect={() => { setPaletteOpen(false); navigate({ to: "/settings" as any }); }}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </CommandItem>
          </CommandGroup>
          {!!searchData?.campaigns.length && (
            <CommandGroup heading="Campaigns">
              {searchData.campaigns.map((c: any) => (
                <CommandItem key={c.id} value={`campaign ${c.name} ${c.id}`} onSelect={() => { setPaletteOpen(false); navigate({ to: "/campaigns/$id", params: { id: c.id } }); }}>
                  <Send className="w-4 h-4 mr-2" /> {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!!searchData?.leads.length && (
            <CommandGroup heading="Leads">
              {searchData.leads.map((l: any) => {
                const name = [l.first_name, l.last_name].filter(Boolean).join(" ");
                const label = name ? `${name} · ${l.email}` : l.email;
                return (
                  <CommandItem key={l.id} value={`lead ${l.email} ${name} ${l.company ?? ""}`} onSelect={() => { setPaletteOpen(false); navigate({ to: "/leads" as any }); }}>
                    <Users className="w-4 h-4 mr-2" /> <span className="truncate">{label}</span>
                    {l.company && <span className="ml-2 text-xs text-muted-foreground">{l.company}</span>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
          {!!searchData?.flows.length && (
            <CommandGroup heading="Salesflows">
              {searchData.flows.map((f: any) => (
                <CommandItem key={f.id} value={`salesflow ${f.name} ${f.id}`} onSelect={() => { setPaletteOpen(false); navigate({ to: "/salesflows" as any }); }}>
                  <Workflow className="w-4 h-4 mr-2" /> {f.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
