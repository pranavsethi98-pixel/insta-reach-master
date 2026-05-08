import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Mail, Flame, Bot, Users, BarChart3, Shield, KanbanSquare, Inbox, Globe, Workflow, Calendar, Webhook, ArrowRight, Send, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Features — EmailSend.ai" },
      { name: "description", content: "Unlimited mailboxes, warmup, AI personalization, sequences, deliverability, unified inbox, pipeline, and more — in one workspace." },
      { property: "og:title", content: "Features — EmailSend.ai" },
      { property: "og:description", content: "Everything you need to run cold outbound — in one clean stack." },
    ],
  }),
});

const pillars = [
  {
    eyebrow: "Sending",
    title: "Send at scale without burning domains.",
    desc: "Unlimited inboxes, smart rotation, per-inbox caps, randomized delays, sending windows by timezone, and auto-pause on bounce spikes.",
    items: [
      { icon: Mail, label: "Unlimited mailboxes" },
      { icon: Flame, label: "Conversation warmup" },
      { icon: Send, label: "Smart rotation" },
      { icon: Shield, label: "Deliverability suite" },
    ],
  },
  {
    eyebrow: "Intelligence",
    title: "AI that writes, replies, and routes.",
    desc: "Copilot drafts entire sequences in your voice. Reply Agent qualifies and responds to inbound. Personalization at the line level — not the variable level.",
    items: [
      { icon: Bot, label: "AI Copilot" },
      { icon: Zap, label: "Reply Agent" },
      { icon: Target, label: "First-line personalization" },
      { icon: Workflow, label: "Subsequence branching" },
    ],
  },
  {
    eyebrow: "Pipeline",
    title: "From cold reply to closed deal.",
    desc: "Unified inbox sorts replies by intent. Positives auto-create deals on a kanban pipeline. Schedule meetings without leaving the thread.",
    items: [
      { icon: Inbox, label: "Unified inbox" },
      { icon: KanbanSquare, label: "Pipeline & deals" },
      { icon: Calendar, label: "Native scheduler" },
      { icon: Users, label: "Team workspaces" },
    ],
  },
  {
    eyebrow: "Data & Ops",
    title: "Operate with signal, not vibes.",
    desc: "Real-time analytics across mailbox / campaign / step. Visitor identification. Webhooks and a full REST API to push events anywhere.",
    items: [
      { icon: BarChart3, label: "Real-time analytics" },
      { icon: Globe, label: "Visitor tracking" },
      { icon: Webhook, label: "Webhooks & REST API" },
      { icon: Shield, label: "Suppressions & compliance" },
    ],
  },
];

function FeaturesPage() {
  const navigate = useNavigate();
  return (
    <MarketingLayout>
      <section className="relative max-w-5xl mx-auto px-6 pt-20 md:pt-28 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface-1 text-[11px] font-mono uppercase tracking-widest mb-6">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-muted-foreground">Replace 6 tools with one stack</span>
        </div>
        <h1 className="text-display">
          One platform.<br />
          <span className="text-gradient">Every outbound step.</span>
        </h1>
        <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          From the first cold email to the booked demo — without ten different SaaS subscriptions duct-taped together.
        </p>
      </section>

      {/* Pillars */}
      <section className="max-w-6xl mx-auto px-6 pb-16 space-y-6">
        {pillars.map((p, idx) => (
          <div
            key={p.eyebrow}
            className="surface-1 rounded-3xl p-8 md:p-12 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center hover:border-primary/30 transition-colors"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-eyebrow">{p.eyebrow}</span>
                <span className="font-mono text-xs text-muted-foreground/60">0{idx + 1} / 04</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.05]">{p.title}</h2>
              <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-lg">{p.desc}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {p.items.map((it) => (
                <div key={it.label} className="surface-2 rounded-2xl p-5 group hover:border-primary/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow transition-all">
                    <it.icon className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold">{it.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Stats band */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl surface-1 p-1">
          <div className="grid md:grid-cols-3 gap-px bg-border/60 rounded-[22px] overflow-hidden">
            {[
              { n: "30+", l: "Built-in features" },
              { n: "0", l: "Bolted-on tools needed" },
              { n: "1", l: "Bill, every month" },
            ].map((s) => (
              <div key={s.l} className="bg-card/90 p-9 text-center">
                <div className="text-5xl font-extrabold tracking-tight text-gradient">{s.n}</div>
                <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground font-mono">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Less stack. More pipeline.</h3>
        <p className="mt-4 text-muted-foreground">Start free. First send in five minutes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="rounded-full h-12 px-7 shadow-glow group" onClick={() => navigate({ to: "/login" })}>
            Try it free <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Button>
          <Link to="/pricing"><Button size="lg" variant="outline" className="rounded-full h-12 px-7 surface-1">See pricing</Button></Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
