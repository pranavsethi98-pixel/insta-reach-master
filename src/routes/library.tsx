import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Trash2, Star, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";

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
  const [filter, setFilter] = useState<"all" | "template" | "sop" | "snippet">("all");
  const [editing, setEditing] = useState<any>(null);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const { data: items, isLoading } = useQuery({
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
    const title = (editing?.title ?? "").trim();
    const body = (editing?.body ?? "").trim();
    if (!title || !body) return toast.error("Title and body required");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const payload = { ...editing, title, body };
    const { error } = editing.id
      ? await supabase.from("resource_library").update(payload).eq("id", editing.id)
      : await supabase.from("resource_library").insert({ ...payload, user_id: u.user.id });
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Saved" : "Created");
    setEditing(null); refresh();
  };

  const deleteItem = async (i: any) => {
    const ok = await confirm({
      title: `Delete "${i.title}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const { error } = await supabase.from("resource_library").delete().eq("id", i.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    refresh();
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
        {([["all","All"],["template","Templates"],["sop","SOPs"],["snippet","Snippets"]] as const).map(([t,label]) => (
          <button key={t} onClick={() => setFilter(t as any)} className={`px-3 py-1 text-sm rounded-md ${filter === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}>{label}</button>
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

      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((i: any) => (
          <div key={i.id} className="bg-card border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase text-muted-foreground">{i.kind} · {i.category}</div>
                <div className="font-semibold truncate">{i.title}</div>
              </div>
              <div className="flex gap-1 ml-2 flex-shrink-0">
                <Button size="icon" variant="ghost" title={i.is_favorite ? "Unfavorite" : "Favorite"} onClick={() => supabase.from("resource_library").update({ is_favorite: !i.is_favorite }).eq("id", i.id).then(refresh)}>
                  <Star className={`w-4 h-4 ${i.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                </Button>
                <Button size="icon" variant="ghost" title="Edit" onClick={() => setEditing(i)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" title="Delete" onClick={() => deleteItem(i)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            {i.subject && <div className="text-sm font-medium">{i.subject}</div>}
            <div className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{i.body}</div>
          </div>
        ))}
        {!isLoading && !filtered.length && !editing && <div className="col-span-2 bg-card border rounded-xl p-8 text-center text-muted-foreground">Nothing here yet. Click "New" to add a template, SOP, or snippet.</div>}
      </div>
      {confirmDialog}
    </div>
  );
}
