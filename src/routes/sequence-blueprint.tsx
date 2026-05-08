import { createFileRoute } from "@tanstack/react-router";
import { LeadMagnetLanding } from "@/components/marketing/LeadMagnetLanding";

export const Route = createFileRoute("/sequence-blueprint")({
  component: Page,
  head: () => ({
    meta: [
      { title: "The Cold Email Sequence Blueprint — Free PDF | EmailSend.ai" },
      { name: "description", content: "The exact 5-touch sequence framework that books meetings on autopilot. Timing, copy patterns, follow-up cadence — pulled straight from 10M+ sends." },
      { property: "og:title", content: "The Cold Email Sequence Blueprint — Free PDF" },
      { property: "og:description", content: "Steal the 5-touch sequence that books meetings on autopilot." },
    ],
  }),
});

function Page() {
  return (
    <LeadMagnetLanding
      magnet={{
        slug: "sequence-blueprint",
        title: "The Cold Email Sequence Blueprint.",
        subtitle: "The 5-touch sequence framework that books meetings while you sleep — timing, copy, and cadence reverse-engineered from 10M+ sends.",
        badge: "Vol. 02",
        pages: 32,
        bullets: [
          "The exact day-by-day cadence (and why most teams send touch 2 way too early)",
          "5 subject-line templates with a 60%+ open rate baseline",
          "The 'pattern interrupt' opener Sabri Suby would steal if he wrote outbound",
          "Why touch #4 is where the meetings actually get booked — and how to write it",
        ],
        toc: [
          { num: "01", title: "Sequence Architecture 101", desc: "Why 5 touches, why this order, why this spacing. The math behind the pattern." },
          { num: "02", title: "Touch 1: The Hook", desc: "60-90 words. One ask. Three opener templates that print replies." },
          { num: "03", title: "Touch 2: The Bump", desc: "When to send it (hint: not the next day) and the 4-line script that lifts replies 30%." },
          { num: "04", title: "Touch 3: The Value Drop", desc: "How to give before you ask — and the asset library that makes this easy." },
          { num: "05", title: "Touch 4: The Booking Touch", desc: "The CTA that books most of your meetings. Most teams skip this entirely." },
          { num: "06", title: "Touch 5: The Breakup", desc: "The polite walk-away that gets a 'wait, don't go' reply 18% of the time." },
        ],
        testimonial: {
          quote: "Replaced our 8-touch frankenstein sequence with this. Booked 3x more meetings the first month.",
          name: "Priya Anand",
          role: "Founder, Helios Outbound",
        },
      }}
    />
  );
}
