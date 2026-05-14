import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Mail, Flame, Bot, Users, BarChart3, Shield, KanbanSquare, Inbox,
  Globe, Workflow, Calendar, Webhook, ArrowRight, Send, Zap, Target,
  CheckCircle2,
} from "lucide-react";
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
    eyebrow: "01 / Sending",
    title: "Send at scale without burning domains.",
    desc: "Unlimited inboxes, smart rotation, per-inbox caps, randomized delays, sending windows by timezone, and auto-pause on bounce spikes — all configured and running in minutes.",
    items: [
      { icon: Mail, label: "Unlimited mailboxes", desc: "Google, Microsoft, or SMTP — connect as many as you need." },
      { icon: Flame, label: "Conversation warmup", desc: "Human-like warmup that builds real sender reputation." },
      { icon: Send, label: "Smart rotation", desc: "Spread sends across inboxes with randomized delays." },
      { icon: Shield, label: "Deliverability suite", desc: "SPF/DKIM/DMARC checks, bounce management, suppression lists." },
    ],
  },
  {
    eyebrow: "02 / Intelligence",
    title: "AI that writes, replies, and routes.",
    desc: "Copilot drafts entire sequences in your voice. Reply Agent qualifies and responds to inbound. Personalization at the first-line level — not just variable substitution.",
    items: [
      { icon: Bot, label: "AI Copilot", desc: "Write full sequences from a single prompt." },
      { icon: Zap, label: "Reply Agent", desc: "AI that qualifies and drafts responses to every reply." },
      { icon: Target, label: "Personalization", desc: "First-line personalization tailored to each prospect." },
      { icon: Workflow, label: "Subsequences", desc: "Branch on opens, clicks, and replies automatically." },
    ],
  },
  {
    eyebrow: "03 / Pipeline",
    title: "From cold reply to closed deal.",
    desc: "Unified inbox sorts replies by intent. Positive replies auto-create deals on a kanban board. Schedule meetings without ever leaving the thread.",
    items: [
      { icon: Inbox, label: "Unified inbox", desc: "Every reply from every account in one feed, sorted by intent." },
      { icon: KanbanSquare, label: "Pipeline & deals", desc: "Kanban board with auto-deal creation from positive replies." },
      { icon: Calendar, label: "Native scheduler", desc: "Book meetings straight into Google or Outlook." },
      { icon: Users, label: "Team workspaces", desc: "Roles, shared campaigns, per-user mailbox assignment." },
    ],
  },
  {
    eyebrow: "04 / Data & Ops",
    title: "Operate with signal, not vibes.",
    desc: "Real-time analytics sliced by mailbox, campaign, and step. Visitor identification shows who hits your site after receiving a cold email. Webhooks and full REST API for your stack.",
    items: [
      { icon: BarChart3, label: "Real-time analytics", desc: "Sends, opens, clicks, replies, and meetings in one dashboard." },
      { icon: Globe, label: "Visitor tracking", desc: "Know which prospects visit your site after an email." },
      { icon: Webhook, label: "Webhooks & API", desc: "Push events anywhere. Full REST API on Scale plans." },
      { icon: Shield, label: "Suppressions & compliance", desc: "Opt-out management and compliance-ready suppression lists." },
    ],
  },
];

function FeaturesPage() {
  const navigate = useNavigate();
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-6 pt-20 md:pt-28 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 hero-spotlight" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-mono uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-primary/80">Replace 6 tools with one stack</span>
          </div>
          <h1 className="text-display">
            One platform.<br />
            <span className="text-gradient">Every outbound step.</span>
          </h1>
          <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From the first cold email to the booked demo — without ten different SaaS subscriptions duct-taped together.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-6xl mx-auto px-6 pb-16 space-y-5">
        {pillars.map((p, idx) => (
          <div
            key={p.eyebrow}
            className="bg-card border border-border rounded-3xl p-8 md:p-12 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start hover:border-primary/30 transition-colors"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-4">
                <span className="w-4 h-px bg-primary" />
                {p.eyebrow}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">{p.title}</h2>
              <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-lg">{p.desc}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {p.items.map((it) => (
                <div
                  key={it.label}
                  className="bg-background border border-border rounded-2xl p-5 group hover:border-primary/40 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow transition-all">
                    <it.icon className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-semibold mb-1">{it.label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{it.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Included checklist */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Everything included.</h2>
          <p className="mt-3 text-muted-foreground">No add-on tax. No feature tiers that hide the good stuff.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "Unlimited mailboxes on every paid plan",
            "Free conversation warmup network",
            "AI Copilot for sequences (unlimited on Growth+)",
            "AI Reply Agent for incoming replies",
            "Unified inbox with intent sorting",
            "Built-in pipeline & deal management",
            "Lead database + CSV import",
            "Native meeting scheduler",
            "Visitor identification pixel",
            "Webhooks & REST API (Scale+)",
            "Team seats & role management",
            "Suppression list & compliance tools",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl text-sm">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3 text-primary" />
              </div>
              <span className="font-medium">{f}</span>
            </div>
          ))}
        </div>
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
        <p className="mt-4 text-muted-foreground text-lg">Start free. First send in five minutes. No credit card required.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="rounded-full h-12 px-7 shadow-glow group" onClick={() => navigate({ to: "/login" })}>
            Try it free <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </Button>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-2">
              See pricing
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
