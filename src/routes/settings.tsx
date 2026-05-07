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
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Globe, Trash2 } from "lucide-react";
import { verifyTrackingDomain } from "@/lib/tracking-domain.functions";

export const Route = createFileRoute("/settings")({
  component: () => (
    <RequireAuth><AppShell><SettingsPage /></AppShell></RequireAuth>
  ),
});

function SettingsPage() {
  const qc = useQueryClient();
  const verifyFn = useServerFn(verifyTrackingDomain);
  const [domain, setDomain] = useState("");

  const { data: domains } = useQuery({
    queryKey: ["tracking_domains"],
    queryFn: async () => (await supabase.from("tracking_domains").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const add = async () => {
    if (!domain) return;
    const { error } = await supabase.from("tracking_domains").insert({ domain: domain.trim().toLowerCase() } as any);
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

  const remove = async (id: string) => {
    await supabase.from("tracking_domains").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["tracking_domains"] });
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
          to <code className="bg-muted px-1.5 py-0.5 rounded">track.outreachly.app</code>, and click Verify.
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
                <Button size="sm" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {(!domains || domains.length === 0) && (
            <p className="text-sm text-muted-foreground">No tracking domains yet.</p>
          )}
        </div>
      </Card>

      <CalendarLinkCard />
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
  const [link, setLink] = useState("");
  const value = link || profile?.calendar_link || "";
  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ calendar_link: link.trim() }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Saved — use {{calendar_link}} in your emails");
  };
  return (
    <Card className="p-6">
      <div className="font-semibold mb-2">Calendar booking link</div>
      <p className="text-sm text-muted-foreground mb-4">
        Paste your Cal.com / Calendly / SavvyCal URL. Insert it in any email or template with <code className="bg-muted px-1.5 py-0.5 rounded">{`{{calendar_link}}`}</code>.
      </p>
      <div className="flex gap-2">
        <Input placeholder="https://cal.com/your-name/15min" defaultValue={value} onChange={e => setLink(e.target.value)} />
        <Button onClick={save}>Save</Button>
      </div>
    </Card>
  );
}
