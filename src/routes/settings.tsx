import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Globe, Trash2, Pencil } from "lucide-react";
import { verifyTrackingDomain } from "@/lib/tracking-domain.functions";
import { connectCalendly, disconnectCalendly, setCalendlyEvent } from "@/lib/calendly.functions";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/settings")({
  component: () => (
    <RequireAuth><AppShell><SettingsPage /></AppShell></RequireAuth>
  ),
});

function SettingsPage() {
  const qc = useQueryClient();
  const verifyFn = useServerFn(verifyTrackingDomain);
  const [domain, setDomain] = useState("");
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [renaming, setRenaming] = useState<{ id: string; current: string } | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const { data: domains } = useQuery({
    queryKey: ["tracking_domains"],
    queryFn: async () => (await supabase.from("tracking_domains").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const add = async () => {
    if (!domain) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Not signed in");
    const clean = domain.trim().toLowerCase();
    if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(clean)) return toast.error("Enter a valid domain like track.yourbrand.com");
    const { error } = await supabase.from("tracking_domains").insert({ domain: clean, user_id: user.id } as any);
    if (error) return toast.error(error.message);
    setDomain("");
    qc.invalidateQueries({ queryKey: ["tracking_domains"] });
    toast.success("Domain added — now verify the CNAME");
  };

  const verify = async (id: string) => {
    try {
      const r = await verifyFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["tracking_domains"] });
      toast[r.verified ? "success" : "error"](r.verified ? "Verified ✓" : `Not verified: ${r.detail}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string, dom: string) => {
    const ok = await confirm({
      title: `Remove tracking domain "${dom}"?`,
      description: "Existing tracking links using this domain will stop working.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    await supabase.from("tracking_domains").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["tracking_domains"] });
  };

  const startRename = (id: string, current: string) => {
    setRenaming({ id, current });
    setRenameVal(current);
  };

  const commitRename = async () => {
    if (!renaming) return;
    const clean = renameVal.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(clean)) return toast.error("Enter a valid domain like track.yourbrand.com");
    const { error } = await supabase.from("tracking_domains").update({ domain: clean, verified: false } as any).eq("id", renaming.id);
    if (error) return toast.error(error.message);
    toast.success("Renamed — re-verify the CNAME");
    qc.invalidateQueries({ queryKey: ["tracking_domains"] });
    setRenaming(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Custom tracking domains for opens & clicks</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 font-semibold"><Globe className="w-4 h-4" /> Custom tracking domain</div>
        <p className="text-sm text-muted-foreground mb-4">
          Replace generic tracking links with your own subdomain (e.g. <code>track.yourbrand.com</code>) to boost
          deliverability. Add the subdomain below, then create a <b>CNAME</b> record at your DNS provider pointing
          to <code className="bg-muted px-1.5 py-0.5 rounded">track.emailsend.ai</code>, and click Verify.
        </p>
        <div className="flex gap-2 mb-4">
          <Input placeholder="track.yourbrand.com" value={domain} onChange={e => setDomain(e.target.value)} />
          <Button onClick={add}>Add</Button>
        </div>
        <div className="space-y-2">
          {(domains ?? []).map(d => (
            <div key={d.id} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="font-mono text-sm">{d.domain}</div>
                <div className="text-xs text-muted-foreground">CNAME → {d.cname_target}</div>
              </div>
              <div className="flex items-center gap-2">
                {d.verified ? (
                  <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Verified</Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1"><AlertCircle className="w-3 h-3" />Pending</Badge>
                )}
                <Button size="sm" variant="outline" onClick={() => verify(d.id)}>Verify</Button>
                <Button size="sm" variant="ghost" onClick={() => startRename(d.id, d.domain)} title="Rename"><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(d.id, d.domain)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {(!domains || domains.length === 0) && (
            <p className="text-sm text-muted-foreground">No tracking domains yet.</p>
          )}
        </div>
      </Card>

      <CalendarLinkCard />
      <CalendlyCard />
      <ReplyAgentCard />
      {confirmDialog}

      <Dialog open={!!renaming} onOpenChange={(o) => { if (!o) setRenaming(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Rename tracking domain</DialogTitle></DialogHeader>
          <div>
            <Label>New domain</Label>
            <Input
              autoFocus
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename(); }}
              placeholder="track.yourbrand.com"
            />
            <p className="text-xs text-muted-foreground mt-1">The CNAME verification will reset — you'll need to verify again.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenaming(null)}>Cancel</Button>
            <Button onClick={commitRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendlyCard() {
  const qc = useQueryClient();
  const connect = useServerFn(connectCalendly);
  const disconnect = useServerFn(disconnectCalendly);
  const setEvt = useServerFn(setCalendlyEvent);
  const [token, setToken] = useState("");
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const { data: profile } = useQuery({
    queryKey: ["profile-cal-conn"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return (await supabase.from("profiles").select("calendly_token, calendly_event_uri, calendar_link").eq("id", user.id).maybeSingle()).data;
    },
  });
  const isConnected = !!profile?.calendly_token;
  const handleConnect = async () => {
    try {
      const r: any = await connect({ data: { token } });
      setEventTypes(r.eventTypes);
      toast.success(`Connected as ${r.name}`);
      qc.invalidateQueries({ queryKey: ["profile-cal-conn"] });
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Card className="p-6">
      <div className="font-semibold mb-2">Calendly (native)</div>
      <p className="text-sm text-muted-foreground mb-4">
        Connect Calendly so the AI Reply Agent can drop the right scheduling link into replies. Paste a Personal Access Token from <a className="underline" href="https://calendly.com/integrations/api_webhooks" target="_blank">calendly.com/integrations/api_webhooks</a>.
      </p>
      {isConnected ? (
        <div className="flex items-center justify-between border rounded-lg p-3">
          <div>
            <Badge variant="default">Connected</Badge>
            <div className="text-sm mt-1 truncate max-w-md">{profile?.calendar_link}</div>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await disconnect({}); qc.invalidateQueries({ queryKey: ["profile-cal-conn"] }); }}>Disconnect</Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input placeholder="Calendly Personal Access Token" value={token} onChange={(e) => setToken(e.target.value)} />
          <Button onClick={handleConnect}>Connect</Button>
        </div>
      )}
      {eventTypes.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium">Pick default event type</div>
          {eventTypes.map((e) => (
            <div key={e.uri} className="flex items-center justify-between border rounded p-2 text-sm">
              <span>{e.name} <span className="text-muted-foreground">· {e.duration}m</span></span>
              <Button size="sm" variant="outline" onClick={async () => { await setEvt({ data: { uri: e.uri, schedulingUrl: e.scheduling_url } }); toast.success("Default set"); qc.invalidateQueries({ queryKey: ["profile-cal-conn"] }); }}>Use</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ReplyAgentCard() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile-reply-agent"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return (await supabase.from("profiles").select("ai_reply_mode, ai_reply_monthly_cap, ai_reply_used_this_month, slack_webhook_url").eq("id", user.id).maybeSingle()).data;
    },
  });
  const update = async (patch: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Not signed in");
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["profile-reply-agent"] });
    toast.success("Saved");
  };
  return (
    <Card className="p-6">
      <div className="font-semibold mb-2">AI Reply Agent</div>
      <p className="text-sm text-muted-foreground mb-4">Auto-classify replies and draft responses. Choose Autopilot to send without approval, or HITL to review in the Live Feed.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Mode</Label>
          <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            value={profile?.ai_reply_mode ?? "hitl"}
            onChange={(e) => update({ ai_reply_mode: e.target.value })}>
            <option value="off">Off</option>
            <option value="hitl">Human-in-the-loop</option>
            <option value="autopilot">Autopilot</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Monthly credit cap</Label>
          <Input type="number" min={0} max={1000000} defaultValue={profile?.ai_reply_monthly_cap ?? 500}
            onBlur={(e) => {
              const raw = Math.floor(Number(e.target.value));
              const v = Number.isFinite(raw) ? Math.max(0, Math.min(1000000, raw)) : 0;
              if (v !== raw) { e.target.value = String(v); toast.info(`Clamped to ${v} (must be 0–1,000,000)`); }
              update({ ai_reply_monthly_cap: v });
            }} />
          <div className="text-xs text-muted-foreground mt-1">Used: {profile?.ai_reply_used_this_month ?? 0}</div>
        </div>
      </div>
      <div className="mt-3">
        <Label className="text-xs">Slack webhook (escalations)</Label>
        <SlackWebhookField initial={profile?.slack_webhook_url ?? ""} onSave={(v) => update({ slack_webhook_url: v || null })} />
      </div>
    </Card>
  );
}

function SlackWebhookField({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState<string | null>(null);
  // Use null to distinguish "user hasn't typed yet" from "user cleared the field"
  const value = val !== null ? val : initial;
  return (
    <div className="flex gap-2">
      <Input placeholder="https://hooks.slack.com/services/..." value={value} onChange={(e) => setVal(e.target.value)} />
      <Button type="button" onClick={(e) => { e.preventDefault(); if (value && !/^https:\/\/hooks\.slack\.com\//.test(value)) return toast.error("Must be a Slack incoming-webhook URL"); onSave(value); }}>Save</Button>
    </div>
  );
}

function CalendarLinkCard() {
  const { data: profile } = useQuery({
    queryKey: ["profile-cal"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return (await supabase.from("profiles").select("calendar_link").eq("id", user.id).maybeSingle()).data;
    },
  });
  const [link, setLink] = useState<string | null>(null);
  // Use controlled value: prefer local edits, fall back to loaded profile value
  const value = link !== null ? link : (profile?.calendar_link ?? "");
  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Not signed in");
    const trimmed = value.trim();
    if (!trimmed) {
      const { error } = await supabase.from("profiles").update({ calendar_link: null }).eq("id", user.id);
      if (error) return toast.error(error.message);
      setLink(null);
      return toast.success("Calendar link cleared");
    }
    try {
      const u = new URL(trimmed);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    } catch {
      return toast.error("Enter a valid URL starting with https:// (e.g. https://cal.com/you/15min)");
    }
    const { error } = await supabase.from("profiles").update({ calendar_link: trimmed }).eq("id", user.id);
    if (error) return toast.error(error.message);
    setLink(null); // reset local state so profile value takes over
    toast.success("Saved — use {{calendar_link}} in your emails");
  };
  return (
    <Card className="p-6">
      <div className="font-semibold mb-2">Calendar booking link</div>
      <p className="text-sm text-muted-foreground mb-4">
        Paste your Cal.com / Calendly / SavvyCal URL. Insert it in any email or template with <code className="bg-muted px-1.5 py-0.5 rounded">{`{{calendar_link}}`}</code>.
      </p>
      <div className="flex gap-2">
        <Input placeholder="https://cal.com/your-name/15min" value={value} onChange={e => setLink(e.target.value)} />
        <Button type="button" onClick={save}>Save</Button>
      </div>
    </Card>
  );
}
