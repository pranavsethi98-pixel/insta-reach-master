// Deliverability score: simple, transparent rubric (0-100)
export type DeliverabilityCheck = {
  label: string;
  ok: boolean;
  hint: string;
  weight: number;
};

export function scoreMailbox(m: any): { score: number; checks: DeliverabilityCheck[] } {
  const checks: DeliverabilityCheck[] = [
    { label: "Mailbox is active", ok: !!m.is_active, hint: "Activate the mailbox to send.", weight: 10 },
    { label: "Daily limit ≤ 50", ok: (m.daily_limit ?? 0) <= 50, hint: "Keep under 50/day per mailbox to avoid filters.", weight: 15 },
    { label: "Ramp-up enabled", ok: !!m.ramp_up_enabled, hint: "Ramp-up gradually grows volume — turn it on for new mailboxes.", weight: 15 },
    { label: "Warmup enabled", ok: !!m.warmup_enabled, hint: "Warmup builds inbox-placement reputation.", weight: 20 },
    { label: "Random delay ≥ 60s", ok: (m.min_delay_seconds ?? 0) >= 60, hint: "Sub-60s delays look automated.", weight: 10 },
    { label: "Hourly limit set", ok: (m.hourly_limit ?? 0) > 0 && (m.hourly_limit ?? 999) <= 15, hint: "Cap hourly sends to 5–15 to look human.", weight: 10 },
    { label: "Health score ≥ 80", ok: (m.health_score ?? 100) >= 80, hint: "Recent failures hurt reputation — pause and investigate.", weight: 10 },
    { label: "Signature set", ok: !!(m.signature && m.signature.length > 5), hint: "Add a signature — bare emails look spammy.", weight: 10 },
  ];
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
  return { score: Math.min(100, Math.round((got / total) * 100)), checks };
}
