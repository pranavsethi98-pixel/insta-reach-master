import { Mail, BarChart3, Inbox, CheckCircle2, Send, Sparkles, TrendingUp, Users } from "lucide-react";

// Polished single-frame product hero mockup — looks like a real app screenshot.
export function HeroVisual() {
  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      {/* Glow */}
      <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Browser frame */}
      <div className="relative rounded-2xl bg-card border border-border shadow-[0_30px_80px_-30px_oklch(0.55_0.22_263/0.45)] overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/70" />
          </div>
          <div className="ml-3 flex-1 max-w-xs mx-auto px-3 py-1 rounded-md bg-background text-[10px] text-muted-foreground text-center font-mono truncate">
            app.emailsend.ai / campaigns / q4-outbound
          </div>
        </div>

        {/* App body */}
        <div className="grid grid-cols-12 min-h-[380px]">
          {/* Sidebar */}
          <div className="col-span-2 border-r border-border bg-muted/20 p-2 space-y-1">
            {[
              { i: Mail, label: "Inbox", active: false },
              { i: Send, label: "Campaigns", active: true },
              { i: BarChart3, label: "Analytics", active: false },
              { i: Users, label: "Leads", active: false },
            ].map((n, idx) => (
              <div key={idx} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] ${n.active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}>
                <n.i className="w-3 h-3" />
                <span className="truncate">{n.label}</span>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="col-span-7 p-5 border-r border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] text-muted-foreground">Campaign</div>
                <div className="text-sm font-bold">Q4 Outbound · SaaS founders</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">● Live</span>
            </div>

            {/* Mini chart */}
            <div className="flex items-end gap-1.5 h-20 mb-4">
              {[35, 55, 42, 70, 60, 85, 78, 92, 80, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary" style={{ height: `${h}%` }} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Sent", v: "1,247", d: "+18%" },
                { l: "Replies", v: "476", d: "+24%" },
                { l: "Booked", v: "38", d: "+12%" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border border-border p-2.5">
                  <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{s.l}</div>
                  <div className="text-base font-bold mt-0.5">{s.v}</div>
                  <div className="text-[9px] text-success flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{s.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right inbox panel */}
          <div className="col-span-3 bg-muted/10">
            <div className="px-3 py-2.5 border-b border-border flex items-center gap-1.5">
              <Inbox className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold">Replies</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">5</span>
            </div>
            {[
              { n: "Sarah Chen", t: "Yes, let's chat Thursday", c: "from-primary to-primary" },
              { n: "Marcus Webb", t: "Send the deck", c: "from-primary to-primary" },
              { n: "Priya Patel", t: "Interested — more info?", c: "from-primary to-primary" },
              { n: "David Park", t: "Pricing question", c: "from-primary to-primary" },
            ].map((m, i) => (
              <div key={i} className="px-3 py-2 border-b border-border/60 last:border-0 flex items-start gap-2">
                <div className={`w-5 h-5 shrink-0 rounded-full bg-gradient-to-br ${m.c}`} />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold truncate">{m.n}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{m.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating reply pill */}
      <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 rounded-full bg-card border border-border shadow-xl px-3 py-2">
        <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-success" />
        </div>
        <div>
          <div className="text-[10px] font-semibold">New reply · Helios</div>
          <div className="text-[9px] text-muted-foreground">Booked: 30 min · Thursday</div>
        </div>
      </div>

      {/* Floating AI badge */}
      <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground shadow-xl px-3 py-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold">AI Copilot</span>
      </div>
    </div>
  );
}
