import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/warmup")({
  component: () => (
    <RequireAuth><AppShell><WarmupPage /></AppShell></RequireAuth>
  ),
});

function WarmupPage() {
  const qc = useQueryClient();
  const { data: mailboxes } = useQuery({
    queryKey: ["mailboxes-warmup"],
    queryFn: async () => (await supabase.from("mailboxes").select("*").order("created_at")).data ?? [],
  });
  const { data: log } = useQuery({
    queryKey: ["warmup-log"],
    queryFn: async () => (await supabase.from("warmup_log").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
    refetchInterval: 10000,
  });

  const update = async (id: string, patch: any) => {
    if (patch.warmup_enabled && !mailboxes?.find(m => m.id === id)?.warmup_started_at) {
      patch.warmup_started_at = new Date().toISOString().slice(0, 10);
    }
    await supabase.from("mailboxes").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["mailboxes-warmup"] });
  };

  const enabled = (mailboxes ?? []).filter(m => m.warmup_enabled);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Flame className="w-7 h-7 text-orange-500" /> Warmup
        </h1>
        <p className="text-muted-foreground mt-1">
          Build sender reputation by exchanging real-looking emails between your mailboxes.
        </p>
      </div>

      {(mailboxes?.length ?? 0) < 2 && (
        <div className="bg-card border rounded-xl p-5 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
          <div>
            <div className="font-semibold">Add at least 2 mailboxes</div>
            <div className="text-sm text-muted-foreground">Warmup needs 2+ mailboxes to send messages between.</div>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {mailboxes?.map((m) => {
          const startedDays = m.warmup_started_at
            ? Math.floor((Date.now() - new Date(m.warmup_started_at).getTime()) / 86400000) : 0;
          const todayTarget = m.warmup_enabled
            ? Math.min(m.warmup_daily_target ?? 40, 2 + startedDays * (m.warmup_increment ?? 2))
            : 0;
          return (
            <div key={m.id} className="bg-card border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-sm text-muted-foreground">{m.from_email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Health</span>
                  <span className="px-2 py-0.5 rounded bg-success/15 text-success text-sm font-medium">{m.health_score ?? 100}/100</span>
                  <Switch checked={!!m.warmup_enabled} onCheckedChange={(v) => update(m.id, { warmup_enabled: v })} />
                </div>
              </div>
              {m.warmup_enabled && (
                <>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div>
                      <Label className="text-xs">Daily target</Label>
                      <Input type="number" defaultValue={m.warmup_daily_target ?? 40} onBlur={(e) => update(m.id, { warmup_daily_target: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-xs">Daily increment</Label>
                      <Input type="number" defaultValue={m.warmup_increment ?? 2} onBlur={(e) => update(m.id, { warmup_increment: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-xs">Reply rate (0–1)</Label>
                      <Input type="number" step="0.1" min="0" max="1" defaultValue={m.warmup_reply_rate ?? 0.4} onBlur={(e) => update(m.id, { warmup_reply_rate: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-xs">Open rate (0–1)</Label>
                      <Input type="number" step="0.1" min="0" max="1" defaultValue={(m as any).warmup_open_rate ?? 0.5} onBlur={(e) => update(m.id, { warmup_open_rate: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label className="text-xs">Spam protection</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                        defaultValue={(m as any).warmup_spam_protection_level ?? "medium"}
                        onBlur={(e) => update(m.id, { warmup_spam_protection_level: e.target.value })}>
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><Label className="text-xs">Randomize volume</Label>
                        <Switch checked={(m as any).warmup_randomize ?? true} onCheckedChange={(v) => update(m.id, { warmup_randomize: v })} /></div>
                      <div className="flex items-center justify-between"><Label className="text-xs">Slow ramp</Label>
                        <Switch checked={(m as any).warmup_slow_ramp ?? true} onCheckedChange={(v) => update(m.id, { warmup_slow_ramp: v })} /></div>
                      <div className="flex items-center justify-between"><Label className="text-xs">Read emulation</Label>
                        <Switch checked={(m as any).warmup_read_emulation ?? true} onCheckedChange={(v) => update(m.id, { warmup_read_emulation: v })} /></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t mt-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Inbox %</div>
                      <div className="text-2xl font-bold text-emerald-600">{Math.round(((m as any).deliverability_inbox_pct ?? 100))}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Spam %</div>
                      <div className="text-2xl font-bold text-rose-600">{Math.round(((m as any).deliverability_spam_pct ?? 0))}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Deliverability score</div>
                      <div className="text-2xl font-bold">{Math.round(((m as any).deliverability_score ?? 100))}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Today: <span className="font-medium text-foreground">{m.warmup_sent_today ?? 0} / {todayTarget}</span> sent · day {startedDays + 1} of warmup
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Recent warmup activity</h2>
        <div className="bg-card border rounded-xl divide-y">
          {(log ?? []).length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No activity yet.</div>}
          {log?.map((l) => (
            <div key={l.id} className="p-3 text-sm flex justify-between">
              <span>{l.action} — {(mailboxes?.find(m => m.id === l.from_mailbox_id)?.from_email) ?? "?"} → {(mailboxes?.find(m => m.id === l.to_mailbox_id)?.from_email) ?? "?"}</span>
              <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
