import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Webhook, Copy, Activity } from "lucide-react";
import { toast } from "sonner";

const ALL_EVENTS = ["sent", "open", "click", "reply", "bounce"] as const;

export const Route = createFileRoute("/webhooks")({
  component: () => (
    <RequireAuth><AppShell><WebhooksPage /></AppShell></RequireAuth>
  ),
});

function WebhooksPage() {
  const qc = useQueryClient();
  const { data: hooks } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => (await supabase.from("webhooks").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: deliveries } = useQuery({
    queryKey: ["webhook_deliveries"],
    queryFn: async () => (await supabase.from("webhook_deliveries").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const remove = async (id: string) => {
    await supabase.from("webhooks").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["webhooks"] });
  };
  const toggle = async (id: string, is_active: boolean) => {
    await supabase.from("webhooks").update({ is_active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["webhooks"] });
  };
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Get notified at your URL when emails are sent, opened, clicked, replied to, or bounced. Pipe into Zapier, Make, n8n, or your CRM.</p>
        </div>
        <AddWebhookDialog onCreated={() => qc.invalidateQueries({ queryKey: ["webhooks"] })} />
      </div>

      <div className="grid gap-3">
        {(hooks ?? []).map(h => (
          <Card key={h.id} className="p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <Webhook className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm truncate">{h.url}</div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                  {(h.events ?? []).map((e: string) => <Badge key={e} variant="secondary">{e}</Badge>)}
                </div>
              </div>
              {h.last_status != null && (
                <Badge variant={h.last_status >= 200 && h.last_status < 300 ? "default" : "destructive"}>
                  Last: {h.last_status}
                </Badge>
              )}
              <Switch checked={h.is_active} onCheckedChange={(v) => toggle(h.id, v)} />
              <Button size="icon" variant="ghost" onClick={() => copy(h.secret)} title="Copy signing secret"><Copy className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(h.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              Signing secret: <code className="bg-muted px-1.5 py-0.5 rounded">{h.secret}</code>
              {" · "}Verify with HMAC-SHA256 of body, header <code className="bg-muted px-1 rounded">X-EmailSend-Signature: sha256=&lt;hex&gt;</code>
            </div>
          </Card>
        ))}
        {hooks?.length === 0 && (
          <Card className="p-12 text-center">
            <Webhook className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No webhooks yet. Add one to push events to your CRM, Zapier, or anywhere.</p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Recent deliveries</h2>
        <Card>
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Time</th><th className="text-left p-3">Event</th><th className="text-left p-3">Status</th><th className="text-left p-3">Response</th></tr>
            </thead>
            <tbody>
              {(deliveries ?? []).map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-3 text-xs">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="p-3"><Badge variant="secondary">{d.event}</Badge></td>
                  <td className="p-3">{d.status ?? "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground truncate max-w-md">{d.response}</td>
                </tr>
              ))}
              {(deliveries ?? []).length === 0 && (
                <tr><td className="p-6 text-center text-muted-foreground" colSpan={4}>No deliveries yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function AddWebhookDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([...ALL_EVENTS]);

  const save = async () => {
    if (!/^https?:\/\//.test(url)) return toast.error("Enter a valid URL starting with http(s)://");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("webhooks").insert({ user_id: user.id, url: url.trim(), events } as any);
    if (error) return toast.error(error.message);
    toast.success("Webhook added"); setOpen(false); setUrl(""); onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add webhook</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New webhook</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Endpoint URL</Label>
            <Input placeholder="https://yourapp.com/hooks/emailsend" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <Label>Events</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {ALL_EVENTS.map(ev => (
                <label key={ev} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 cursor-pointer">
                  <Checkbox checked={events.includes(ev)} onCheckedChange={(v) => setEvents(v ? [...events, ev] : events.filter(e => e !== ev))} />
                  {ev}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter><Button onClick={save}>Add</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
