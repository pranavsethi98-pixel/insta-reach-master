import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RequireAuth } from "@/components/AuthGate";
import { supabase } from "@/integrations/supabase/client";
import { testSmtpCredentials } from "@/lib/test-smtp.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, CornerDownLeft, Flame, Mail, Send, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: () => (
    <RequireAuth><Wizard /></RequireAuth>
  ),
});

const SMTP_PRESETS: Record<string, { host: string; port: number; secure: boolean; hint: string }> = {
  gmail:   { host: "smtp.gmail.com",     port: 465, secure: true,  hint: "Use a Google App Password (not your real password)." },
  outlook: { host: "smtp.office365.com", port: 587, secure: false, hint: "Enable SMTP AUTH in Microsoft 365 admin." },
  zoho:    { host: "smtp.zoho.com",      port: 465, secure: true,  hint: "Generate an app-specific password in Zoho." },
  custom:  { host: "",                   port: 587, secure: false, hint: "Enter your provider's SMTP details." },
};

type StepDef = {
  id: string;
  kind: "intro" | "choice" | "input" | "textarea" | "info" | "done";
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  // for input/textarea
  value?: string;
  onChange?: (v: string) => void;
  inputType?: string;
  placeholder?: string;
  // for choice
  options?: { id: string; label: string; hint?: string }[];
  selected?: string;
  onSelect?: (id: string) => void;
  // gating
  canAdvance?: () => boolean;
  // custom side-effect when advancing
  onAdvance?: () => Promise<void> | void;
  ctaLabel?: string;
};

function Wizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [provider, setProvider] = useState<keyof typeof SMTP_PRESETS>("gmail");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [csv, setCsv] = useState("");
  const [campaignName, setCampaignName] = useState("My first campaign");
  const [subject, setSubject] = useState("Quick question, {{first_name}}");
  const [body, setBody] = useState("Hi {{first_name}},\n\nNoticed {{company}} and wanted to reach out…\n\nWorth a quick chat?\n\n— Me");
  const [saving, setSaving] = useState(false);

  const saveMailbox = useCallback(async () => {
    const preset = SMTP_PRESETS[provider];
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("mailboxes").insert({
      user_id: u.user!.id,
      label: `${fromName || fromEmail}'s mailbox`,
      from_name: fromName, from_email: fromEmail,
      smtp_host: preset.host, smtp_port: preset.port, smtp_secure: preset.secure,
      smtp_username: fromEmail, smtp_password: smtpPassword,
      daily_limit: 30, hourly_limit: 8, min_delay_seconds: 90, max_delay_seconds: 240,
      ramp_up_enabled: true, warmup_enabled: true,
    } as any);
    if (error) throw error;
    toast.success("Mailbox connected");
  }, [provider, fromName, fromEmail, smtpPassword]);

  const importLeads = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const rows = lines.map(line => {
      const [email, first_name, company] = line.split(",").map(s => s?.trim());
      return { user_id: u.user!.id, email, first_name: first_name || "", company: company || "" };
    }).filter(r => /@/.test(r.email));
    if (!rows.length) throw new Error("Add at least one email.");
    const { error } = await supabase.from("leads").insert(rows as any);
    if (error) throw error;
    toast.success(`Imported ${rows.length} leads`);
  }, [csv]);

  const createCampaign = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data: c, error } = await supabase.from("campaigns").insert({
      user_id: u.user!.id, name: campaignName, status: "draft",
      track_opens: true, stop_on_reply: true,
    } as any).select().single();
    if (error) throw error;
    await supabase.from("campaign_steps").insert({
      campaign_id: c.id, step_order: 0, delay_days: 0, subject, body,
    } as any);
    toast.success("Campaign created");
  }, [campaignName, subject, body]);

  const steps: StepDef[] = useMemo(() => [
    {
      id: "welcome", kind: "intro",
      eyebrow: "Welcome",
      title: <>Let's get you sending in <span className="text-primary">5 minutes</span>.</>,
      subtitle: "Four quick questions. No fluff.",
      ctaLabel: "Start",
    },
    {
      id: "name", kind: "input",
      eyebrow: "Question 1",
      title: "What's your name?",
      subtitle: "This is the name your prospects will see.",
      value: fromName, onChange: setFromName,
      placeholder: "Jane Doe",
      canAdvance: () => fromName.trim().length > 1,
    },
    {
      id: "provider", kind: "choice",
      eyebrow: "Question 2",
      title: "Where do you send from?",
      subtitle: "We'll auto-fill the SMTP details.",
      options: [
        { id: "gmail",   label: "Gmail / Workspace", hint: "App Password required" },
        { id: "outlook", label: "Outlook / 365",     hint: "Enable SMTP AUTH" },
        { id: "zoho",    label: "Zoho Mail",         hint: "App-specific password" },
        { id: "custom",  label: "Other SMTP",        hint: "We'll ask for host" },
      ],
      selected: provider,
      onSelect: (id) => setProvider(id as any),
      canAdvance: () => !!provider,
    },
    {
      id: "email", kind: "input",
      eyebrow: "Question 3",
      title: "What's your sending email?",
      subtitle: SMTP_PRESETS[provider].hint,
      value: fromEmail, onChange: setFromEmail,
      inputType: "email",
      placeholder: "jane@company.com",
      canAdvance: () => /\S+@\S+\.\S+/.test(fromEmail),
    },
    {
      id: "password", kind: "input",
      eyebrow: "Question 4",
      title: "Paste your app password",
      subtitle: "Stored encrypted. Used only to send your emails.",
      value: smtpPassword, onChange: setSmtpPassword,
      inputType: "password",
      placeholder: "••••••••••••",
      canAdvance: () => smtpPassword.length >= 6,
      onAdvance: saveMailbox,
      ctaLabel: "Connect mailbox",
    },
    {
      id: "warmup", kind: "info",
      eyebrow: "Warmup",
      title: <>Warmup is on <Flame className="inline w-7 h-7 text-orange-500 -mt-1" /></>,
      subtitle: "Your mailbox is now exchanging friendly emails to build inbox-placement reputation. We recommend 2 weeks of warmup before heavy sending.",
      ctaLabel: "Next: import leads",
    },
    {
      id: "leads", kind: "textarea",
      eyebrow: "Leads",
      title: "Paste your leads",
      subtitle: <>One per line: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">email, first name, company</code></>,
      value: csv, onChange: setCsv,
      placeholder: "alice@acme.com, Alice, Acme\nbob@globex.com, Bob, Globex",
      canAdvance: () => csv.trim().length > 5,
      onAdvance: importLeads,
      ctaLabel: "Import leads",
    },
    {
      id: "subject", kind: "input",
      eyebrow: "First email",
      title: "Write your subject line",
      subtitle: <>Personalize with <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{`{{first_name}}`}</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{`{{company}}`}</code>.</>,
      value: subject, onChange: setSubject,
      placeholder: "Quick question, {{first_name}}",
      canAdvance: () => subject.trim().length > 3,
    },
    {
      id: "body", kind: "textarea",
      eyebrow: "First email",
      title: "Now the message",
      subtitle: "Short. Specific. Ends with one question.",
      value: body, onChange: setBody,
      placeholder: "Hi {{first_name}}, …",
      canAdvance: () => body.trim().length > 10,
      onAdvance: createCampaign,
      ctaLabel: "Create campaign",
    },
    {
      id: "done", kind: "done",
      eyebrow: "All set",
      title: "You're live.",
      subtitle: "Your mailbox is warming up. Open the campaign, attach leads, and hit launch when ready.",
    },
  ], [fromName, provider, fromEmail, smtpPassword, csv, subject, body, saveMailbox, importLeads, createCampaign]);

  const current = steps[step];
  const total = steps.length;
  const progress = (step / (total - 1)) * 100;

  const advance = useCallback(async () => {
    if (saving) return;
    if (current.canAdvance && !current.canAdvance()) return;
    if (current.onAdvance) {
      setSaving(true);
      try { await current.onAdvance(); }
      catch (e: any) { toast.error(e.message || "Something went wrong"); setSaving(false); return; }
      setSaving(false);
    }
    setDir(1);
    setStep(s => Math.min(s + 1, total - 1));
  }, [current, saving, total]);

  const back = useCallback(() => {
    setDir(-1);
    setStep(s => Math.max(s - 1, 0));
  }, []);

  // Keyboard: Enter advances (Shift+Enter = newline in textarea), Esc = back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "TEXTAREA" && !e.metaKey && !e.ctrlKey) return;
        e.preventDefault(); advance();
      } else if (e.key === "Escape") {
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, back]);

  return (
    <div className="fixed inset-0 bg-background text-foreground flex flex-col overflow-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-border/40">
        <Link to="/" className="flex items-center gap-2 font-mono text-sm tracking-tight">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground inline-flex items-center justify-center font-bold">→</span>
          EmailSend.ai
        </Link>
        <div className="text-xs font-mono text-muted-foreground tabular-nums">
          {Math.min(step + 1, total)} / {total}
        </div>
      </header>

      {/* Progress */}
      <div className="h-1 bg-border/40">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
        />
      </div>

      {/* Stage */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={current.id}
            custom={dir}
            initial={{ opacity: 0, y: dir > 0 ? 40 : -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dir > 0 ? -40 : 40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center px-6 md:px-10"
          >
            <div className="w-full max-w-2xl">
              {current.eyebrow && (
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-4">
                  <span className="w-6 h-px bg-primary" />
                  {current.eyebrow}
                </div>
              )}
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
                {current.title}
              </h1>
              {current.subtitle && (
                <p className="mt-4 text-lg text-muted-foreground max-w-xl">{current.subtitle}</p>
              )}

              <div className="mt-10">
                {current.kind === "intro" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl">
                    {[{i:Mail,t:"Mailbox"},{i:Flame,t:"Warmup"},{i:Users,t:"Leads"},{i:Send,t:"Send"}].map(({i:Ic,t},k)=>(
                      <motion.div
                        key={k}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + k * 0.06 }}
                        className="border border-border rounded-lg p-3 bg-card/40 backdrop-blur"
                      >
                        <Ic className="w-4 h-4 text-primary mb-2" />
                        <div className="text-sm font-medium">{t}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {current.kind === "input" && (
                  <Input
                    autoFocus
                    type={current.inputType || "text"}
                    value={current.value || ""}
                    onChange={e => current.onChange?.(e.target.value)}
                    placeholder={current.placeholder}
                    className="h-16 text-2xl md:text-3xl px-0 border-0 border-b-2 border-border rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40 font-medium"
                  />
                )}

                {current.kind === "textarea" && (
                  <Textarea
                    autoFocus
                    rows={6}
                    value={current.value || ""}
                    onChange={e => current.onChange?.(e.target.value)}
                    placeholder={current.placeholder}
                    className="text-base md:text-lg p-4 bg-card/60 backdrop-blur border-border focus-visible:border-primary focus-visible:ring-0 font-mono"
                  />
                )}

                {current.kind === "choice" && (
                  <div className="grid gap-2 max-w-xl">
                    {current.options!.map((o, idx) => {
                      const active = current.selected === o.id;
                      return (
                        <motion.button
                          key={o.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => current.onSelect?.(o.id)}
                          className={`group flex items-center justify-between gap-4 text-left px-5 py-4 rounded-lg border transition-all ${
                            active ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-card/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded border font-mono text-xs flex items-center justify-center ${
                              active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                            }`}>{active ? <Check className="w-3.5 h-3.5" /> : String.fromCharCode(65 + idx)}</span>
                            <div>
                              <div className="font-medium">{o.label}</div>
                              {o.hint && <div className="text-xs text-muted-foreground">{o.hint}</div>}
                            </div>
                          </div>
                          {active && <ArrowRight className="w-4 h-4 text-primary" />}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {current.kind === "info" && (
                  <div className="space-y-2 text-sm text-muted-foreground font-mono max-w-md">
                    <div>✓ Daily cap: 30 (safe)</div>
                    <div>✓ Ramp-up: starts at 5/day, +5 daily</div>
                    <div>✓ Random delays: 90–240s</div>
                  </div>
                )}

                {current.kind === "done" && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    <Link to="/campaigns"><Button size="lg" className="h-12 px-6">Go to campaigns</Button></Link>
                    <Link to="/dashboard"><Button size="lg" variant="outline" className="h-12 px-6">Open dashboard</Button></Link>
                  </div>
                )}
              </div>

              {current.kind !== "done" && (
                <div className="mt-10 flex items-center gap-4">
                  <Button
                    size="lg"
                    onClick={advance}
                    disabled={saving || (current.canAdvance && !current.canAdvance())}
                    className="h-12 px-6 text-base group"
                  >
                    {saving ? "Working…" : (current.ctaLabel || "OK")}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                    press <kbd className="px-1.5 py-0.5 border border-border rounded font-mono inline-flex items-center gap-1">Enter <CornerDownLeft className="w-3 h-3" /></kbd>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer nav */}
      <footer className="flex items-center justify-between px-6 md:px-10 h-14 border-t border-border/40 text-xs text-muted-foreground">
        <button
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="hover:text-foreground transition"
        >
          Skip setup
        </button>
      </footer>
    </div>
  );
}
