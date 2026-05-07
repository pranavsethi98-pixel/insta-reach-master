import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Trash2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/library")({
  component: () => (<RequireAuth><AppShell><LibraryPage /></AppShell></RequireAuth>),
});

const STARTER = [
  { kind: "template", category: "Cold intro", title: "Specific compliment opener", subject: "Quick question, {{first_name}}", body: "Hi {{first_name}},\n\nSaw {{company}} {{custom.signal|recently shipped something interesting}}. Curious — how are you handling {{custom.pain|that side of things}} today?\n\nWe help teams like yours {{custom.benefit|move 2-3x faster}}. Worth a quick look?\n\n— {{sender_name}}" },
  { kind: "template", category: "Follow-up", title: "Value bump", subject: "Re: {{first_name}}", body: "{{first_name}}, bumping this up.\n\nOne thing other {{title|leaders}} found useful: {{custom.proof|a 1-page case study from a similar team}}. Want me to send it over?" },
  { kind: "template", category: "Breakup", title: "Soft close", subject: "Should I close the loop?", body: "{{first_name}} — happy to stop reaching out if it's not a fit. Just reply 'close it' and I'll move on. Otherwise, would 15 min next week work?" },
  { kind: "sop", category: "Deliverability", title: "Warmup ramp checklist", body: "1. Set daily limit to 30 max for first 2 weeks.\n2. Enable peer warmup, ramp +5/day.\n3. Confirm SPF, DKIM, DMARC pass.\n4. Use a custom tracking domain.\n5. Send plain-text first email, no links." },
  { kind: "sop", category: "Copy", title: "60-90 word email rule", body: "Cold emails over 100 words underperform. Structure: 1 line context · 1 line value · 1 ask. Cut adjectives. No 'I hope this finds you well.'" },
];

function LibraryPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "template" | "sop">("all");
  const [editing, setEditing] = useState<any>(null);

  const { data: items } = useQuery({
    queryKey: ["library"],
    queryFn: async () => (await supabase.from("resource_library").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["library"] });

  const seedStarter = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("resource_library").insert(STARTER.map(s => ({ ...s, user_id: u.user!.id })));
    toast.success("Seeded starter templates");
    refresh();
  };

  const save = async () => {
    if (!editing.title || !editing.body) return toast.error("Title and body required");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    if (editing.id) await supabase.from("resource_library").update(editing).eq("id", editing.id);
    else await supabase.from("resource_library").insert({ ...editing, user_id: u.user.id });
    setEditing(null); refresh();
  };

  const filtered = (items ?? []).filter(i => filter === "all" || i.kind === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><BookOpen className="w-7 h-7 text-primary" /> Resource library</h1>
          <p className="text-muted-foreground mt-1">Templates, SOPs, and snippets you reuse across campaigns.</p>
        </div>
        <div className="flex gap-2">
          {!items?.length && <Button variant="outline" onClick={seedStarter}>Seed starter pack</Button>}
          <Button onClick={() => setEditing({ kind: "template", title: "", body: "", subject: "", category: "" })}><Plus className="w-4 h-4 mr-2" /> New</Button>
        </div>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {(["all", "template", "sop"] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 text-sm rounded-md capitalize ${filter === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {editing && (
        <div className="bg-card border rounded-xl p-5 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div><Label>Type</Label>
              <select className="w-full h-10 rounded-md border bg-background px-2 text-sm" value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value })}>
                <option value="template">Template</option><option value="sop">SOP</option><option value="snippet">Snippet</option>
              </select>
            </div>
            <div><Label>Category</Label><Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
            <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
          </div>
          {editing.kind === "template" && <div><Label>Subject</Label><Input value={editing.subject ?? ""} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} /></div>}
          <div><Label>Body</Label><Textarea rows={8} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
          <div className="flex gap-2"><Button onClick={save}>Save</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((i: any) => (
          <div key={i.id} className="bg-card border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground">{i.kind} · {i.category}</div>
                <div className="font-semibold">{i.title}</div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => supabase.from("resource_library").update({ is_favorite: !i.is_favorite }).eq("id", i.id).then(refresh)}>
                  <Star className={`w-4 h-4 ${i.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditing(i)}>Edit</Button>
                <Button size="icon" variant="ghost" onClick={() => supabase.from("resource_library").delete().eq("id", i.id).then(refresh)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            {i.subject && <div className="text-sm font-medium">{i.subject}</div>}
            <div className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{i.body}</div>
          </div>
        ))}
        {!filtered.length && !editing && <div className="col-span-2 bg-card border rounded-xl p-8 text-center text-muted-foreground">Nothing here yet.</div>}
      </div>
    </div>
  );
}
