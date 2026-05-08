import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mail, Flame, Bot, Users, BarChart3, Shield, KanbanSquare, Inbox, Globe, Workflow, Calendar, Webhook, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Features — EmailSend" },
      { name: "description", content: "Unlimited mailboxes, warmup, AI personalization, sequences, deliverability, inbox, pipeline, meetings, and more." },
      { property: "og:title", content: "Features — EmailSend" },
      { property: "og:description", content: "Everything you need to run cold email outbound — in one clean workspace." },
    ],
  }),
});

const features = [
  { icon: Mail, title: "Unlimited mailboxes", desc: "Connect SMTP, Google, Microsoft. Rotate sends, daily caps, randomized delays." },
  { icon: Flame, title: "Free warmup network", desc: "Automatic conversation-style warmup keeps your sender reputation strong." },
  { icon: Bot, title: "AI Copilot & Reply Agent", desc: "Generate sequences, first lines, and reply drafts in your voice." },
  { icon: Workflow, title: "Salesflows & subsequences", desc: "Branch on opens, clicks, replies. Trigger different paths automatically." },
  { icon: Users, title: "Lead management", desc: "Import CSVs, dedupe, enrich, and segment with custom fields." },
  { icon: KanbanSquare, title: "Pipeline & deals", desc: "Visual kanban board for every conversation that turns into an opportunity." },
  { icon: Inbox, title: "Unified inbox", desc: "Reply to every prospect from one place — across all your mailboxes." },
  { icon: Calendar, title: "Meetings", desc: "Built-in scheduling that books straight into your calendar." },
  { icon: BarChart3, title: "Analytics", desc: "Sends, opens, clicks, replies, and bookings — per mailbox, per campaign." },
  { icon: Shield, title: "Deliverability suite", desc: "SPF/DKIM/DMARC checks, spam-word linter, suppression lists, unsubscribes." },
  { icon: Globe, title: "Visitor tracking", desc: "Pixel that tells you when prospects visit your site." },
  { icon: Webhook, title: "Webhooks & API", desc: "Push events to your CRM, Slack, or anywhere else." },
];

function FeaturesPage() {
  const navigate = useNavigate();
  return (
    <MarketingLayout>
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          One platform. <span className="text-primary">Every outbound step.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          From the first cold email to the booked demo, EmailSend handles the entire flow without ten different tools duct-taped together.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-[0_20px_40px_-20px_oklch(0.55_0.22_263/0.35)] hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <Button size="lg" className="rounded-full" onClick={() => navigate({ to: "/login" })}>
          Try it free <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </section>
    </MarketingLayout>
  );
}
