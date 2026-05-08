import { createFileRoute } from "@tanstack/react-router";
import { LeadMagnetLanding } from "@/components/marketing/LeadMagnetLanding";

export const Route = createFileRoute("/47-templates")({
  component: Page,
  head: () => ({
    meta: [
      { title: "47 Cold Email Templates That Print Meetings — Free PDF | EmailSend.ai" },
      { name: "description", content: "47 plug-and-play cold email templates sorted by industry, persona, and use case. Copy, paste, personalize, send." },
      { property: "og:title", content: "47 Cold Email Templates That Print Meetings — Free PDF" },
      { property: "og:description", content: "47 battle-tested cold email templates. Copy, paste, send." },
    ],
  }),
});

function Page() {
  return (
    <LeadMagnetLanding
      magnet={{
        slug: "47-templates",
        title: "47 Cold Email Templates That Print Meetings.",
        subtitle: "Battle-tested templates sorted by industry, persona, and use case. Copy. Paste. Personalize. Send. That's the whole job.",
        badge: "Vol. 04",
        pages: 42,
        bullets: [
          "12 SaaS templates (founder → founder, AE → CTO, BDR → ops lead)",
          "8 agency templates that actually book discovery calls",
          "9 follow-up templates ranked by reply rate from our internal data",
          "6 'breakup' templates that wake up dead deals (one of them is shameless and it works)",
        ],
        toc: [
          { num: "01", title: "How to Use This Pack", desc: "Personalization framework. What to swap, what to leave, what to never edit." },
          { num: "02", title: "SaaS → SaaS (12 templates)", desc: "Founder, AE, and BDR sequences for selling software to other software companies." },
          { num: "03", title: "Agency Outbound (8 templates)", desc: "How to pitch services without sounding like every other agency in the inbox." },
          { num: "04", title: "Follow-ups, Ranked (9 templates)", desc: "Ordered by reply rate. The top one gets 31% on average." },
          { num: "05", title: "Breakup Emails (6 templates)", desc: "The walk-away that brings them back. Use sparingly — works every time." },
          { num: "06", title: "Niche Plays (12 templates)", desc: "Recruiting, partnerships, podcast pitches, founder intros, and 8 more." },
        ],
        testimonial: {
          quote: "I bookmarked half of these the first day. Template #23 alone has booked us 14 meetings this quarter.",
          name: "Sarah Whitman",
          role: "Outbound Lead, Vertex Studio",
        },
      }}
    />
  );
}
