import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GitBranch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listSubsequences, upsertSubsequence, deleteSubsequence } from "@/lib/subsequences.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/subsequences")({ component: SubsequencesPage });

function SubsequencesPage() {
  const list = useServerFn(listSubsequences);
  const save = useServerFn(upsertSubsequence);
  const del = useServerFn(deleteSubsequence);
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns-list"],
    queryFn: async () => (await supabase.from("campaigns").select("id, name")).data ?? [],
  });
  const { data } = useQuery({ queryKey: ["subsequences"], queryFn: () => list({ data: {} }) });

  const saveMut = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onSuccess: () => { toast.success("Saved"); setOpen(false); qc.invalidateQueries({ queryKey: ["subsequences"] }); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["subsequences"] }); },
  });

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><GitBranch className="w-7 h-7"/> Subsequences</h1>
            <p className="text-muted-foreground">Behavior-branched follow-ups. Trigger separate sequences when a lead opens, clicks, replies — or doesn't.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1"/> New subsequence</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
              <DialogHeader><DialogTitle>New subsequence</DialogTitle></DialogHeader>
              <SubseqForm campaigns={campaigns ?? []} onSave={(v) => saveMut.mutate(v)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3">
          {data?.items.map((s: any) => (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {s.name}
                  <Badge variant="outline">{s.trigger_event.replace("_", " ")}</Badge>
                  {!s.is_active && <Badge variant="secondary">Paused</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{s.steps?.length ?? 0} steps · triggers {s.trigger_after_days}d after parent</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => delMut.mutate(s.id)}><Trash2 className="w-4 h-4"/></Button>
            </Card>
          ))}
          {!data?.items.length && <p className="text-muted-foreground text-sm">No subsequences yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}

function SubseqForm({ campaigns, onSave }: { campaigns: any[]; onSave: (v: any) => void }) {
  const [form, setForm] = useState({
    parent_campaign_id: campaigns[0]?.id ?? "",
    name: "",
    trigger_event: "opened" as const,
    trigger_after_days: 1,
    is_active: true,
  });
  const [steps, setSteps] = useState([{ step_order: 0, delay_days: 0, subject: "", body: "" }]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Parent campaign</Label>
        <Select value={form.parent_campaign_id} onValueChange={(v) => setForm({ ...form, parent_campaign_id: v })}>
          <SelectTrigger><SelectValue placeholder="Select campaign"/></SelectTrigger>
          <SelectContent>
            {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Trigger when</Label>
          <Select value={form.trigger_event} onValueChange={(v: any) => setForm({ ...form, trigger_event: v })}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="opened">Lead opens email</SelectItem>
              <SelectItem value="clicked">Lead clicks link</SelectItem>
              <SelectItem value="replied">Lead replies</SelectItem>
              <SelectItem value="not_opened">No open after delay</SelectItem>
              <SelectItem value="not_replied">No reply after delay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Wait days</Label>
          <Input type="number" min={0} value={form.trigger_after_days}
            onChange={(e) => setForm({ ...form, trigger_after_days: Number(e.target.value) })} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
        <Label>Active</Label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Steps</Label>
          <Button size="sm" variant="outline" onClick={() => setSteps([...steps, { step_order: steps.length, delay_days: 1, subject: "", body: "" }])}>
            <Plus className="w-3 h-3 mr-1"/> Add step
          </Button>
        </div>
        {steps.map((s, i) => (
          <Card key={i} className="p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Step {i + 1}</span>
              <Input className="w-24" type="number" min={0} value={s.delay_days}
                onChange={(e) => { const c = [...steps]; c[i].delay_days = Number(e.target.value); setSteps(c); }} />
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <Input placeholder="Subject" value={s.subject}
              onChange={(e) => { const c = [...steps]; c[i].subject = e.target.value; setSteps(c); }} />
            <Textarea placeholder="Body" rows={3} value={s.body}
              onChange={(e) => { const c = [...steps]; c[i].body = e.target.value; setSteps(c); }} />
          </Card>
        ))}
      </div>

      <Button className="w-full" onClick={() => onSave({ ...form, steps })} disabled={!form.parent_campaign_id || !form.name}>
        Save subsequence
      </Button>
    </div>
  );
}
