export type EmailTemplate = {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
};

export const TEMPLATES: EmailTemplate[] = [
  {
    id: "value-prop",
    name: "Quick value prop",
    category: "Cold intro",
    subject: "{Quick question|Quick idea} for {{company}}",
    body: `Hi {{first_name}},\n\n{{icebreaker}}\n\nWe help {companies like yours|teams in your space} {save 10+ hours/week|cut costs by 20%|close 30% more deals} with {one short sentence about what you do}.\n\nWorth a 15-min chat next week?\n\n{Cheers|Thanks|Best},\n{Your name}`,
  },
  {
    id: "case-study",
    name: "Social proof / case study",
    category: "Cold intro",
    subject: "How {Acme|a company like yours} {3x'd|doubled} their pipeline",
    body: `Hi {{first_name}},\n\nNoticed {{company}} is {growing fast|hiring in X|launching Y}. We recently helped a similar team {achieve concrete result} in {timeframe}.\n\nHappy to share the playbook — open to a quick call?\n\n{Best|Cheers},\n{Your name}`,
  },
  {
    id: "bump",
    name: "Friendly bump",
    category: "Follow-up",
    subject: "re: {{company}}",
    body: `Hey {{first_name}},\n\nFloating this back up — {did the timing miss|happy to wait if not a fit}.\n\nWorth a quick look?`,
  },
  {
    id: "breakup",
    name: "Break-up email",
    category: "Follow-up",
    subject: "Closing the loop, {{first_name}}?",
    body: `Hi {{first_name}},\n\nI've reached out a few times — sounds like the timing isn't right. I'll stop here so I don't clog your inbox.\n\nIf anything changes, just reply with "yes" and I'll pick it back up.\n\n{Cheers|Best},\n{Your name}`,
  },
  {
    id: "soft-ask",
    name: "Soft ask (no meeting)",
    category: "Reply-bait",
    subject: "wrong person?",
    body: `Hi {{first_name}},\n\nQuick one — are you the right person at {{company}} to talk about {topic}? If not, who would you point me to?\n\nThanks!`,
  },
];
