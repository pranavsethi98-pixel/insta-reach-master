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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Users, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { generateIcebreakers } from "@/lib/ai.functions";
import { verifyLeads } from "@/lib/verify.functions";
import { useConfirm } from "@/components/ConfirmDialog";

const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+$/i;
const LINKEDIN_RE = /^(https?:\/\/)?([a-z0-9-]+\.)?linkedin\.com\/.+/i;

export const Route = createFileRoute("/leads")({
  component: () => (
    <RequireAuth><AppShell><LeadsPage /></AppShell></RequireAuth>
  ),
});

function LeadsPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<any>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const genFn = useServerFn(generateIcebreakers);
  const verifyFn = useServerFn(verifyLeads);
  const [verifying, setVerifying] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();
  const runVerify = async () => {
    if (selected.size === 0) return toast.error("Select leads first");
    setVerifying(true);
    try {
      const r = await verifyFn({ data: { leadIds: Array.from(selected).slice(0, 200) } });
      toast.success(`Verified — ${r.valid} valid · ${r.risky} risky · ${r.invalid} invalid (auto-suppressed)`);
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setVerifying(false); }
  };

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

  const remove = async (id: string, email?: string) => {
    const ok = await confirm({
      title: `Delete this lead?`,
      description: email ? `${email} will be permanently removed. This cannot be undone.` : "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["leads"] });
    toast.success("Lead deleted");
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    const n = selected.size;
    const ok = await confirm({
      title: `Delete ${n} lead${n === 1 ? "" : "s"}?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const { error } = await supabase.from("leads").delete().in("id", Array.from(selected));
    if (error) return toast.error(error.message);
    setSelected(new Set());
    qc.invalidateQueries({ queryKey: ["leads"] });
    toast.success(`Deleted ${n} lead${n === 1 ? "" : "s"}`);
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
        const parsedRows = (res.data as any[]);
        const headers = (res.meta?.fields ?? []).map((h: string) => h.toLowerCase().trim().replace(/\s+/g, "_"));
        const hasEmailHeader = headers.includes("email");
        const rows = parsedRows.map((r) => {
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
        if (rows.length === 0) {
          if (hasEmailHeader && parsedRows.length === 0) {
            return toast.error("Your CSV has the right headers but no data rows. Add at least one email address.");
          }
          if (!hasEmailHeader) {
            return toast.error("CSV must have an 'email' column header.");
          }
          return toast.error("No rows had a valid email value in the 'email' column.");
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const valid = rows.filter(r => emailRe.test(r.email));
        const skippedInvalid = rows.length - valid.length;
        if (valid.length === 0) return toast.error("No valid email addresses found in CSV.");
        // De-dupe against existing leads (unique index is on lower(email), so onConflict can't be used)
        const { data: existing } = await supabase.from("leads").select("email").in("email", valid.map(r => r.email));
        const existingSet = new Set((existing ?? []).map((r: any) => r.email.toLowerCase()));
        const toInsert = valid.filter(r => !existingSet.has(r.email));
        if (toInsert.length === 0) {
          toast.success(`No new leads — all ${valid.length} already exist${skippedInvalid ? `, ${skippedInvalid} invalid skipped` : ""}.`);
          return;
        }
        const { error } = await supabase.from("leads").insert(toInsert);
        if (error) return toast.error(error.message);
        toast.success(`Imported ${toInsert.length} leads${valid.length - toInsert.length ? `, ${valid.length - toInsert.length} duplicates skipped` : ""}${skippedInvalid ? `, ${skippedInvalid} invalid skipped` : ""}.`);
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
              <Button variant="outline" onClick={runVerify} disabled={verifying}>
                <ShieldCheck className="w-4 h-4 mr-2" /> {verifying ? "Verifying…" : `Verify (${selected.size})`}
              </Button>
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
                <th className="text-left p-3">Verify</th>
                <th className="text-left p-3">Icebreaker</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads?.map((l) => {
                const v = (l as any).verification_status as string | null;
                const vTone = v === "valid" ? "bg-success/15 text-success" : v === "invalid" ? "bg-destructive/15 text-destructive" : v === "risky" ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground";
                return (
                <tr key={l.id} className="border-t hover:bg-accent/40 cursor-pointer" onClick={(e) => { if ((e.target as HTMLElement).closest('button,input,[role=checkbox]')) return; setDetail(l); }}>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}><Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggle(l.id)} /></td>
                  <td className="p-3 font-medium">{l.email}</td>
                  <td className="p-3">{[l.first_name, l.last_name].filter(Boolean).join(" ")}</td>
                  <td className="p-3">{l.company}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${vTone}`}>{v ?? "unverified"}</span>
                  </td>
                  <td className="p-3 max-w-xs truncate text-muted-foreground" title={l.icebreaker ?? ""}>{l.icebreaker || <span className="text-xs italic">—</span>}</td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}><Button size="icon" variant="ghost" onClick={() => remove(l.id, l.email)}><Trash2 className="w-4 h-4" /></Button></td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Tip: use <code className="bg-muted px-1 rounded">{"{{icebreaker}}"}</code> in your campaign body to inject AI-generated openers.
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit lead</DialogTitle></DialogHeader>
          {detail && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Email</Label><Input value={detail.email ?? ""} onChange={(e) => setDetail({ ...detail, email: e.target.value })} /></div>
              <div><Label>First name</Label><Input value={detail.first_name ?? ""} onChange={(e) => setDetail({ ...detail, first_name: e.target.value })} /></div>
              <div><Label>Last name</Label><Input value={detail.last_name ?? ""} onChange={(e) => setDetail({ ...detail, last_name: e.target.value })} /></div>
              <div><Label>Company</Label><Input value={detail.company ?? ""} onChange={(e) => setDetail({ ...detail, company: e.target.value })} /></div>
              <div><Label>Title</Label><Input value={detail.title ?? ""} onChange={(e) => setDetail({ ...detail, title: e.target.value })} /></div>
              <div><Label>Website</Label><Input value={detail.website ?? ""} onChange={(e) => setDetail({ ...detail, website: e.target.value })} /></div>
              <div className="col-span-2"><Label>LinkedIn</Label><Input value={detail.linkedin ?? ""} onChange={(e) => setDetail({ ...detail, linkedin: e.target.value })} /></div>
              <div className="col-span-2"><Label>Icebreaker</Label><Input value={detail.icebreaker ?? ""} onChange={(e) => setDetail({ ...detail, icebreaker: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetail(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (!detail) return;
              const email = String(detail.email ?? "").toLowerCase().trim();
              if (!email) return toast.error("Email is required");
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email address");
              const website = String(detail.website ?? "").trim();
              if (website && !URL_RE.test(website)) return toast.error("Website must be a valid URL (https://example.com)");
              const linkedin = String(detail.linkedin ?? "").trim();
              if (linkedin && !LINKEDIN_RE.test(linkedin)) return toast.error("LinkedIn must be a linkedin.com URL");
              const { id, created_at, updated_at, user_id, custom_fields, ...patch } = detail;
              patch.email = email;
              patch.website = website || null;
              patch.linkedin = linkedin || null;
              const { error } = await supabase.from("leads").update(patch).eq("id", id);
              if (error) return toast.error(error.message);
              toast.success("Lead updated");
              setDetail(null);
              qc.invalidateQueries({ queryKey: ["leads"] });
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  );
}

function AddLeadDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", company: "", title: "", website: "", linkedin: "", icebreaker: "" });
  const save = async () => {
    const email = form.email.toLowerCase().trim();
    if (!email) return toast.error("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email address");
    const website = form.website.trim();
    if (website && !URL_RE.test(website)) return toast.error("Website must be a valid URL (https://example.com)");
    const linkedin = form.linkedin.trim();
    if (linkedin && !LINKEDIN_RE.test(linkedin)) return toast.error("LinkedIn must be a linkedin.com URL");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("leads").insert({ ...form, email, website: website || null, linkedin: linkedin || null, user_id: user.id });
    if (error) {
      if (/duplicate|unique/i.test(error.message)) return toast.error("This email already exists in your leads");
      return toast.error(error.message);
    }
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
          <div className="col-span-2"><Label>Icebreaker</Label><Textarea rows={3} value={form.icebreaker} onChange={(e) => setForm({ ...form, icebreaker: e.target.value })} /></div>
        </div>
        <DialogFooter><Button onClick={save}>Add</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
