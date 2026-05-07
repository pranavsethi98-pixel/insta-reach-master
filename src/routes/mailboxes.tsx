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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mailboxes")({
  component: () => (
    <RequireAuth><AppShell><MailboxesPage /></AppShell></RequireAuth>
  ),
});

function MailboxesPage() {
  const qc = useQueryClient();
  const { data: mailboxes } = useQuery({
    queryKey: ["mailboxes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mailboxes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from("mailboxes").delete().eq("id", id);
    if (error) return toast.error(error.message);
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
          <p className="text-muted-foreground mt-1">SMTP accounts used to send your campaigns.</p>
        </div>
        <AddMailboxDialog onCreated={() => qc.invalidateQueries({ queryKey: ["mailboxes"] })} />
      </div>

      {mailboxes?.length === 0 && (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No mailboxes yet. Add one to start sending.</p>
        </div>
      )}

      <div className="grid gap-3">
        {mailboxes?.map((m) => (
          <div key={m.id} className="bg-card border rounded-xl p-5 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold">{m.label}</div>
              <div className="text-sm text-muted-foreground">{m.from_name} &lt;{m.from_email}&gt; · {m.smtp_host}:{m.smtp_port}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Daily limit: {m.daily_limit} · Delay {m.min_delay_seconds}–{m.max_delay_seconds}s · Sent today: {m.sent_today}/{m.daily_limit}
              </div>
            </div>
            <Switch checked={m.is_active} onCheckedChange={(v) => toggle(m.id, v)} />
            <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddMailboxDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    label: "", from_name: "", from_email: "",
    smtp_host: "", smtp_port: 587, smtp_secure: false,
    smtp_username: "", smtp_password: "",
    daily_limit: 30, min_delay_seconds: 60, max_delay_seconds: 180,
  });

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("mailboxes").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Mailbox added");
    setOpen(false);
    onCreated();
  };

  const f = (k: keyof typeof form) => ({
    value: form[k] as any,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add mailbox</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add SMTP mailbox</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Label</Label><Input {...f("label")} placeholder="My Gmail" /></div>
          <div><Label>From name</Label><Input {...f("from_name")} /></div>
          <div><Label>From email</Label><Input type="email" {...f("from_email")} /></div>
          <div className="col-span-2"><Label>SMTP host</Label><Input {...f("smtp_host")} placeholder="smtp.gmail.com" /></div>
          <div><Label>Port</Label><Input type="number" {...f("smtp_port")} /></div>
          <div className="flex items-end gap-2"><Switch checked={form.smtp_secure} onCheckedChange={(v) => setForm({ ...form, smtp_secure: v })} /><span className="text-sm">Use SSL (465)</span></div>
          <div><Label>Username</Label><Input {...f("smtp_username")} /></div>
          <div><Label>Password</Label><Input type="password" {...f("smtp_password")} /></div>
          <div><Label>Daily limit</Label><Input type="number" {...f("daily_limit")} /></div>
          <div><Label>Min delay (s)</Label><Input type="number" {...f("min_delay_seconds")} /></div>
          <div><Label>Max delay (s)</Label><Input type="number" {...f("max_delay_seconds")} /></div>
        </div>
        <DialogFooter><Button onClick={save}>Save mailbox</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
