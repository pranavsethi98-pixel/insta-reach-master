import { Mail, BarChart3, Users, CheckCircle2, Send, Inbox } from "lucide-react";

// Pure CSS/SVG hero visual — no AI art, no garbled text.
// Three floating glassmorphism cards over a gradient mesh.
export function HeroVisual() {
  return (
    <div className="relative w-full aspect-[5/4] max-w-[640px] mx-auto">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
        <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-400/40 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-60 h-60 rounded-full bg-fuchsia-300/30 blur-3xl" />
      </div>

      {/* Card 1 — Inbox */}
      <div className="absolute top-6 left-2 w-[58%] rounded-2xl bg-card/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-20px_rgba(80,40,180,0.35)] p-4 rotate-[-4deg]">
        <div className="flex items-center gap-2 mb-3">
          <Inbox className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">Inbox</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">12 new</span>
        </div>
        {[
          { n: "Sarah Chen", t: "Re: Quick question about pricing" },
          { n: "Marcus Webb", t: "Sounds good — let's schedule" },
          { n: "Priya Patel", t: "Interested, send more info" },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-fuchsia-400" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium truncate">{m.n}</div>
              <div className="text-[10px] text-muted-foreground truncate">{m.t}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Card 2 — Analytics */}
      <div className="absolute top-12 right-0 w-[48%] rounded-2xl bg-card/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-20px_rgba(80,40,180,0.35)] p-4 rotate-[3deg]">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">Reply rate</span>
        </div>
        <div className="text-2xl font-bold">38.2%</div>
        <div className="text-[10px] text-success mb-2">↑ 12% vs last week</div>
        <div className="flex items-end gap-1 h-12">
          {[40, 65, 50, 80, 70, 95, 88].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-fuchsia-400" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Card 3 — Send confirmation */}
      <div className="absolute bottom-4 left-12 w-[55%] rounded-2xl bg-card/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-20px_rgba(80,40,180,0.35)] p-4 rotate-[-2deg]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div>
            <div className="text-xs font-semibold">Campaign live</div>
            <div className="text-[10px] text-muted-foreground">Q4 outbound · 1,240 leads</div>
          </div>
        </div>
        <div className="flex gap-3 mt-2 text-[10px]">
          <div className="flex items-center gap-1"><Send className="w-3 h-3 text-primary" /> 8 mailboxes</div>
          <div className="flex items-center gap-1"><Users className="w-3 h-3 text-primary" /> Personalized</div>
          <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary" /> 3 steps</div>
        </div>
      </div>
    </div>
  );
}
