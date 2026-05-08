import { createFileRoute } from "@tanstack/react-router";
import { ComparisonPage } from "@/components/marketing/ComparisonPage";

export const Route = createFileRoute("/vs/instantly")({
  component: Page,
  head: () => ({
    meta: [
      { title: "EmailSend vs Instantly — The Honest Comparison | EmailSend.ai" },
      { name: "description", content: "EmailSend vs Instantly: pricing, mailbox limits, deliverability, AI, and the things their landing page won't tell you. Pick the right tool for your outbound stack." },
      { property: "og:title", content: "EmailSend vs Instantly — The Honest Comparison" },
      { property: "og:description", content: "Pricing, mailbox limits, deliverability, AI. The deltas that matter." },
    ],
  }),
});

function Page() {
  return (
    <ComparisonPage
      c={{
        competitor: "Instantly",
        competitorTagline: "Cold email automation",
        hero: {
          headline: "EmailSend vs Instantly. The honest cut.",
          sub: "Both send cold email. One throttles you on mailbox count and charges per AI credit. The other doesn't. Here's the breakdown — no spin.",
        },
        verdict: {
          winner: "us",
          oneLiner: "Instantly is a great starter tool. Once you cross 25+ mailboxes or want AI baked in (not metered), the math stops working. EmailSend is built for that volume from day one.",
        },
        rows: [
          { feature: "Mailbox limit", us: "Unlimited", them: "Tiered (5 → 25 → 100+)", note: "Instantly's 'unlimited' tier is $97/mo+ and still has fair-use limits." },
          { feature: "Free warmup", us: true, them: "$30/mo per 100 inboxes", note: "Warmup is the line item that quietly doubles the bill." },
          { feature: "AI personalization", us: "Included", them: "Metered credits", note: "Instantly charges per AI generation. We don't." },
          { feature: "Unified reply inbox", us: true, them: true },
          { feature: "Custom tracking domain", us: "Free, unlimited", them: "Free, 1 per workspace" },
          { feature: "Spintax + dynamic vars", us: true, them: true },
          { feature: "Native CRM / pipeline", us: true, them: false, note: "Instantly's CRM is a $37/mo add-on." },
          { feature: "Reply agent (auto-respond)", us: true, them: false },
          { feature: "Bulk import + verify", us: true, them: true },
          { feature: "Open-source SDK", us: true, them: false },
          { feature: "Built-in API for everything", us: true, them: "Partial" },
          { feature: "Setup time to first send", us: "<10 min", them: "<15 min" },
        ],
        whenToChoose: {
          us: [
            "You run 25+ mailboxes (or plan to)",
            "You want AI in every step — without a credit meter",
            "You need a real CRM, not a $37/mo bolt-on",
            "You care about deliverability data, not vanity metrics",
            "You'd rather build on an open API than fight a closed one",
          ],
          them: [
            "You're sending from 1-5 mailboxes and want a pretty UI",
            "You don't need AI personalization (or you're fine paying per generation)",
            "Your team already uses Instantly and switching costs > savings",
          ],
        },
        pricing: {
          us: "$49/mo flat. Unlimited mailboxes. AI included. Warmup free. No credit packs, no add-on tiers.",
          them: "$37/mo for 1k contacts → $97/mo for unlimited. Add $30/mo for warmup. Add $37/mo for CRM. Add credits for AI. Real bill at scale: $200-400/mo.",
        },
        switchPitch: "We import your sequences, mailboxes, and lead lists in one click. You'll be sending from EmailSend in under 30 minutes — and probably cutting your tool bill in half.",
      }}
    />
  );
}
