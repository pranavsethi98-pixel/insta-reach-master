import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronRight, Mail, Users, Send, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: () => (
    <RequireAuth><AppShell><Wizard /></AppShell></RequireAuth>
  ),
});

const SMTP_PRESETS: Record<string, { host: string; port: number; secure: boolean; hint: string }> = {
  gmail:   { host: "smtp.gmail.com",        port: 465, secure: true,  hint: "Use a Google App Password (not your real password)." },
  outlook: { host: "smtp.office365.com",    port: 587, secure: false, hint: "Enable SMTP AUTH in Microsoft 365 admin." },
  zoho:    { host: "smtp.zoho.com",         port: 465, secure: true,  hint: "Generate an app-specific password in Zoho." },
  custom:  { host: "",                      port: 587, secure: false, hint: "Enter your provider's SMTP details." },
};

function Wizard() {
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState<keyof typeof SMTP_PRESETS>("gmail");
  const [mb, setMb] = useState({
    label: "My mailbox", from_name: "", from_email: "",
    smtp_username: "", smtp_password: "",
  });
  const [csv, setCsv] = useState("");
  const [campaign, setCampaign] = useState({ name: "My first campaign", subject: "Quick question, {{first_name}}", body: "Hi {{first_name}},\n\nNoticed {{company}} and wanted to reach out…\n\nWorth a quick chat?\n\n— Me" });
  const [saving, setSaving] = useState(false);

  const steps = ["Welcome", "Mailbox", "Warmup", "Leads", "Campaign", "Done"];

  async function saveMailbox() {
    setSaving(true);
    try {
      const preset = SMTP_PRESETS[provider];
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("mailboxes").insert({
        user_id: u.user!.id,
        label: mb.label,
        from_name: mb.from_name,
        from_email: mb.from_email,
        smtp_host: preset.host,
        smtp_port: preset.port,
        smtp_secure: preset.secure,
        smtp_username: mb.smtp_username || mb.from_email,
        smtp_password: mb.smtp_password,
        daily_limit: 30, hourly_limit: 8, min_delay_seconds: 90, max_delay_seconds: 240,
        ramp_up_enabled: true, warmup_enabled: true,
      } as any);
      if (error) throw error;
      toast.success("Mailbox connected");
      setStep(2);
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  }

  async function importLeads() {
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const rows = lines.map(line => {
        const [email, first_name, company] = line.split(",").map(s => s?.trim());
        return { user_id: u.user!.id, email, first_name: first_name || "", company: company || "" };
      }).filter(r => /@/.test(r.email));
      if (!rows.length) throw new Error("Add at least one email (one per line, optional comma-separated first name + company).");
      const { error } = await supabase.from("leads").insert(rows as any);
      if (error) throw error;
      toast.success(`Imported ${rows.length} leads`);
      setStep(4);
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  }

  async function createCampaign() {
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const { data: c, error } = await supabase.from("campaigns").insert({
        user_id: u.user!.id, name: campaign.name, status: "draft",
        track_opens: true, stop_on_reply: true,
      } as any).select().single();
      if (error) throw error;
      await supabase.from("campaign_steps").insert({
        campaign_id: c.id, step_order: 0, delay_days: 0,
        subject: campaign.subject, body: campaign.body,
      } as any);
      toast.success("Campaign created");
      setStep(5);
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-success" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-8">
        {step === 0 && (
          <div className="text-center space-y-4">
            <Sparkles className="w-12 h-12 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Welcome to EmailSend</h1>
            <p className="text-muted-foreground">We'll get you sending cold emails in under 5 minutes. No fluff.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-left">
              {[{i:Mail,t:"Connect mailbox"},{i:Flame,t:"Auto warmup"},{i:Users,t:"Import leads"},{i:Send,t:"Launch campaign"}].map(({i:Ic,t},k) => (
                <div key={k} className="bg-muted/40 rounded-lg p-3">
                  <Ic className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm font-medium">{t}</div>
                </div>
              ))}
            </div>
            <Button size="lg" onClick={() => setStep(1)} className="mt-4">Let's go <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold">Connect your sending mailbox</h2>
              <p className="text-muted-foreground text-sm mt-1">Pick your provider — we'll fill in the technical bits.</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(SMTP_PRESETS).map(p => (
                <button key={p} onClick={() => setProvider(p as any)} className={`border rounded-lg p-3 text-sm capitalize ${provider === p ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>{p}</button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3">💡 {SMTP_PRESETS[provider].hint}</div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Your name</Label><Input value={mb.from_name} onChange={e => setMb({ ...mb, from_name: e.target.value })} placeholder="Jane Doe" /></div>
              <div><Label>Email address</Label><Input type="email" value={mb.from_email} onChange={e => setMb({ ...mb, from_email: e.target.value })} placeholder="jane@company.com" /></div>
              <div className="col-span-2"><Label>App password</Label><Input type="password" value={mb.smtp_password} onChange={e => setMb({ ...mb, smtp_password: e.target.value })} placeholder="••••••••••••" /></div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={saveMailbox} disabled={saving || !mb.from_email || !mb.smtp_password}>Connect mailbox</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-center">
            <Flame className="w-12 h-12 mx-auto text-orange-500" />
            <h2 className="text-2xl font-bold">Warmup is on 🔥</h2>
            <p className="text-muted-foreground">Your mailbox is now exchanging friendly emails with our warmup network to build inbox-placement reputation. We recommend 2 weeks before heavy sending.</p>
            <div className="bg-muted/40 rounded-lg p-4 text-left text-sm space-y-1">
              <div>✅ Daily cap: 30 (safe)</div>
              <div>✅ Ramp-up: starts at 5/day, +5 daily</div>
              <div>✅ Random delays: 90–240s</div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next: import leads</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold">Add your leads</h2>
              <p className="text-muted-foreground text-sm mt-1">Paste one per line: <code className="bg-muted px-1 rounded">email, first name, company</code></p>
            </div>
            <Textarea rows={8} value={csv} onChange={e => setCsv(e.target.value)} placeholder="alice@acme.com, Alice, Acme&#10;bob@globex.com, Bob, Globex" className="font-mono text-sm" />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={importLeads} disabled={saving || !csv.trim()}>Import</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold">Write your first email</h2>
              <p className="text-muted-foreground text-sm mt-1">Use <code className="bg-muted px-1 rounded">{`{{first_name}}`}</code> and <code className="bg-muted px-1 rounded">{`{{company}}`}</code> to personalize.</p>
            </div>
            <div><Label>Campaign name</Label><Input value={campaign.name} onChange={e => setCampaign({...campaign, name: e.target.value})} /></div>
            <div><Label>Subject</Label><Input value={campaign.subject} onChange={e => setCampaign({...campaign, subject: e.target.value})} /></div>
            <div><Label>Body</Label><Textarea rows={8} value={campaign.body} onChange={e => setCampaign({...campaign, body: e.target.value})} /></div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={createCampaign} disabled={saving}>Create campaign</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-3xl font-bold">You're set up! 🎉</h2>
            <p className="text-muted-foreground">Your mailbox is warming up. Open the campaign, attach leads, and hit launch when you're ready.</p>
            <div className="flex gap-3 justify-center pt-2">
              <Link to="/campaigns"><Button>Go to campaigns</Button></Link>
              <Link to="/dashboard"><Button variant="outline">Dashboard</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
