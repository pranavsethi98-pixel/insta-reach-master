import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Flame, Shield, CheckCircle2, X, Globe, Webhook, Calendar, Users, Quote, Download, Lock, Zap, Target, Inbox, Bot, Plus, Minus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketingLayout } from "@/components/MarketingLayout";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { MailboxRotationVisual, SequenceVisual, InboxVisual, PipelineVisual, AnalyticsVisual, AIComposeVisual } from "@/components/marketing/FeatureShowcase";
import { captureLead } from "@/lib/marketing-leads.functions";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "EmailSend.ai — Cold email infrastructure that delivers" },
      { name: "description", content: "Unlimited inboxes, automatic warmup, AI-personalized sequences, and a unified reply inbox. Built for agencies and outbound teams that send for a living." },
      { property: "og:title", content: "EmailSend.ai — Cold email infrastructure that delivers" },
      { property: "og:description", content: "Unlimited inboxes, automatic warmup, AI sequences, unified reply inbox. The infrastructure cold outbound teams actually need." },
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
      {/* ─────────── HERO ─────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: copy column */}
          <div className="lg:col-span-7 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface-1 text-[11px] font-mono uppercase tracking-widest mb-7">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-success" />
              </span>
              <span className="text-muted-foreground">v2.0 · public beta</span>
              <span className="text-border">·</span>
              <span className="text-foreground/80">12M+ sends / mo</span>
            </div>

            <h1 className="text-display">
              Cold email<br />
              infrastructure<br />
              that <span className="text-gradient">delivers.</span>
            </h1>

            <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Unlimited inboxes. Automatic warmup. AI sequences. One feed for every reply. Built for operators who send for a living — not marketers who play at it.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full text-base h-12 px-7 shadow-glow group" onClick={() => navigate({ to: "/login" })}>
                Start free <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base h-12 px-7 surface-1 text-white" asChild>
                <a href="#playbook"><Download className="w-4 h-4 mr-1.5" /> Free playbook</a>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Unlimited mailboxes</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Free warmup forever</span>
            </div>

            {/* Side meta rail under hero */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl border-t border-border/60 pt-7">
              {[
                { k: "99.2%", l: "Inbox placement" },
                { k: "<5 min", l: "Time to first send" },
                { k: "38%", l: "Avg reply rate" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-extrabold tracking-tight text-foreground">{s.k}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div className="lg:col-span-5 relative float-slow">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ─────────── MARQUEE PROOF BAR ─────────── */}
      <section className="border-y border-border/60 py-7 bg-card/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-5 font-mono">Powering outbound for teams that ship</p>
          <div className="marquee">
            <div className="marquee-track">
              {["Northwind", "Acme Co", "Helios", "Quanta", "Lumen", "Vertex", "Atlas", "Forge", "Nimbus", "Orbital"].map((b) => (
                <div key={b} className="text-2xl font-extrabold tracking-tight text-muted-foreground/50 hover:text-foreground transition-colors whitespace-nowrap">{b}</div>
              ))}
            </div>
            <div className="marquee-track" aria-hidden>
              {["Northwind", "Acme Co", "Helios", "Quanta", "Lumen", "Vertex", "Atlas", "Forge", "Nimbus", "Orbital"].map((b) => (
                <div key={b + "2"} className="text-2xl font-extrabold tracking-tight text-muted-foreground/50 whitespace-nowrap">{b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── MANIFESTO ─────────── */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-8">
        <div className="text-eyebrow mb-6 text-center">A short manifesto</div>
        <p className="text-center text-2xl md:text-4xl font-extrabold tracking-tight leading-[1.15] max-w-4xl mx-auto">
          We don't believe in <span className="text-muted-foreground/50 line-through decoration-destructive/50">credit packs</span>, <span className="text-muted-foreground/50 line-through decoration-destructive/50">per-mailbox tax</span>, or <span className="text-muted-foreground/50 line-through decoration-destructive/50">warmup that quietly burns your domain</span>.
          <br className="hidden md:block" />
          We believe in <span className="text-gradient">replies per send</span> — and building the stack that gets you more of them.
        </p>
      </section>

      <div className="pt-12" />



      {/* ─────────── PROBLEM ─────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">The cold email tax</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Stop paying $400/mo for tools that <span className="text-primary">throttle you.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Per-mailbox pricing. Hidden warmup limits. Reply detection that misses half your wins. The category is broken — we rebuilt it.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { p: "Per-inbox pricing", s: "Unlimited inboxes — every plan, every tier." },
            { p: "Warmup that hurts you", s: "Conversation-style warmup tuned for real engagement signals." },
            { p: "Replies in 8 dashboards", s: "One unified inbox. Every account. Sorted by intent." },
          ].map((x) => (
            <div key={x.p} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <X className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground line-through">{x.p}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span className="font-semibold">{x.s}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl surface-1 p-1 shadow-soft overflow-hidden">
          <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />
          <div className="relative grid md:grid-cols-4 gap-px bg-border/60 rounded-[22px] overflow-hidden">
            {[
              { n: "12M+", l: "Emails sent / month" },
              { n: "38%", l: "Avg reply rate" },
              { n: "99.2%", l: "Inbox placement" },
              { n: "< 5 min", l: "Time to first send" },
            ].map((s) => (
              <div key={s.l} className="bg-card/90 backdrop-blur p-9 text-center">
                <div className="text-5xl md:text-6xl font-extrabold tracking-tight text-gradient">{s.n}</div>
                <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground font-mono">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── SECTION HEADER ─────────── */}
      <section className="max-w-3xl mx-auto px-6 text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-semibold mb-4">
          <Zap className="w-3 h-3 text-primary" /> Everything in one workspace
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Replace 6 tools with <span className="text-primary">one stack.</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">From the first send to the booked meeting — no duct tape, no missing pieces.</p>
      </section>

      {/* ─────────── FEATURE BLOCKS ─────────── */}
      <FeatureBlock eyebrow="Sending infrastructure" title="Unlimited inboxes. Smart rotation."
        desc="Connect Google, Microsoft, or any SMTP. EmailSend rotates sends across your inboxes with daily caps and randomized delays. Scale without burning a single domain."
        bullets={["Connect a mailbox in 30 seconds", "Per-inbox daily caps", "Sending windows by timezone", "Auto-pause on bounce spikes"]}
        visual={<MailboxRotationVisual />} />

      <FeatureBlock reverse eyebrow="AI Copilot" title="A campaign in 30 seconds."
        desc="Describe your ICP and offer. The Copilot writes the full sequence — subject lines, opens, follow-ups, breakup emails — in your voice. Launch-ready."
        bullets={["Trained on millions of replied emails", "First-line personalization at scale", "AI Reply Agent drafts every response", "Spam-word linter built in"]}
        visual={<AIComposeVisual />} />

      <FeatureBlock eyebrow="Sequences" title="Multi-step flows that actually convert."
        desc="A clean step builder. Branch on opens, clicks, and replies. Spintax and merge tags keep every send unique. A/B test anything."
        bullets={["Drag-and-drop step builder", "Conditional branching", "Spintax + dynamic variables", "A/B test subjects and bodies"]}
        visual={<SequenceVisual />} />

      <FeatureBlock reverse eyebrow="Unified inbox" title="Every reply, in one feed."
        desc="Stop juggling 8 inboxes. Every reply across every mailbox in a single place — sorted by intent so positives bubble to the top."
        bullets={["Cross-mailbox unified inbox", "Auto-categorized by intent", "Reply from any sender", "Out-of-office detection"]}
        visual={<InboxVisual />} />

      <FeatureBlock eyebrow="Pipeline" title="From cold email to closed deal."
        desc="Positive replies auto-create deals. Drag through stages, log notes, forecast revenue. The CRM that lives where your pipeline is born."
        bullets={["Auto-create deals from replies", "Custom stages and fields", "Forecast by stage value", "Notes, tasks, and reminders"]}
        visual={<PipelineVisual />} />

      <FeatureBlock reverse eyebrow="Analytics" title="Know exactly what's working."
        desc="Sends, opens, clicks, replies, and meetings — sliced by mailbox, campaign, and step. Spot what to scale and what to kill."
        bullets={["Real-time dashboards", "Cohort and funnel views", "Per-step performance", "Export to CSV or webhook"]}
        visual={<AnalyticsVisual />} />

      {/* ─────────── BENTO ─────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">And a whole lot more.</h2>
          <p className="mt-3 text-muted-foreground">Every feature a serious outbound team needs.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Flame, title: "Free warmup network", desc: "Conversation-style warmup that builds and protects sender reputation." },
            { icon: Shield, title: "Deliverability suite", desc: "SPF / DKIM / DMARC checks, spam-word linter, suppression lists." },
            { icon: Calendar, title: "Built-in meetings", desc: "Native scheduler that books straight into Google or Outlook calendars." },
            { icon: Globe, title: "Visitor identification", desc: "Know which prospects visit your site — with optional reverse-IP enrichment." },
            { icon: Webhook, title: "Webhooks & REST API", desc: "Push events to your CRM, Slack, or anywhere. Full API included." },
            { icon: Users, title: "Team workspaces", desc: "Roles, shared campaigns, mailbox-by-user assignment." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/60 transition-all">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── COMPARISON ─────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">vs. the others</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Why teams switch from <span className="text-muted-foreground line-through decoration-destructive/60">Instantly</span> & <span className="text-muted-foreground line-through decoration-destructive/60">Smartlead</span>.
          </h2>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 text-xs uppercase tracking-widest font-bold border-b border-border bg-muted/30">
            <div className="p-4">Feature</div>
            <div className="p-4 text-center text-primary">EmailSend</div>
            <div className="p-4 text-center text-muted-foreground">Instantly</div>
            <div className="p-4 text-center text-muted-foreground">Smartlead</div>
          </div>
          {[
            { f: "Unlimited inboxes (all plans)", e: true, i: false, s: false },
            { f: "Free conversation warmup", e: true, i: false, s: true },
            { f: "AI Copilot for full sequences", e: true, i: true, s: false },
            { f: "Unified reply inbox + intent sorting", e: true, i: true, s: true },
            { f: "Built-in pipeline / CRM", e: true, i: false, s: false },
            { f: "Lead database + verification", e: true, i: true, s: false },
            { f: "Visitor identification pixel", e: true, i: false, s: false },
            { f: "Transparent flat pricing", e: true, i: false, s: false },
          ].map((r, i) => (
            <div key={i} className={`grid grid-cols-4 text-sm border-b border-border/60 last:border-0 ${i % 2 ? "bg-muted/10" : ""}`}>
              <div className="p-4 font-medium">{r.f}</div>
              <Cell on={r.e} primary />
              <Cell on={r.i} />
              <Cell on={r.s} />
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── LEAD MAGNET ─────────── */}
      <LeadMagnet />

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Operators trust the stack.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { q: "We replaced 4 tools with EmailSend. Reply rate jumped 2.3x in the first month, and our domain health is the best it's ever been.", n: "Sarah Chen", r: "Head of Growth, Helios" },
            { q: "The warmup is the real deal. We're sending 5x more without a single placement issue. Worth it for that alone.", n: "Marcus Webb", r: "Founder, Quanta" },
            { q: "Setup was 10 minutes. The Copilot writes better subject lines than my team. Honestly the future of outbound.", n: "Priya Patel", r: "VP Sales, Lumen" },
          ].map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 flex flex-col">
              <Quote className="w-6 h-6 text-primary/40 mb-3" />
              <p className="text-sm leading-relaxed flex-1">"{t.q}"</p>
              <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">{t.n[0]}</div>
                <div>
                  <div className="text-sm font-semibold">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── FAQ ─────────── */}
      <FAQ />

      {/* ─────────── BLOG PREVIEW ─────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">From the blog</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Read before you send.</h2>
          </div>
          <Link to="/blog/" className="hidden md:flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
            All posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {BLOG_POSTS.filter((p) => p.featured).slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-primary">{post.category}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min</span>
              </div>
              <h3 className="font-bold text-base leading-snug flex-1 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">{post.description}</p>
              <div className="mt-4 text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Read <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link to="/blog/" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
            See all posts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ─────────── FINAL CTA ─────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl bg-primary p-12 md:p-16 text-primary-foreground overflow-hidden text-center">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Start filling your pipeline today.</h2>
            <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">First send in under 5 minutes. No credit card. Cancel any time.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="rounded-full h-12 px-7 bg-white text-primary hover:bg-white/90" onClick={() => navigate({ to: "/login" })}>
                Get started free <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />
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

function Cell({ on, primary }: { on: boolean; primary?: boolean }) {
  return (
    <div className="p-4 flex items-center justify-center">
      {on ? (
        <CheckCircle2 className={`w-5 h-5 ${primary ? "text-primary" : "text-success"}`} />
      ) : (
        <X className="w-5 h-5 text-muted-foreground/40" />
      )}
    </div>
  );
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

function LeadMagnet() {
  const submit = useServerFn(captureLead);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    setErrorMsg(null);
    try {
      await submit({ data: { email, source: "landing_playbook" } });
      setState("done");
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong");
      setState("error");
    }
  };

  return (
    <section id="playbook" className="max-w-6xl mx-auto px-6 pb-24 scroll-mt-24">
      <div className="grid lg:grid-cols-5 gap-0 rounded-3xl border border-border bg-card overflow-hidden">
        {/* Left: copy + form */}
        <div className="lg:col-span-3 p-8 md:p-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Download className="w-3 h-3" /> Free playbook
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            The Cold Email Deliverability <span className="text-primary">Playbook.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            42 pages. Zero fluff. Everything we learned sending 12M+ cold emails — domain setup, SPF/DKIM/DMARC, warmup tuning, sending windows, and the exact send patterns that hit inboxes in 2026.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            {[
              "DNS-record templates for Google, Microsoft, and SMTP",
              "Warmup ramp curve (week 1 → week 6)",
              "Spam trigger checklist + 200 words to avoid",
              "Send-window heatmap by timezone",
              "Reply-rate benchmark by industry",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {state === "done" ? (
            <div className="mt-8 rounded-xl border border-success/40 bg-success/10 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">Check your inbox.</div>
                <div className="text-sm text-muted-foreground">The playbook is on its way to <span className="font-mono">{email}</span>.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base bg-background"
                aria-label="Work email"
              />
              <Button type="submit" disabled={state === "loading"} size="lg" className="h-12 px-6 rounded-md whitespace-nowrap">
                {state === "loading" ? "Sending…" : <>Send me the playbook <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} /></>}
              </Button>
            </form>
          )}
          {state === "error" && (
            <div className="mt-3 text-sm text-destructive">{errorMsg}</div>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" /> No spam. Unsubscribe anytime. We never share your email.
          </div>
        </div>

        {/* Right: stylized "book" */}
        <div className="lg:col-span-2 relative bg-background border-l border-border flex items-center justify-center p-8 min-h-[300px]">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, var(--color-primary) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative w-48 md:w-56 aspect-[3/4] rounded-lg bg-card border border-border shadow-2xl rotate-[-4deg] hover:rotate-0 transition-transform duration-500">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
            <div className="relative h-full p-5 flex flex-col">
              <div className="text-[10px] font-mono text-muted-foreground">EMAILSEND.AI · 2026 ED.</div>
              <div className="mt-4 text-xs uppercase tracking-widest text-primary font-bold">Playbook</div>
              <div className="mt-1 text-xl font-extrabold leading-tight">Cold Email Deliverability</div>
              <div className="mt-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Inbox className="w-3 h-3" /> 42 pages · PDF
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Do I need to bring my own email accounts?", a: "Yes — you connect your own Google, Microsoft, or SMTP mailboxes. EmailSend never sends through shared infrastructure, which is why deliverability stays in your control." },
    { q: "How is pricing structured?", a: "Flat monthly plans based on email volume and contacts. Unlimited inboxes on every plan. No per-user, per-mailbox, or per-warmup fees. See the pricing page for details." },
    { q: "Will this damage my domain reputation?", a: "The opposite. Built-in conversation-style warmup, randomized sending delays, per-inbox caps, and auto-pause on bounce spikes are all designed to protect your sender reputation." },
    { q: "Can I import from Instantly or Smartlead?", a: "Yes. CSV imports for leads and campaigns work out of the box. Most teams migrate in under an hour." },
    { q: "Do AI features cost extra?", a: "AI Copilot, Reply Agent, and personalization run on a credit system included with paid plans. You can also bring your own OpenAI or Anthropic key with zero markup." },
    { q: "Is there a free trial?", a: "Yes — start free, no credit card. The free tier includes one connected mailbox, free warmup, and the full Copilot." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="max-w-3xl mx-auto px-6 pb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Questions, answered.</h2>
      </div>
      <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left flex items-center justify-between gap-4 p-5 hover:bg-muted/30 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold">{item.q}</span>
                {isOpen ? <Minus className="w-4 h-4 text-primary shrink-0" /> : <Plus className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
