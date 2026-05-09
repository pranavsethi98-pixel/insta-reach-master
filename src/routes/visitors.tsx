import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Copy, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/visitors")({
  component: () => (<RequireAuth><AppShell><VisitorsPage /></AppShell></RequireAuth>),
});

function VisitorsPage() {
  const qc = useQueryClient();
  const { data: pixels } = useQuery({
    queryKey: ["pixels"],
    queryFn: async () => (await supabase.from("visitor_pixels").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: events } = useQuery({
    queryKey: ["visitor_events"],
    queryFn: async () => (await supabase.from("visitor_events").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [],
    refetchInterval: 10000,
  });

  const create = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("visitor_pixels").insert({ user_id: u.user.id, label: "My Website" });
    if (error) return toast.error(error.message);
    toast.success("Pixel created");
    qc.invalidateQueries({ queryKey: ["pixels"] });
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Globe className="w-7 h-7 text-primary" /> Website visitors</h1>
          <p className="text-muted-foreground mt-1">Drop a tracking snippet on your site to capture visitors and identify them when they click email links.</p>
        </div>
        <Button onClick={create}><Plus className="w-4 h-4 mr-2" /> New pixel</Button>
      </div>

      <div className="space-y-3">
        {(pixels ?? []).map((p: any) => {
          const snippet = `<script async src="${origin}/api/public/visitor.js?k=${p.pixel_key}"></script>`;
          return (
            <div key={p.id} className="bg-card border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Input className="max-w-xs" defaultValue={p.label} onBlur={(e) => supabase.from("visitor_pixels").update({ label: e.target.value }).eq("id", p.id)} />
                <span className="text-xs text-muted-foreground">{p.is_active ? "Active" : "Paused"}</span>
              </div>
              <div className="flex gap-2">
                <Input readOnly value={snippet} className="font-mono text-xs" />
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(snippet); toast.success("Copied snippet"); }}><Copy className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Paste before <code>&lt;/body&gt;</code> on Webflow, WordPress, Wix, or any custom site.</p>
            </div>
          );
        })}
        {!pixels?.length && (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">No pixels yet — create one to get your snippet.</div>
        )}
      </div>

      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b font-semibold">Recent visits</div>
        <div className="divide-y">
          {(events ?? []).map((e: any) => (
            <div key={e.id} className="p-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex-1 truncate">
                <div className="font-medium truncate">{e.url || "/"}</div>
                <div className="text-xs text-muted-foreground">{e.visitor_email || e.visitor_company || e.ip || "anonymous"} · {e.referrer || "direct"}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</div>
            </div>
          ))}
          {!events?.length && <div className="p-6 text-center text-muted-foreground text-sm">No visits captured yet.</div>}
        </div>
      </div>
    </div>
  );
}
