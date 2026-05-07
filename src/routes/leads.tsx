import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/leads")({
  component: () => (
    <RequireAuth><AppShell><LeadsPage /></AppShell></RequireAuth>
  ),
});

function LeadsPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });

  const remove = async (id: string) => {
    await supabase.from("leads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["leads"] });
  };

  const handleCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const rows = (res.data as any[]).map((r) => {
          const norm: any = { user_id: user.id, custom_fields: {} };
          for (const [k, v] of Object.entries(r)) {
            const key = k.toLowerCase().trim().replace(/\s+/g, "_");
            if (["email", "first_name", "last_name", "company", "title"].includes(key)) {
              norm[key] = v;
            } else if (v) {
              norm.custom_fields[k] = v;
            }
          }
          return norm;
        }).filter(r => r.email);
        if (rows.length === 0) return toast.error("No valid rows. CSV must have an 'email' column.");
        const { error } = await supabase.from("leads").insert(rows);
        if (error) return toast.error(error.message);
        toast.success(`Imported ${rows.length} leads`);
        qc.invalidateQueries({ queryKey: ["leads"] });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Your prospects.</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" hidden onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])} />
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Import CSV</Button>
          <AddLeadDialog onCreated={() => qc.invalidateQueries({ queryKey: ["leads"] })} />
        </div>
      </div>

      {leads?.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No leads yet. Import a CSV with columns: email, first_name, last_name, company, title.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads?.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3 font-medium">{l.email}</td>
                  <td className="p-3">{[l.first_name, l.last_name].filter(Boolean).join(" ")}</td>
                  <td className="p-3">{l.company}</td>
                  <td className="p-3">{l.title}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs">{l.status}</span></td>
                  <td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddLeadDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", company: "", title: "" });
  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("leads").insert({ ...form, user_id: user.id });
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
        </div>
        <DialogFooter><Button onClick={save}>Add</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
