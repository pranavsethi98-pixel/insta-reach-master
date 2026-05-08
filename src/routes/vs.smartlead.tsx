import { createFileRoute } from "@tanstack/react-router";
import { ComparisonPage } from "@/components/marketing/ComparisonPage";

export const Route = createFileRoute("/vs/smartlead")({
  component: Page,
  head: () => ({
    meta: [
      { title: "EmailSend vs Smartlead — The Honest Comparison | EmailSend.ai" },
      { name: "description", content: "EmailSend vs Smartlead: deliverability, AI, CRM, pricing. The agency-vs-operator breakdown — what each tool is actually built for." },
      { property: "og:title", content: "EmailSend vs Smartlead — The Honest Comparison" },
      { property: "og:description", content: "Deliverability, AI, CRM, pricing. The deltas that matter." },
    ],
  }),
});

function Page() {
  return (
    <ComparisonPage
      c={{
        competitor: "Smartlead",
        competitorTagline: "Cold email + warmup",
        hero: {
          headline: "EmailSend vs Smartlead. Operator's edition.",
          sub: "Smartlead nailed the warmup network. We built everything around it — AI, CRM, replies, analytics — without bolt-ons or credit packs.",
        },
        verdict: {
          winner: "us",
          oneLiner: "Smartlead is the deliverability OG and their warmup network is real. But the product stops at sending — you'll need 3+ tools around it. EmailSend is the full stack in one bill.",
        },
        rows: [
          { feature: "Mailbox limit", us: "Unlimited", them: "Unlimited (basic plan up)" },
          { feature: "Warmup quality", us: "Native + peer network", them: "Industry-leading peer network", note: "Smartlead's warmup is genuinely strong. Ours is competitive." },
          { feature: "AI personalization", us: "Built-in, unlimited", them: "Add-on (separate billing)" },
          { feature: "Unified reply inbox", us: true, them: true },
          { feature: "Native CRM / pipeline", us: true, them: false, note: "Smartlead pushes to your CRM. We are the CRM." },
          { feature: "Reply agent (auto-respond)", us: true, them: false },
          { feature: "Visitor tracking", us: true, them: false },
          { feature: "Meeting scheduler", us: true, them: false },
          { feature: "Spam-word checker", us: true, them: "Basic" },
          { feature: "Sub-sequences (branching)", us: true, them: "Limited" },
          { feature: "API + webhooks", us: "Full", them: "Full" },
          { feature: "Sub-account management", us: true, them: true, note: "Both built for agencies." },
        ],
        whenToChoose: {
          us: [
            "You want one tool, not five — CRM, scheduler, replies, analytics, all in",
            "You sell to / run an agency that needs sub-account control AND a real CRM",
            "You want AI that doesn't bill per generation",
            "You care about visitor + meeting data feeding back into your sequences",
          ],
          them: [
            "You only need pure sending + warmup, and your CRM is already locked in",
            "Your team has built workflows around Smartlead's specific UI",
            "You only care about deliverability metrics — nothing else",
          ],
        },
        pricing: {
          us: "$49/mo flat. Everything included — CRM, AI, warmup, replies, scheduler, visitor tracking. One bill.",
          them: "$39/mo basic → $94/mo pro → $174/mo+ for the full stack. Plus your CRM bill. Plus your scheduler. Real cost: $200-500/mo.",
        },
        switchPitch: "Migrate your sequences and warmup-trained mailboxes in under an hour. Keep the deliverability you've built — gain a CRM, AI, scheduler, and a unified inbox in the same bill.",
      }}
    />
  );
}
