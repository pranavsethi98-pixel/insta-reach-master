import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Copy, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
    const label = window.prompt("Pixel name (e.g. Marketing site)", "")?.trim();
    if (!label) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("visitor_pixels").insert({ user_id: u.user.id, label });
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
              <div className="flex items-center justify-between gap-2">
                <Input className="max-w-xs" defaultValue={p.label} onBlur={(e) => supabase.from("visitor_pixels").update({ label: e.target.value }).eq("id", p.id).then(() => qc.invalidateQueries({ queryKey: ["pixels"] }))} />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Switch checked={!!p.is_active} onCheckedChange={async (v) => { await supabase.from("visitor_pixels").update({ is_active: v }).eq("id", p.id); qc.invalidateQueries({ queryKey: ["pixels"] }); }} />
                    {p.is_active ? "Active" : "Paused"}
                  </label>
                  <Button size="icon" variant="ghost" onClick={async () => { if (!confirm("Delete this pixel?")) return; await supabase.from("visitor_pixels").delete().eq("id", p.id); toast.success("Pixel deleted"); qc.invalidateQueries({ queryKey: ["pixels"] }); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Input readOnly value={snippet} className="font-mono text-xs" onClick={(e) => (e.target as HTMLInputElement).select()} />
                <Button variant="outline" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard?.writeText(snippet).then(() => toast.success("Copied snippet")).catch(() => toast.error("Copy failed")); }}><Copy className="w-4 h-4" /></Button>
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
