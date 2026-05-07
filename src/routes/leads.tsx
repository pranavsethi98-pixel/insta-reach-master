import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import Papa from "papaparse";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateIcebreakers } from "@/lib/ai.functions";

export const Route = createFileRoute("/leads")({
  component: () => (
    <RequireAuth><AppShell><LeadsPage /></AppShell></RequireAuth>
  ),
});

function LeadsPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const genFn = useServerFn(generateIcebreakers);

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => (await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [],
  });

  const toggleAll = () => {
    if (!leads) return;
    setSelected(selected.size === leads.length ? new Set() : new Set(leads.map(l => l.id)));
  };
  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const remove = async (id: string) => {
    await supabase.from("leads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  const bulkDelete = async () => {
    await supabase.from("leads").delete().in("id", Array.from(selected));
    setSelected(new Set());
    qc.invalidateQueries({ queryKey: ["leads"] });
    toast.success("Deleted");
  };

  const generateAI = async () => {
    if (selected.size === 0) return toast.error("Select leads first");
    setGenerating(true);
    try {
      const ids = Array.from(selected).slice(0, 50);
      const res = await genFn({ data: { leadIds: ids } });
      toast.success(`Generated ${res.results.filter(r => r.icebreaker).length} icebreakers`);
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const seen = new Set<string>();
        const rows = (res.data as any[]).map((r) => {
          const norm: any = { user_id: user.id, custom_fields: {} };
          for (const [k, v] of Object.entries(r)) {
            const key = k.toLowerCase().trim().replace(/\s+/g, "_");
            if (["email", "first_name", "last_name", "company", "title", "website", "linkedin", "phone"].includes(key)) {
              norm[key] = v;
            } else if (v) {
              norm.custom_fields[k] = v;
            }
          }
          return norm;
        }).filter(r => {
          if (!r.email) return false;
          const e = String(r.email).toLowerCase().trim();
          if (seen.has(e)) return false;
          seen.add(e);
          r.email = e;
          return true;
        });
        if (rows.length === 0) return toast.error("No valid rows. CSV must have an 'email' column.");
        // Upsert to handle duplicates
        const { error, count } = await supabase.from("leads").upsert(rows, { onConflict: "user_id,email", ignoreDuplicates: true, count: "exact" });
        if (error) return toast.error(error.message);
        toast.success(`Imported ${count ?? rows.length} leads (duplicates skipped)`);
        qc.invalidateQueries({ queryKey: ["leads"] });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">{leads?.length ?? 0} prospects · {selected.size} selected</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <>
              <Button variant="outline" onClick={generateAI} disabled={generating}>
                <Sparkles className="w-4 h-4 mr-2" /> {generating ? "Generating…" : `AI icebreakers (${selected.size})`}
              </Button>
              <Button variant="outline" onClick={bulkDelete}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
            </>
          )}
          <input ref={fileRef} type="file" accept=".csv" hidden onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])} />
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Import CSV</Button>
          <AddLeadDialog onCreated={() => qc.invalidateQueries({ queryKey: ["leads"] })} />
        </div>
      </div>

      {leads?.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No leads yet. Import a CSV with: email, first_name, last_name, company, title, website, linkedin.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="p-3 w-8"><Checkbox checked={leads && selected.size === leads.length && leads.length > 0} onCheckedChange={toggleAll} /></th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Icebreaker</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads?.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3"><Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggle(l.id)} /></td>
                  <td className="p-3 font-medium">{l.email}</td>
                  <td className="p-3">{[l.first_name, l.last_name].filter(Boolean).join(" ")}</td>
                  <td className="p-3">{l.company}</td>
                  <td className="p-3 max-w-xs truncate text-muted-foreground" title={l.icebreaker ?? ""}>{l.icebreaker || <span className="text-xs italic">—</span>}</td>
                  <td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Tip: use <code className="bg-muted px-1 rounded">{"{{icebreaker}}"}</code> in your campaign body to inject AI-generated openers.
      </div>
    </div>
  );
}

function AddLeadDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", company: "", title: "", website: "", linkedin: "" });
  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("leads").insert({ ...form, email: form.email.toLowerCase().trim(), user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Lead added");
    setOpen(false);
    onCreated();
  };
  const f = (k: keyof typeof form) => ({ value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }) });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add lead</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Email</Label><Input type="email" {...f("email")} /></div>
          <div><Label>First name</Label><Input {...f("first_name")} /></div>
          <div><Label>Last name</Label><Input {...f("last_name")} /></div>
          <div><Label>Company</Label><Input {...f("company")} /></div>
          <div><Label>Title</Label><Input {...f("title")} /></div>
          <div><Label>Website</Label><Input {...f("website")} /></div>
          <div><Label>LinkedIn</Label><Input {...f("linkedin")} /></div>
        </div>
        <DialogFooter><Button onClick={save}>Add</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
