import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Mail, Users, BarChart3, Flame, Bot, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";
import { HeroVisual } from "@/components/marketing/HeroVisual";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Outreachly — Cold email outreach that lands in inboxes" },
      { name: "description", content: "Send cold email at scale across unlimited mailboxes. Built-in warmup, AI personalization, and reply detection. The modern alternative to Instantly." },
      { property: "og:title", content: "Outreachly — Cold email outreach that lands in inboxes" },
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
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            New · AI Reply Agent in beta
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Cold email that <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">actually lands.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Connect unlimited mailboxes, warm them up automatically, and send AI-personalized sequences that get real replies — not spam folder views.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full" onClick={() => navigate({ to: "/login" })}>
              Start free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" onClick={() => navigate({ to: "/features" })}>
              See features
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Unlimited mailboxes</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Free warmup</span>
          </div>
        </div>
        <HeroVisual />
      </section>

      {/* Logos / social proof */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by outbound teams at</p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 opacity-60">
          {["Northwind", "Acme Co", "Helios", "Vercel-ish", "Quanta", "Lumen"].map((b) => (
            <div key={b} className="text-lg font-semibold tracking-tight text-muted-foreground">{b}</div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need to scale outbound</h2>
          <p className="mt-3 text-muted-foreground">From the first send to the booked meeting — all in one workspace.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Mail, title: "Unlimited mailboxes", desc: "Connect SMTP, Google, or Microsoft inboxes. Rotate sends with daily caps and randomized delays." },
            { icon: Flame, title: "Built-in warmup", desc: "Free, automatic warmup network keeps your sender reputation healthy from day one." },
            { icon: Bot, title: "AI personalization", desc: "Generate first lines, full sequences, and replies that sound like you wrote them by hand." },
            { icon: Users, title: "Smart sequencing", desc: "Multi-step drips, spintax variants, dynamic merge tags, and conditional branching." },
            { icon: BarChart3, title: "Real-time analytics", desc: "Track opens, clicks, replies, and meetings booked across every mailbox and campaign." },
            { icon: Shield, title: "Deliverability tools", desc: "SPF / DKIM / DMARC checks, spam-word linter, suppression lists, and unsubscribe handling." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-[0_20px_40px_-20px_rgba(80,40,180,0.25)] hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-fuchsia-500 p-10 text-primary-foreground">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { n: "12M+", l: "Emails sent monthly" },
              { n: "38%", l: "Avg. reply rate" },
              { n: "99.2%", l: "Inbox placement" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-5xl font-extrabold tracking-tight">{s.n}</div>
                <div className="mt-2 text-sm opacity-80">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to fill your pipeline?</h2>
        <p className="mt-3 text-muted-foreground">Start sending in under 5 minutes. No credit card required.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" className="rounded-full" onClick={() => navigate({ to: "/login" })}>
            Get started free <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="rounded-full">View pricing</Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
