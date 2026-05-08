import { createFileRoute } from "@tanstack/react-router";
import { LeadMagnetLanding } from "@/components/marketing/LeadMagnetLanding";

export const Route = createFileRoute("/reply-rate-formula")({
  component: Page,
  head: () => ({
    meta: [
      { title: "The Reply Rate Formula — Free PDF | EmailSend.ai" },
      { name: "description", content: "The math behind cold emails that actually get responses. Subject lines, opening lines, CTAs, and the hidden variables most operators ignore." },
      { property: "og:title", content: "The Reply Rate Formula — Free PDF" },
      { property: "og:description", content: "The math behind cold emails that actually get replies." },
    ],
  }),
});

function Page() {
  return (
    <LeadMagnetLanding
      magnet={{
        slug: "reply-rate-formula",
        title: "The Reply Rate Formula.",
        subtitle: "Reply rate isn't luck — it's a formula. We broke it apart variable by variable so you can rebuild yours from the ground up.",
        badge: "Vol. 03",
        pages: 28,
        bullets: [
          "The 6-variable equation that predicts reply rate before you hit send",
          "Why a 2% reply rate means your list is wrong — not your copy",
          "The 'one ask' rule and why it doubles replies on average",
          "Benchmark tables: what 'good' looks like by industry, persona, and ACV",
        ],
        toc: [
          { num: "01", title: "The Formula", desc: "Reply rate = list × offer × copy × timing × deliverability × volume. We weight each one." },
          { num: "02", title: "List Quality, Quantified", desc: "How to score a list before you send. The 5 signals that predict bounce + reply." },
          { num: "03", title: "Offer Math", desc: "Why your CTA is the bottleneck — and the 4 CTA archetypes that convert." },
          { num: "04", title: "Copy Patterns That Print", desc: "Subject lines, openers, CTAs. With benchmarks and the templates behind them." },
          { num: "05", title: "Timing Windows", desc: "The send-time data nobody publishes. Hour, day, time-zone — what actually matters." },
          { num: "06", title: "Diagnosing a Dead Sequence", desc: "The 4-minute audit to find which variable is killing your reply rate." },
        ],
        testimonial: {
          quote: "I've been doing outbound for 8 years. This is the first time I've seen the formula written out plainly. Required reading for my team.",
          name: "Daniel Ortiz",
          role: "VP Sales, Quanta Labs",
        },
      }}
    />
  );
}
