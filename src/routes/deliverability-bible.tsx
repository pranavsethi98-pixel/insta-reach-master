import { createFileRoute } from "@tanstack/react-router";
import { LeadMagnetLanding } from "@/components/marketing/LeadMagnetLanding";

export const Route = createFileRoute("/deliverability-bible")({
  component: Page,
  head: () => ({
    meta: [
      { title: "The Cold Email Deliverability Bible — Free PDF | EmailSend.ai" },
      { name: "description", content: "The 47-page playbook for landing in the inbox. SPF/DKIM/DMARC, warmup science, sending limits, and the 23 spam triggers killing your reply rate." },
      { property: "og:title", content: "The Cold Email Deliverability Bible — Free PDF" },
      { property: "og:description", content: "Land in the inbox. Every time. Free 47-page PDF from EmailSend.ai." },
    ],
  }),
});

function Page() {
  return (
    <LeadMagnetLanding
      magnet={{
        slug: "deliverability-bible",
        title: "The Cold Email Deliverability Bible.",
        subtitle: "47 pages. Zero theory. The exact playbook our team uses to land in the inbox — even at 10,000 sends a day.",
        badge: "Vol. 01",
        pages: 47,
        bullets: [
          "The 3 DNS records 90% of senders set up wrong (and the fix)",
          "Warmup math: how to ramp from 0 to 100 sends/day without burning the domain",
          "The 23 spam-trigger words still killing your inbox placement in 2026",
          "Why your reply rate dropped last month — and the diagnostic to find out in 4 minutes",
        ],
        toc: [
          { num: "01", title: "The Inbox Placement Stack", desc: "How Gmail, Outlook, and Yahoo actually decide where your email lands." },
          { num: "02", title: "Authentication, Demystified", desc: "SPF, DKIM, DMARC, BIMI — what each one does and how to set them up in 12 minutes." },
          { num: "03", title: "Warmup Science", desc: "The math behind ramping a cold domain to 100+ sends/day without tanking reputation." },
          { num: "04", title: "Sending Limits That Don't Suck", desc: "Per-mailbox, per-domain, per-day. The numbers nobody publishes." },
          { num: "05", title: "Spam Triggers in 2026", desc: "23 words, 11 patterns, and the 1 link mistake that kills inbox placement." },
          { num: "06", title: "The Reputation Recovery Protocol", desc: "What to do when a domain catches fire. Step-by-step recovery in 14 days." },
        ],
        testimonial: {
          quote: "We went from 12% to 47% inbox placement in three weeks following this playbook. Every page earns its rent.",
          name: "Marcus Lee",
          role: "Head of Outbound, Northwind Capital",
        },
      }}
    />
  );
}
