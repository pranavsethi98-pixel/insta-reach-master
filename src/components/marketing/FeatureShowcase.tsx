import { Mail, Flame, Bot, BarChart3, Inbox, KanbanSquare, Send, CheckCircle2, TrendingUp, Sparkles, Plus, Filter, MoreHorizontal, ChevronRight } from "lucide-react";

// Mailbox rotation visual
export function MailboxRotationVisual() {
  const mailboxes = [
    { email: "alex@northwind.io", sent: 47, cap: 50, status: "active" },
    { email: "sam@northwind.io", sent: 32, cap: 50, status: "active" },
    { email: "jordan@northwind.io", sent: 50, cap: 50, status: "warming" },
    { email: "taylor@northwind.io", sent: 28, cap: 50, status: "active" },
    { email: "morgan@northwind.io", sent: 41, cap: 50, status: "active" },
  ];
  return (
    <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="w-4 h-4 text-primary" /> Sending mailboxes
        </div>
        <span className="text-xs text-muted-foreground">5 of unlimited</span>
      </div>
      <div className="divide-y divide-border">
        {mailboxes.map((m) => (
          <div key={m.email} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {m.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{m.email}</div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(m.sent / m.cap) * 100}%` }} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono">{m.sent}/{m.cap}</div>
              <div className={`text-[10px] mt-0.5 ${m.status === "warming" ? "text-warning" : "text-success"}`}>● {m.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sequence builder visual
export function SequenceVisual() {
  const steps = [
    { day: "Day 1", title: "Initial outreach", body: "Hi {{firstName}}, noticed {{company}} is scaling outbound...", open: "62%", reply: "14%" },
    { day: "Day 3", title: "Follow-up", body: "Bumping this — curious if reply timing matters for {{company}}?", open: "48%", reply: "9%" },
    { day: "Day 7", title: "Break-up email", body: "Last note from me. Worth a quick 15 min next week?", open: "44%", reply: "11%" },
  ];
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">{i + 1}</div>
            {i < steps.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent my-1" />}
          </div>
          <div className="flex-1 rounded-xl bg-card border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{s.day}</span>
                <span className="text-sm font-semibold">{s.title}</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{s.body}</p>
            <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
              <span>Open <b className="text-foreground">{s.open}</b></span>
              <span>Reply <b className="text-success">{s.reply}</b></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Inbox / unified inbox
export function InboxVisual() {
  const threads = [
    { name: "Sarah Chen", company: "Helios", preview: "Yes — let's grab 20 min Thursday", time: "2m", unread: true, intent: "positive" },
    { name: "Marcus Webb", company: "Quanta", preview: "Send the deck and I'll circulate.", time: "14m", unread: true, intent: "positive" },
    { name: "Priya Patel", company: "Lumen", preview: "Not the right time — try Q1.", time: "1h", unread: false, intent: "neutral" },
    { name: "David Park", company: "Acme", preview: "Unsubscribe please.", time: "3h", unread: false, intent: "negative" },
  ];
  const intentColor = { positive: "bg-success", neutral: "bg-warning", negative: "bg-destructive" };
  return (
    <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Inbox className="w-4 h-4 text-primary" /> Unified inbox
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">2 new</span>
        </div>
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      {threads.map((t, i) => (
        <div key={i} className={`px-5 py-3 border-b border-border last:border-0 flex items-start gap-3 ${t.unread ? "bg-primary/5" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {t.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate">{t.name}</span>
              <span className="text-[10px] text-muted-foreground">· {t.company}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${intentColor[t.intent as keyof typeof intentColor]}`} />
              <span className="ml-auto text-[10px] text-muted-foreground">{t.time}</span>
            </div>
            <p className={`text-xs mt-0.5 truncate ${t.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>{t.preview}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Pipeline kanban
export function PipelineVisual() {
  const cols = [
    { title: "Replied", count: 24, color: "bg-primary", deals: [{ n: "Helios", v: "$12k" }, { n: "Quanta", v: "$8k" }] },
    { title: "Meeting", count: 11, color: "bg-primary", deals: [{ n: "Northwind", v: "$24k" }] },
    { title: "Won", count: 6, color: "bg-success", deals: [{ n: "Lumen", v: "$32k" }] },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map((c) => (
        <div key={c.title} className="rounded-xl bg-muted/40 border border-border p-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${c.color}`} />
              <span className="text-[11px] font-semibold">{c.title}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{c.count}</span>
          </div>
          <div className="space-y-1.5">
            {c.deals.map((d) => (
              <div key={d.n} className="rounded-lg bg-card border border-border p-2 shadow-sm">
                <div className="text-[11px] font-semibold truncate">{d.n}</div>
                <div className="text-[10px] text-success font-mono mt-0.5">{d.v}</div>
              </div>
            ))}
            <div className="rounded-lg border border-dashed border-border p-1.5 flex items-center justify-center text-muted-foreground">
              <Plus className="w-3 h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Analytics chart
export function AnalyticsVisual() {
  const data = [
    { day: "Mon", sent: 60, replies: 8 },
    { day: "Tue", sent: 85, replies: 14 },
    { day: "Wed", sent: 72, replies: 11 },
    { day: "Thu", sent: 95, replies: 21 },
    { day: "Fri", sent: 88, replies: 18 },
    { day: "Sat", sent: 30, replies: 4 },
    { day: "Sun", sent: 25, replies: 3 },
  ];
  const max = Math.max(...data.map(d => d.sent));
  return (
    <div className="rounded-2xl bg-card border border-border shadow-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground">This week</div>
          <div className="text-2xl font-bold mt-0.5">455 sent · 79 replies</div>
          <div className="flex items-center gap-1 text-xs text-success mt-1">
            <TrendingUp className="w-3 h-3" /> 17.3% reply rate · ↑ 4.2%
          </div>
        </div>
        <div className="flex gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary" /> Sent</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-success" /> Replies</span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-32">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-24">
              <div className="flex-1 rounded-t bg-gradient-to-t from-primary/70 to-primary" style={{ height: `${(d.sent / max) * 100}%` }} />
              <div className="flex-1 rounded-t bg-gradient-to-t from-success/70 to-success" style={{ height: `${(d.replies / max) * 100}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI compose visual
export function AIComposeVisual() {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">AI Copilot</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success">Generating...</span>
      </div>
      <div className="p-5 space-y-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Prompt</div>
        <div className="text-sm bg-muted/40 rounded-lg p-3 border border-border">
          Write a 3-step sequence for SaaS founders, focused on outbound efficiency.
        </div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Generated</div>
        <div className="space-y-2">
          {["Subject: A 30-second test for {{company}}'s outbound", "Subject: Saw {{firstName}}'s post — quick thought", "Subject: Final note · making outbound less manual"].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-card border border-border rounded-lg px-3 py-2">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{s}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
