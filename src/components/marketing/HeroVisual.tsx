import { Mail, BarChart3, Inbox, CheckCircle2, Send, Sparkles, TrendingUp, Users, Activity, Reply, Clock } from "lucide-react";

// World-class product mockup: looks like a live operator console
export function HeroVisual() {
  const sends = [
    { to: "lena@northwind.io", status: "delivered", time: "0.2s" },
    { to: "marc@quanta.com", status: "delivered", time: "0.3s" },
    { to: "amir@helios.co", status: "opened", time: "12s" },
    { to: "priya@lumen.dev", status: "replied", time: "—" },
    { to: "sam@vertex.ai", status: "delivered", time: "0.4s" },
  ];
  const statusClass = {
    delivered: "text-muted-foreground",
    opened: "text-warning",
    replied: "text-success",
  } as const;

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      {/* Ambient glow */}
      <div className="absolute -inset-12 bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/40 via-transparent to-primary/20 opacity-60 blur-md pointer-events-none" />

      {/* Browser frame */}
      <div className="relative rounded-2xl bg-card border border-border shadow-glow overflow-hidden ring-1 ring-white/5">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <div className="ml-3 flex-1 max-w-xs mx-auto px-3 py-1 rounded-md bg-background text-[10px] text-muted-foreground text-center font-mono truncate">
            app.emailsend.ai / campaigns / q4-outbound
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> live
          </div>
        </div>

        {/* App body */}
        <div className="grid grid-cols-12 min-h-[420px]">
          {/* Sidebar */}
          <div className="col-span-2 border-r border-border bg-muted/20 p-2 space-y-1">
            {[
              { i: Mail, label: "Inbox", n: "12" },
              { i: Send, label: "Campaigns", active: true },
              { i: BarChart3, label: "Analytics" },
              { i: Users, label: "Leads" },
              { i: Activity, label: "Health" },
            ].map((n, idx) => (
              <div key={idx} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] ${n.active ? "bg-primary text-primary-foreground font-semibold shadow-glow" : "text-muted-foreground"}`}>
                <n.i className="w-3 h-3" />
                <span className="truncate flex-1">{n.label}</span>
                {n.n && <span className="text-[9px] font-mono opacity-70">{n.n}</span>}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="col-span-7 p-5 border-r border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Campaign</div>
                <div className="text-sm font-bold">Q4 Outbound · SaaS founders</div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-success/15 text-success font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
              </span>
            </div>

            {/* Mini area chart */}
            <div className="relative h-24 rounded-lg bg-muted/30 border border-border/60 overflow-hidden">
              <svg viewBox="0 0 200 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 263)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="oklch(0.55 0.22 263)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,60 L20,50 L40,55 L60,40 L80,45 L100,28 L120,32 L140,18 L160,22 L180,12 L200,15 L200,80 L0,80 Z" fill="url(#g1)" />
                <path d="M0,60 L20,50 L40,55 L60,40 L80,45 L100,28 L120,32 L140,18 L160,22 L180,12 L200,15" fill="none" stroke="oklch(0.55 0.22 263)" strokeWidth="1.5" />
              </svg>
              <div className="absolute top-2 left-2 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Replies · 7d</div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-success flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" /> +24%
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Sent", v: "1,247", d: "+18%" },
                { l: "Replies", v: "476", d: "+24%" },
                { l: "Booked", v: "38", d: "+12%" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border border-border bg-card/60 p-2.5">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-widest font-mono">{s.l}</div>
                  <div className="text-base font-bold mt-0.5">{s.v}</div>
                  <div className="text-[9px] text-success flex items-center gap-0.5 font-mono"><TrendingUp className="w-2.5 h-2.5" />{s.d}</div>
                </div>
              ))}
            </div>

            {/* Live send feed */}
            <div className="rounded-lg border border-border bg-card/60 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border/60 flex items-center gap-1.5">
                <Activity className="w-2.5 h-2.5 text-primary" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Live send feed</span>
                <span className="ml-auto text-[9px] font-mono text-success flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-success animate-pulse" /> streaming
                </span>
              </div>
              <div className="divide-y divide-border/40">
                {sends.map((s, i) => (
                  <div key={i} className="px-3 py-1.5 flex items-center gap-2 text-[10px]">
                    <Send className="w-2.5 h-2.5 text-muted-foreground/60" />
                    <span className="font-mono truncate flex-1">{s.to}</span>
                    <span className={`font-mono font-semibold ${statusClass[s.status as keyof typeof statusClass]}`}>● {s.status}</span>
                    <span className="font-mono text-muted-foreground/60 w-8 text-right">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right inbox panel */}
          <div className="col-span-3 bg-muted/10 flex flex-col">
            <div className="px-3 py-2.5 border-b border-border flex items-center gap-1.5">
              <Inbox className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold">Replies</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-mono">5</span>
            </div>
            {[
              { n: "Sarah Chen", t: "Yes, let's chat Thursday", time: "2m", positive: true },
              { n: "Marcus Webb", t: "Send the deck", time: "14m", positive: true },
              { n: "Priya Patel", t: "Interested — more info?", time: "1h", positive: true },
              { n: "David Park", t: "Pricing question", time: "2h" },
              { n: "Ana Ruiz", t: "Worth a call next wk?", time: "3h" },
            ].map((m, i) => (
              <div key={i} className="px-3 py-2 border-b border-border/60 last:border-0 flex items-start gap-2">
                <div className="w-5 h-5 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 ring-1 ring-white/10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <div className="text-[10px] font-semibold truncate">{m.n}</div>
                    {m.positive && <span className="w-1 h-1 rounded-full bg-success" />}
                  </div>
                  <div className="text-[9px] text-muted-foreground truncate">{m.t}</div>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground/60">{m.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-4 text-[9px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success" /> all systems ok</span>
          <span>warmup · 100%</span>
          <span>placement · 99.2%</span>
          <span className="ml-auto">v2.0 · iad-1</span>
        </div>
      </div>

      {/* Floating reply pill */}
      <div className="absolute -bottom-5 -left-4 hidden sm:flex items-center gap-2.5 rounded-full bg-card border border-border shadow-glow px-4 py-2.5 ring-1 ring-white/5">
        <div className="relative w-8 h-8 rounded-full bg-success/15 flex items-center justify-center">
          <Reply className="w-4 h-4 text-success" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success" />
        </div>
        <div>
          <div className="text-[11px] font-semibold leading-tight">New reply · Helios</div>
          <div className="text-[9px] text-muted-foreground font-mono flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Booked · Thu 2:30pm</div>
        </div>
      </div>

      {/* Floating AI badge */}
      <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground shadow-glow px-3.5 py-2 ring-1 ring-white/15">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold">AI drafted 8 replies</span>
      </div>
    </div>
  );
}
