import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Flame, Shield, CheckCircle2, Star, Zap, Globe, Webhook, Calendar, Users, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { MailboxRotationVisual, SequenceVisual, InboxVisual, PipelineVisual, AnalyticsVisual, AIComposeVisual } from "@/components/marketing/FeatureShowcase";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "EmailSend — Cold email outreach that lands in inboxes" },
      { name: "description", content: "Send cold email at scale across unlimited mailboxes. Built-in warmup, AI personalization, and reply detection. The modern alternative to Instantly." },
      { property: "og:title", content: "EmailSend — Cold email outreach that lands in inboxes" },
      { property: "og:description", content: "Unlimited mailboxes, AI personalization, warmup, and reply detection — in one clean workspace." },
    ],
  }),
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium mb-6 shadow-sm">
            <Sparkle /> New · AI Reply Agent in beta
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
            Cold email that{" "}
            <span className="text-primary">actually lands.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
            Connect unlimited mailboxes. Warm them up automatically. Send AI-personalized sequences that get real replies — not spam folder views.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full text-base h-12 px-6 shadow-lg shadow-primary/30" onClick={() => navigate({ to: "/login" })}>
              Start free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full text-base h-12 px-6" onClick={() => navigate({ to: "/features" })}>
              See features
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Unlimited mailboxes</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Free warmup</span>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["from-primary to-primary", "from-primary to-primary", "from-primary to-primary", "from-primary to-primary", "from-primary to-primary"].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} border-2 border-background`} />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">4.9 from 2,400+ teams</div>
            </div>
          </div>
        </div>
        <HeroVisual />
      </section>

      {/* Logos */}
      <section className="max-w-5xl mx-auto px-6 pb-24 border-y border-border py-10">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by outbound teams at</p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
          {["Northwind", "Acme Co", "Helios", "Quanta", "Lumen", "Vertex"].map((b) => (
            <div key={b} className="text-xl font-bold tracking-tight text-muted-foreground/70 hover:text-foreground transition-colors">{b}</div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-4 gap-px bg-border rounded-3xl overflow-hidden">
          {[
            { n: "12M+", l: "Emails sent monthly" },
            { n: "38%", l: "Avg reply rate" },
            { n: "99.2%", l: "Inbox placement" },
            { n: "2,400+", l: "Active teams" },
          ].map((s) => (
            <div key={s.l} className="bg-card p-8 text-center">
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">{s.n}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section header */}
      <section className="max-w-3xl mx-auto px-6 text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4">
          <Zap className="w-3 h-3" /> Built for serious outbound
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Replace 6 tools with <span className="text-primary">one workspace.</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">From the first send to the booked meeting — everything you need, nothing you don't.</p>
      </section>

      {/* Alternating feature blocks */}
      <FeatureBlock
        eyebrow="Sending infrastructure"
        title="Unlimited mailboxes. Smart rotation."
        desc="Connect Google, Microsoft, or any SMTP. EmailSend automatically rotates sends across your inboxes with daily caps and randomized delays — so you scale without burning a single domain."
        bullets={["Connect mailboxes in 30 seconds", "Per-mailbox daily caps", "Smart sending windows by timezone", "Auto-pause on bounce spikes"]}
        visual={<MailboxRotationVisual />}
      />

      <FeatureBlock
        reverse
        eyebrow="AI Copilot"
        title="Write a campaign in 30 seconds."
        desc="Describe your ICP and offer. The Copilot writes the full sequence — subject lines, opens, follow-ups, breakup emails — in your voice, ready to send."
        bullets={["Trained on 10M+ replied emails", "First-line personalization at scale", "AI Reply Agent drafts responses for you", "Spam-word linter built in"]}
        visual={<AIComposeVisual />}
      />

      <FeatureBlock
        eyebrow="Sequences"
        title="Multi-step flows that actually convert."
        desc="Build branching sequences in a clean editor. Trigger different paths on opens, clicks, and replies. Use spintax and merge tags to keep every send unique."
        bullets={["Drag-and-drop step builder", "Conditional branching", "Spintax + dynamic variables", "A/B test subject lines and bodies"]}
        visual={<SequenceVisual />}
      />

      <FeatureBlock
        reverse
        eyebrow="Unified inbox"
        title="Every reply, in one place."
        desc="Stop juggling 8 inboxes. See every reply across every mailbox in a single feed — sorted by intent so positive responses bubble to the top."
        bullets={["Cross-mailbox inbox", "Auto-categorized by intent", "Reply from any sender address", "Out-of-office detection"]}
        visual={<InboxVisual />}
      />

      <FeatureBlock
        eyebrow="Pipeline"
        title="From cold email to closed deal."
        desc="When someone replies positive, they auto-move to your pipeline. Drag them through stages, log notes, and track every opportunity to revenue."
        bullets={["Auto-create deals from replies", "Custom stages and fields", "Forecast by stage value", "Notes, tasks, and reminders"]}
        visual={<PipelineVisual />}
      />

      <FeatureBlock
        reverse
        eyebrow="Analytics"
        title="Know exactly what's working."
        desc="Track sends, opens, clicks, replies, and meetings — per mailbox, per campaign, per step. Spot what to scale and what to kill."
        bullets={["Real-time dashboards", "Cohort and funnel views", "Per-step performance", "Export to CSV or webhook"]}
        visual={<AnalyticsVisual />}
      />

      {/* Bento grid for remaining features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">And a whole lot more.</h2>
          <p className="mt-3 text-muted-foreground">Every feature you'd expect from a modern outbound platform.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Flame, title: "Free warmup network", desc: "Conversation-style warmup that keeps your sender reputation strong from day one." },
            { icon: Shield, title: "Deliverability suite", desc: "SPF / DKIM / DMARC checks, spam-word linter, and suppression lists." },
            { icon: Calendar, title: "Built-in meetings", desc: "Native scheduler that books straight into Google or Outlook calendars." },
            { icon: Globe, title: "Visitor tracking", desc: "Know when prospects visit your site — with optional reverse-IP enrichment." },
            { icon: Webhook, title: "Webhooks & API", desc: "Push events to your CRM, Slack, or anywhere. Full REST API included." },
            { icon: Users, title: "Team workspaces", desc: "Invite teammates with roles, share campaigns, and split mailboxes by user." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary hover:shadow-[0_20px_40px_-20px_rgba(80,40,180,0.25)] hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by outbound teams.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { q: "We ditched 4 tools and replaced them with EmailSend. Reply rates jumped 2.3x in the first month.", n: "Sarah Chen", r: "Head of Growth, Helios" },
            { q: "The warmup is the real deal. Our domain reputation has never been healthier and we're sending 5x more.", n: "Marcus Webb", r: "Founder, Quanta" },
            { q: "Setup took 10 minutes. The AI Copilot writes better subject lines than my team. This is the future.", n: "Priya Patel", r: "VP Sales, Lumen" },
          ].map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 flex flex-col">
              <Quote className="w-6 h-6 text-primary/30 mb-3" />
              <p className="text-sm leading-relaxed flex-1">"{t.q}"</p>
              <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary" />
                <div>
                  <div className="text-sm font-semibold">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl bg-primary p-12 md:p-16 text-primary-foreground overflow-hidden text-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ready to fill your pipeline?</h2>
            <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">Start sending in under 5 minutes. No credit card. Cancel anytime.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Button size="lg" className="rounded-full h-12 px-7 bg-white text-primary hover:bg-white/90 shadow-xl" onClick={() => navigate({ to: "/login" })}>
                Get started free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">View pricing</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Sparkle() {
  return <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />;
}

function FeatureBlock({
  eyebrow, title, desc, bullets, visual, reverse,
}: { eyebrow: string; title: string; desc: string; bullets: string[]; visual: React.ReactNode; reverse?: boolean; }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
      <div className={reverse ? "lg:order-2" : ""}>
        <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{eyebrow}</div>
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h3>
        <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{desc}</p>
        <ul className="mt-6 space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
    </section>
  );
}
