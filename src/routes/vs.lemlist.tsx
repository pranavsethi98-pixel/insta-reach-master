import { createFileRoute } from "@tanstack/react-router";
import { ComparisonPage } from "@/components/marketing/ComparisonPage";

export const Route = createFileRoute("/vs/lemlist")({
  component: Page,
  head: () => ({
    meta: [
      { title: "EmailSend vs Lemlist — The Honest Comparison | EmailSend.ai" },
      { name: "description", content: "EmailSend vs Lemlist: pricing, mailbox limits, AI, multi-channel, and the things their pricing page hides. The brutal breakdown." },
      { property: "og:title", content: "EmailSend vs Lemlist — The Honest Comparison" },
      { property: "og:description", content: "Pricing, mailbox limits, AI, multi-channel. The deltas." },
    ],
  }),
});

function Page() {
  return (
    <ComparisonPage
      c={{
        competitor: "Lemlist",
        competitorTagline: "Multi-channel outreach",
        hero: {
          headline: "EmailSend vs Lemlist. Cold-email-only edition.",
          sub: "Lemlist is the multi-channel darling. But if you're here for cold email — pure, high-volume, deliverable cold email — the math is brutal. Here's the breakdown.",
        },
        verdict: {
          winner: "us",
          oneLiner: "Lemlist is great if you genuinely need email + LinkedIn + voice + cold-call all in one tool. If you're 90% email like most operators are, you're paying premium for features you'll never use.",
        },
        rows: [
          { feature: "Mailbox limit", us: "Unlimited", them: "1 per seat (charged per seat)", note: "This is the killer. 10 mailboxes = 10 seats." },
          { feature: "Free warmup", us: true, them: "Add-on (Lemwarm, $29/mo+)" },
          { feature: "AI personalization", us: "Included", them: "Tier-locked", note: "Lemlist's best AI features are on Multichannel Expert ($99/mo/seat)." },
          { feature: "LinkedIn automation", us: false, them: true, note: "If you need this, Lemlist wins." },
          { feature: "Voice / cold call steps", us: false, them: true },
          { feature: "Unified reply inbox", us: true, them: true },
          { feature: "Native CRM / pipeline", us: true, them: "Basic" },
          { feature: "Visitor tracking", us: true, them: false },
          { feature: "Reply agent (auto-respond)", us: true, them: false },
          { feature: "Spintax + dynamic images", us: "Spintax", them: "Spintax + dynamic images" },
          { feature: "API + webhooks", us: "Full", them: "Full" },
          { feature: "Pricing model", us: "Flat", them: "Per seat × per mailbox", note: "Costs scale linearly with team + mailbox count." },
        ],
        whenToChoose: {
          us: [
            "You're 90%+ cold email and don't need LinkedIn / voice automation",
            "You run multiple mailboxes per person (most outbound operators do)",
            "You hate per-seat pricing as much as we do",
            "You want a real CRM, not a contact list with stages",
          ],
          them: [
            "You genuinely need email + LinkedIn + voice in one orchestrated sequence",
            "You're a single SDR with 1 mailbox and don't mind seat pricing",
            "Your sales motion is consultative and multi-channel by design",
          ],
        },
        pricing: {
          us: "$49/mo flat. Unlimited mailboxes. Unlimited team. AI + warmup + CRM included.",
          them: "$59-$99/mo per seat. Each seat = 1 mailbox. Lemwarm = +$29/mo. Real cost for a 5-person team with 3 mailboxes each: $1,000+/mo.",
        },
        switchPitch: "We'll import your sequences and warmup-trained mailboxes. Keep the deliverability, drop the seat math. Most teams cut their cold email bill 70-80% switching to EmailSend.",
      }}
    />
  );
}
