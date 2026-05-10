import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Mail, Settings, ShieldCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { scoreMailbox } from "@/lib/deliverability";
import { sendTestEmail } from "@/lib/test-send.functions";
import { testSmtpCredentials } from "@/lib/test-smtp.functions";
import { useServerFn } from "@tanstack/react-start";
import { BulkImportMailboxes } from "@/components/BulkImportMailboxes";

const PRESETS: Record<string, { smtp_host: string; smtp_port: number; smtp_secure: boolean; imap_host: string; imap_port: number; imap_secure: boolean }> = {
  Gmail: { smtp_host: "smtp.gmail.com", smtp_port: 587, smtp_secure: false, imap_host: "imap.gmail.com", imap_port: 993, imap_secure: true },
  Outlook: { smtp_host: "smtp-mail.outlook.com", smtp_port: 587, smtp_secure: false, imap_host: "outlook.office365.com", imap_port: 993, imap_secure: true },
  "Zoho Mail": { smtp_host: "smtp.zoho.com", smtp_port: 587, smtp_secure: false, imap_host: "imap.zoho.com", imap_port: 993, imap_secure: true },
  Yahoo: { smtp_host: "smtp.mail.yahoo.com", smtp_port: 587, smtp_secure: false, imap_host: "imap.mail.yahoo.com", imap_port: 993, imap_secure: true },
};

export const Route = createFileRoute("/mailboxes")({
  component: () => (
    <RequireAuth><AppShell><MailboxesPage /></AppShell></RequireAuth>
  ),
});

function MailboxesPage() {
  const qc = useQueryClient();
  const { data: mailboxes } = useQuery({
    queryKey: ["mailboxes"],
    queryFn: async () => (await supabase.from("mailboxes").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const remove = async (id: string) => {
    await supabase.from("mailboxes").delete().eq("id", id);
    toast.success("Mailbox removed");
    qc.invalidateQueries({ queryKey: ["mailboxes"] });
  };

  const toggle = async (id: string, is_active: boolean) => {
    await supabase.from("mailboxes").update({ is_active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["mailboxes"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mailboxes</h1>
          <p className="text-muted-foreground mt-1">SMTP accounts used to send your campaigns. Add multiple to rotate sends.</p>
        </div>
        <div className="flex gap-2">
          <BulkImportMailboxes onImported={() => qc.invalidateQueries({ queryKey: ["mailboxes"] })} />
          <AddMailboxDialog onCreated={() => qc.invalidateQueries({ queryKey: ["mailboxes"] })} />
        </div>
      </div>

      {mailboxes?.length === 0 && (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No mailboxes yet. Add your first one to start sending.</p>
        </div>
      )}

      <div className="grid gap-3">
        {mailboxes?.map((m) => (
          <MailboxRow key={m.id} m={m} onToggle={toggle} onRemove={remove} onUpdate={() => qc.invalidateQueries({ queryKey: ["mailboxes"] })} />
        ))}
      </div>
    </div>
  );
}

function MailboxRow({ m, onToggle, onRemove, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [testTo, setTestTo] = useState("");
  const sendTest = useServerFn(sendTestEmail);
  const { score, checks } = scoreMailbox(m);
  const tone = score >= 80 ? "text-success" : score >= 50 ? "text-amber-600" : "text-destructive";

  const runTest = async () => {
    if (!testTo) return toast.error("Enter a recipient email");
    try {
      await sendTest({ data: { mailboxId: m.id, to: testTo, subject: "Test from your cold email tool", body: "This is a test send to confirm SMTP works.\n\nIf you got this, you're ready to launch campaigns." } });
      toast.success("Test sent! Check the inbox.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold">{m.label}</div>
          <div className="text-sm text-muted-foreground">{m.from_name} &lt;{m.from_email}&gt; · {m.smtp_host}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {m.sent_today}/{m.daily_limit} today · ramp {m.ramp_up_enabled ? "on" : "off"} · health {m.health_score ?? 100}/100
          </div>
        </div>
        <button onClick={() => setShowScore(!showScore)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-sm font-medium ${tone}`}>
          <ShieldCheck className="w-4 h-4" /> {score}
        </button>
        <Switch checked={m.is_active} onCheckedChange={(v) => onToggle(m.id, v)} />
        <Button size="icon" variant="ghost" onClick={() => setEditing(!editing)}><Settings className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" onClick={() => onRemove(m.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
      {showScore && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="text-sm font-medium">Deliverability checklist</div>
          <ul className="space-y-1.5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-sm">
                <span className={c.ok ? "text-success" : "text-muted-foreground"}>{c.ok ? "✓" : "○"}</span>
                <div>
                  <div>{c.label}</div>
                  {!c.ok && <div className="text-xs text-muted-foreground">{c.hint}</div>}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <Input placeholder="your@email.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="flex-1" />
            <Button onClick={runTest} variant="outline"><Send className="w-4 h-4 mr-2" /> Send test</Button>
          </div>
        </div>
      )}
      {editing && <MailboxSettings m={m} onSave={() => { setEditing(false); onUpdate(); }} />}
    </div>
  );
}

function MailboxSettings({ m, onSave }: { m: any; onSave: () => void }) {
  const [form, setForm] = useState(m);
  const save = async () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const minD = Number(form.min_delay_seconds);
    const maxD = Number(form.max_delay_seconds);
    const hourly = Number(form.hourly_limit);
    const daily = Number(form.daily_limit);
    if (!Number.isFinite(minD) || !Number.isFinite(maxD) || minD < 0 || maxD < 0) return toast.error("Delays must be non-negative numbers");
    if (minD >= maxD) return toast.error("Min delay must be less than Max delay");
    if (!Number.isFinite(hourly) || !Number.isFinite(daily) || hourly < 1 || daily < 1) return toast.error("Limits must be positive numbers");
    if (hourly > daily) return toast.error("Hourly limit cannot exceed Daily limit");
    if (form.reply_to && String(form.reply_to).trim() && !emailRe.test(String(form.reply_to).trim())) return toast.error("Reply-to must be a valid email address");
    const { id, created_at, sent_today, sent_this_hour, last_sent_at, last_reset_date, hour_reset_at, warmup_sent_today, ...patch } = form;
    if (patch.reply_to) patch.reply_to = String(patch.reply_to).trim();
    const { error } = await supabase.from("mailboxes").update(patch).eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSave();
  };
  const upd = (k: string, v: any) => setForm({ ...form, [k]: v });
  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Daily limit</Label><Input type="number" value={form.daily_limit ?? 30} onChange={(e) => upd("daily_limit", Number(e.target.value))} /></div>
        <div><Label>Hourly limit</Label><Input type="number" value={form.hourly_limit ?? 10} onChange={(e) => upd("hourly_limit", Number(e.target.value))} /></div>
        <div><Label>Min delay (s)</Label><Input type="number" value={form.min_delay_seconds} onChange={(e) => upd("min_delay_seconds", Number(e.target.value))} /></div>
        <div><Label>Max delay (s)</Label><Input type="number" value={form.max_delay_seconds} onChange={(e) => upd("max_delay_seconds", Number(e.target.value))} /></div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={!!form.ramp_up_enabled} onCheckedChange={(v) => upd("ramp_up_enabled", v)} />
        <Label>Auto ramp-up</Label>
        <span className="text-xs text-muted-foreground">Start at {form.ramp_start ?? 5}/day, +{form.ramp_increment ?? 5}/day until cap</span>
      </div>
      <div>
        <Label>Signature</Label>
        <Textarea value={form.signature ?? ""} onChange={(e) => upd("signature", e.target.value)} rows={3} placeholder="Add a signature (optional)" />
      </div>
      <div><Label>Reply-to (optional)</Label><Input type="email" value={form.reply_to ?? ""} onChange={(e) => upd("reply_to", e.target.value)} placeholder="replies@example.com" /></div>
      <Button onClick={save}>Save</Button>
    </div>
  );
}

function AddMailboxDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<string>("Gmail");
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const testSmtp = useServerFn(testSmtpCredentials);
  const [form, setForm] = useState({
    label: "", from_name: "", from_email: "",
    smtp_host: PRESETS.Gmail.smtp_host, smtp_port: 587, smtp_secure: false,
    smtp_username: "", smtp_password: "",
    imap_host: PRESETS.Gmail.imap_host, imap_port: 993, imap_secure: true,
    imap_username: "", imap_password: "",
    daily_limit: 30, hourly_limit: 10, min_delay_seconds: 60, max_delay_seconds: 180,
    ramp_up_enabled: true,
  });

  const applyPreset = (name: string) => {
    setPreset(name);
    const p = PRESETS[name];
    if (p) setForm(f => ({ ...f, ...p }));
  };

  const save = async () => {
    setError(null);
    if (!form.label || !form.from_email || !form.smtp_username || !form.smtp_password) {
      setError("Fill in all required fields.");
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(String(form.from_email).trim())) {
      setError("Invalid email address in From email.");
      return;
    }
    const port = Number(form.smtp_port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      setError("SMTP port must be between 1 and 65535.");
      return;
    }
    const iport = Number(form.imap_port);
    if (form.imap_host && (!Number.isInteger(iport) || iport < 1 || iport > 65535)) {
      setError("IMAP port must be between 1 and 65535.");
      return;
    }
    setTesting(true);
    try {
      await testSmtp({ data: {
        smtp_host: form.smtp_host,
        smtp_port: form.smtp_port,
        smtp_secure: form.smtp_secure,
        smtp_username: form.smtp_username,
        smtp_password: form.smtp_password,
      }});
    } catch (e: any) {
      const msg = e?.message || "Could not connect — check your app password and try again.";
      setError(msg);
      toast.error(msg);
      setTesting(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setTesting(false); return; }
    const payload = {
      ...form,
      imap_username: form.imap_username || form.smtp_username,
      imap_password: form.imap_password || form.smtp_password,
      user_id: user.id,
    };
    const { error: insertErr } = await supabase.from("mailboxes").insert(payload);
    setTesting(false);
    if (insertErr) { setError(insertErr.message); return toast.error(insertErr.message); }
    toast.success("Mailbox connected");
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add mailbox</Button></DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Connect a mailbox</DialogTitle></DialogHeader>

        <div>
          <Label className="text-xs">Provider preset</Label>
          <div className="flex gap-2 flex-wrap mt-1">
            {Object.keys(PRESETS).map(p => (
              <Button key={p} type="button" size="sm" variant={preset === p ? "default" : "outline"} onClick={() => applyPreset(p)}>{p}</Button>
            ))}
            <Button type="button" size="sm" variant={preset === "Custom" ? "default" : "outline"} onClick={() => { setPreset("Custom"); setForm(f => ({ ...f, smtp_host: "", smtp_port: 587, smtp_secure: false, imap_host: "", imap_port: 993, imap_secure: true })); }}>Custom</Button>
          </div>
          {preset === "Gmail" && (
            <p className="text-xs text-muted-foreground mt-2">For Gmail you need an <a className="underline" target="_blank" href="https://myaccount.google.com/apppasswords">App Password</a> (regular password won't work).</p>
          )}
        </div>

        <Tabs defaultValue="basics" className="mt-4">
          <TabsList>
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="smtp">SMTP (sending)</TabsTrigger>
            <TabsTrigger value="imap">IMAP (replies)</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
          </TabsList>
          <TabsContent value="basics" className="grid grid-cols-2 gap-3 pt-3">
            <div className="col-span-2"><Label>Label *</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="My Gmail" /></div>
            <div><Label>From name *</Label><Input value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} /></div>
            <div><Label>From email *</Label><Input type="email" value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value, smtp_username: form.smtp_username || e.target.value })} /></div>
          </TabsContent>
          <TabsContent value="smtp" className="grid grid-cols-2 gap-3 pt-3">
            <div className="col-span-2"><Label>SMTP host *</Label><Input value={form.smtp_host} onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} /></div>
            <div><Label>Port</Label><Input type="number" min={1} max={65535} value={form.smtp_port} onChange={(e) => setForm({ ...form, smtp_port: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-2"><Switch checked={form.smtp_secure} onCheckedChange={(v) => setForm({ ...form, smtp_secure: v })} /><span className="text-sm">SSL (port 465)</span></div>
            <div><Label>Username *</Label><Input value={form.smtp_username} onChange={(e) => setForm({ ...form, smtp_username: e.target.value })} /></div>
            <div><Label>Password / App Password *</Label><Input type="password" value={form.smtp_password} onChange={(e) => setForm({ ...form, smtp_password: e.target.value })} /></div>
          </TabsContent>
          <TabsContent value="imap" className="grid grid-cols-2 gap-3 pt-3">
            <div className="col-span-2 text-xs text-muted-foreground">Used for reply detection. Defaults to your SMTP credentials if blank.</div>
            <div className="col-span-2"><Label>IMAP host</Label><Input value={form.imap_host} onChange={(e) => setForm({ ...form, imap_host: e.target.value })} /></div>
            <div><Label>Port</Label><Input type="number" value={form.imap_port} onChange={(e) => setForm({ ...form, imap_port: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-2"><Switch checked={form.imap_secure} onCheckedChange={(v) => setForm({ ...form, imap_secure: v })} /><span className="text-sm">SSL</span></div>
          </TabsContent>
          <TabsContent value="limits" className="grid grid-cols-2 gap-3 pt-3">
            <div><Label>Daily limit</Label><Input type="number" value={form.daily_limit} onChange={(e) => setForm({ ...form, daily_limit: Number(e.target.value) })} /></div>
            <div><Label>Hourly limit</Label><Input type="number" value={form.hourly_limit} onChange={(e) => setForm({ ...form, hourly_limit: Number(e.target.value) })} /></div>
            <div><Label>Min delay (s)</Label><Input type="number" value={form.min_delay_seconds} onChange={(e) => setForm({ ...form, min_delay_seconds: Number(e.target.value) })} /></div>
            <div><Label>Max delay (s)</Label><Input type="number" value={form.max_delay_seconds} onChange={(e) => setForm({ ...form, max_delay_seconds: Number(e.target.value) })} /></div>
            <div className="col-span-2 flex items-center gap-3 pt-2">
              <Switch checked={form.ramp_up_enabled} onCheckedChange={(v) => setForm({ ...form, ramp_up_enabled: v })} />
              <span className="text-sm">Auto ramp-up (recommended for new accounts)</span>
            </div>
          </TabsContent>
        </Tabs>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm px-3 py-2">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button onClick={save} disabled={testing}>
            {testing ? "Testing connection…" : "Test & save mailbox"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
