import { createFileRoute } from "@tanstack/react-router";
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
import { Plus, Trash2, Play, Pause, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { renderEmail } from "@/lib/spintax";

export const Route = createFileRoute("/campaigns/$id")({
  component: () => (
    <RequireAuth><AppShell><CampaignDetail /></AppShell></RequireAuth>
  ),
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

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
      <div className="flex items-center justify-between">
        <div className="font-semibold">Step {step.step_order}</div>
        <div className="flex items-center gap-3">
          <Label className="text-xs">Delay</Label>
          <Input type="number" className="w-20 h-8" value={local.delay_days ?? 0} onChange={(e) => save({ delay_days: Number(e.target.value) })} />
          <span className="text-sm text-muted-foreground">days</span>
          <Button size="icon" variant="ghost" onClick={remove}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
      <Input placeholder="Subject" value={local.subject ?? ""} onChange={(e) => save({ subject: e.target.value })} />
      <Textarea rows={6} placeholder="Body — supports {{first_name}} and {spintax|variations}" value={local.body ?? ""} onChange={(e) => save({ body: e.target.value })} />
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">Preview (sample lead)</summary>
        <div className="mt-2 bg-muted/50 rounded p-3 whitespace-pre-wrap">
          <div className="font-semibold">{renderEmail(local.subject || "", sample)}</div>
          <div className="mt-2">{renderEmail(local.body || "", sample)}</div>
        </div>
      </details>
    </div>
  );
}
