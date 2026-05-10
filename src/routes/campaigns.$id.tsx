import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Play, Pause, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { renderEmail } from "@/lib/spintax";
import { scoreSpam } from "@/lib/spam-words";
import { TEMPLATES } from "@/lib/email-templates";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/campaigns/$id")({
  component: () => (
    <RequireAuth><AppShell><CampaignDetail /></AppShell></RequireAuth>
  ),
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  // /campaigns/new is reserved for the create flow; redirect to the list
  // (which exposes the "New campaign" modal) instead of trying to load a
  // campaign with id="new".
  if (id === "new") return <Navigate to="/campaigns" />;

  const { data: campaign } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
      if (error) throw error; return data;
    },
  });

  const { data: steps } = useQuery({
    queryKey: ["steps", id],
    queryFn: async () => {
      const { data } = await supabase.from("campaign_steps").select("*").eq("campaign_id", id).order("step_order");
      return data ?? [];
    },
  });

  const { data: mailboxes } = useQuery({
    queryKey: ["mailboxes-all"],
    queryFn: async () => (await supabase.from("mailboxes").select("*")).data ?? [],
  });

  const { data: linkedMailboxes } = useQuery({
    queryKey: ["camp-mailboxes", id],
    queryFn: async () => (await supabase.from("campaign_mailboxes").select("mailbox_id").eq("campaign_id", id)).data ?? [],
  });

  const { data: assigned } = useQuery({
    queryKey: ["assigned", id],
    queryFn: async () => (await supabase.from("campaign_leads").select("*, leads(*)").eq("campaign_id", id)).data ?? [],
  });

  const { data: leads } = useQuery({
    queryKey: ["leads-all"],
    queryFn: async () => (await supabase.from("leads").select("*")).data ?? [],
  });

  const linkedIds = new Set((linkedMailboxes ?? []).map((m: any) => m.mailbox_id));
  const assignedIds = new Set((assigned ?? []).map((a: any) => a.lead_id));

  const updateStatus = async (status: string) => {
    if (status === "active") {
      if (!steps || steps.length === 0) return toast.error("Add at least one step.");
      if (linkedIds.size === 0) return toast.error("Select at least one mailbox.");
      if (assignedIds.size === 0) return toast.error("Assign at least one lead.");
    }
    await supabase.from("campaigns").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["campaign", id] });
    toast.success(`Campaign ${status}`);
  };

  const updateCampaign = async (patch: any) => {
    await supabase.from("campaigns").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["campaign", id] });
  };

  const toggleMailbox = async (mid: string, checked: boolean) => {
    if (checked) await supabase.from("campaign_mailboxes").insert({ campaign_id: id, mailbox_id: mid });
    else await supabase.from("campaign_mailboxes").delete().eq("campaign_id", id).eq("mailbox_id", mid);
    qc.invalidateQueries({ queryKey: ["camp-mailboxes", id] });
  };

  const assignAllLeads = async () => {
    const unassigned = (leads ?? []).filter((l: any) => !assignedIds.has(l.id));
    if (unassigned.length === 0) return toast.info("All leads already assigned.");
    const rows = unassigned.map((l: any) => ({ campaign_id: id, lead_id: l.id }));
    const { error } = await supabase.from("campaign_leads").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Assigned ${rows.length} leads`);
    qc.invalidateQueries({ queryKey: ["assigned", id] });
  };

  if (!campaign) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/campaigns"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <input
              className="text-3xl font-bold tracking-tight bg-transparent outline-none border-b border-transparent focus:border-border"
              defaultValue={campaign.name}
              onBlur={(e) => updateCampaign({ name: e.target.value })}
            />
            <div className="text-sm text-muted-foreground">Status: {campaign.status}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {campaign.status !== "active" ? (
            <Button onClick={() => updateStatus("active")}><Play className="w-4 h-4 mr-2" /> Activate</Button>
          ) : (
            <Button variant="outline" onClick={() => updateStatus("paused")}><Pause className="w-4 h-4 mr-2" /> Pause</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="sequence">
        <TabsList>
          <TabsTrigger value="sequence">Sequence</TabsTrigger>
          <TabsTrigger value="mailboxes">Mailboxes ({linkedIds.size})</TabsTrigger>
          <TabsTrigger value="leads">Leads ({assignedIds.size})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sequence" className="space-y-4 mt-4">
          <SequenceEditor campaignId={id} steps={steps ?? []} />
        </TabsContent>

        <TabsContent value="mailboxes" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Selected mailboxes will rotate sends evenly.</p>
          {mailboxes?.length === 0 && <div className="text-muted-foreground">No mailboxes — add one first.</div>}
          {mailboxes?.map((m: any) => (
            <label key={m.id} className="flex items-center gap-3 bg-card border rounded-xl p-4 cursor-pointer">
              <Checkbox checked={linkedIds.has(m.id)} onCheckedChange={(v) => toggleMailbox(m.id, !!v)} />
              <div className="flex-1">
                <div className="font-medium">{m.label}</div>
                <div className="text-sm text-muted-foreground">{m.from_email} · {m.daily_limit}/day</div>
              </div>
            </label>
          ))}
        </TabsContent>

        <TabsContent value="leads" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{assignedIds.size} of {leads?.length ?? 0} leads assigned.</p>
            <Button onClick={assignAllLeads}>Assign all leads</Button>
          </div>
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr><th className="text-left p-3">Email</th><th className="text-left p-3">Name</th><th className="text-left p-3">Step</th><th className="text-left p-3">Status</th></tr>
              </thead>
              <tbody>
                {assigned?.map((a: any) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3">{a.leads.email}</td>
                    <td className="p-3">{[a.leads.first_name, a.leads.last_name].filter(Boolean).join(" ")}</td>
                    <td className="p-3">{a.current_step}</td>
                    <td className="p-3">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="bg-card border rounded-xl p-6 grid grid-cols-2 gap-4 max-w-xl">
            <div><Label>Window start (hour)</Label><Input type="number" min={0} max={23} defaultValue={campaign.send_window_start ?? 9} onBlur={(e) => updateCampaign({ send_window_start: Number(e.target.value) })} /></div>
            <div><Label>Window end (hour)</Label><Input type="number" min={0} max={23} defaultValue={campaign.send_window_end ?? 17} onBlur={(e) => updateCampaign({ send_window_end: Number(e.target.value) })} /></div>
            <div className="col-span-2 text-xs text-muted-foreground">
              Sending only happens within this window in your server timezone. Days: Mon–Fri by default.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SequenceEditor({ campaignId, steps }: { campaignId: string; steps: any[] }) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["steps", campaignId] });

  const addStep = async () => {
    const nextOrder = (steps[steps.length - 1]?.step_order ?? 0) + 1;
    await supabase.from("campaign_steps").insert({
      campaign_id: campaignId,
      step_order: nextOrder,
      delay_days: nextOrder === 1 ? 0 : 3,
      subject: "",
      body: "",
    });
    refresh();
  };

  return (
    <div className="space-y-4">
      {steps.map((s) => <StepCard key={s.id} step={s} onChange={refresh} />)}
      <Button variant="outline" onClick={addStep}><Plus className="w-4 h-4 mr-2" /> Add step</Button>
      <div className="text-xs text-muted-foreground">
        Tip: use <code className="bg-muted px-1 rounded">{`{{first_name}}`}</code>, <code className="bg-muted px-1 rounded">{`{{company}}`}</code>, and spintax like <code className="bg-muted px-1 rounded">{`{Hi|Hey|Hello}`}</code> for variation.
      </div>
    </div>
  );
}

function StepCard({ step, onChange }: { step: any; onChange: () => void }) {
  const [local, setLocal] = useState(step);
  useEffect(() => setLocal(step), [step.id]);
  const save = async (patch: any) => {
    const next = { ...local, ...patch };
    setLocal(next);
    await supabase.from("campaign_steps").update(patch).eq("id", step.id);
  };
  const remove = async () => {
    await supabase.from("campaign_steps").delete().eq("id", step.id);
    onChange();
  };
  const sample = { first_name: "Jane", last_name: "Doe", company: "Acme", title: "CEO", email: "jane@acme.com" };
  return (
    <div className="bg-card border rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="font-semibold">Step {step.step_order}</div>
        <div className="flex items-center gap-3 flex-wrap">
          {step.step_order > 1 && (
            <>
              <Label className="text-xs">Send if</Label>
              <select
                className="h-8 text-sm rounded-md border bg-background px-2"
                value={local.condition ?? "always"}
                onChange={(e) => save({ condition: e.target.value })}
              >
                <option value="always">Always</option>
                <option value="if_not_replied">No reply yet</option>
                <option value="if_opened">Previous opened</option>
                <option value="if_not_opened">Previous not opened</option>
                <option value="if_clicked">Previous clicked</option>
              </select>
            </>
          )}
          <Label className="text-xs">Delay</Label>
          <Input type="number" className="w-20 h-8" value={local.delay_days ?? 0} onChange={(e) => save({ delay_days: Number(e.target.value) })} />
          <span className="text-sm text-muted-foreground">days</span>
          <Button size="icon" variant="ghost" onClick={remove}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Input placeholder="Subject" value={local.subject ?? ""} onChange={(e) => save({ subject: e.target.value })} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" type="button"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Templates</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="text-xs text-muted-foreground px-2 py-1">Click to load a starter</div>
            {TEMPLATES.map(t => (
              <button key={t.id} className="w-full text-left p-2 rounded hover:bg-muted"
                onClick={() => save({ subject: t.subject, body: t.body })}>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.category}</div>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      <Textarea
        rows={6}
        placeholder="Body — supports {{first_name}} and {spintax|variations}"
        value={local.body ?? ""}
        onChange={(e) => {
          // Auto-grow so the textarea never traps mouse-wheel scroll
          // (otherwise users can't scroll past Step 1 to reach Steps 2 & 3).
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = el.scrollHeight + "px";
          save({ body: e.target.value });
        }}
        ref={(el) => {
          if (el && el.scrollHeight > el.clientHeight) {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }
        }}
        className="resize-none overflow-hidden"
      />
      <SpamPreview subject={local.subject || ""} body={local.body || ""} sample={sample} />
    </div>
  );
}

function SpamPreview({ subject, body, sample }: { subject: string; body: string; sample: any }) {
  const report = scoreSpam(subject, body);
  const tone = report.score < 20 ? "default" : report.score < 50 ? "secondary" : "destructive";
  const [seed, setSeed] = useState(0);
  // Re-render preview with fresh spintax pick when seed changes
  const previewSubject = (() => { void seed; return renderEmail(subject, sample); })();
  const previewBody = (() => { void seed; return renderEmail(body, sample); })();
  return (
    <div className="border-t pt-3 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={tone as any}>Spam score: {report.score}/100</Badge>
        <span className="text-xs text-muted-foreground">{report.stats.words} words · {report.stats.links} links · {report.stats.exclamations} ! · {report.stats.allCapsWords} CAPS</span>
        <Button size="sm" variant="ghost" type="button" onClick={() => setSeed(s => s + 1)}>↻ Re-roll spintax</Button>
      </div>
      {(report.hits.length > 0 || report.warnings.length > 0) && (
        <div className="text-xs space-y-1">
          {report.hits.length > 0 && (
            <div><span className="text-destructive font-medium">Spam words:</span> {report.hits.join(", ")}</div>
          )}
          {report.warnings.map((w, i) => <div key={i} className="text-amber-600">⚠ {w}</div>)}
        </div>
      )}
      <details className="text-xs" open>
        <summary className="cursor-pointer text-muted-foreground">Live preview (sample lead)</summary>
        <div className="mt-2 bg-muted/50 rounded p-3 whitespace-pre-wrap">
          <div className="font-semibold">{previewSubject}</div>
          <div className="mt-2">{previewBody}</div>
        </div>
      </details>
    </div>
  );
}
