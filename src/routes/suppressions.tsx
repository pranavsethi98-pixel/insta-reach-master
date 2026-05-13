import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Ban } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/suppressions")({
  component: () => (
    <RequireAuth><AppShell><Page /></AppShell></RequireAuth>
  ),
});

function Page() {
  const qc = useQueryClient();
  const [val, setVal] = useState("");
  const { confirm, dialog: confirmDialog } = useConfirm();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["suppressions"],
    queryFn: async () => (await supabase.from("suppressions").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const add = async () => {
    const v = val.trim().toLowerCase();
    if (!v) return;
    const isDomain = !v.includes("@");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domainRe = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
    if (isDomain ? !domainRe.test(v) : !emailRe.test(v)) {
      return toast.error("Enter a valid email or domain");
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Duplicate check
    const dup = (rows ?? []).find((r: any) => (isDomain ? r.domain === v : r.email === v));
    if (dup) return toast.error("Already suppressed");
    const { error } = await supabase.from("suppressions").insert({
      user_id: user.id,
      ...(isDomain ? { domain: v } : { email: v }),
      reason: "manual",
    });
    if (error) return toast.error(error.message);
    setVal("");
    toast.success(isDomain ? "Domain blocked" : "Email blocked");
    qc.invalidateQueries({ queryKey: ["suppressions"] });
  };
  const remove = async (id: string, target: string) => {
    const ok = await confirm({
      title: `Remove suppression for "${target}"?`,
      description: "This address will be eligible for campaigns again.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!ok) return;
    await supabase.from("suppressions").delete().eq("id", id);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["suppressions"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Ban className="w-7 h-7" /> Suppressions
        </h1>
        <p className="text-muted-foreground mt-1">Email addresses or whole domains that will never be contacted.</p>
      </div>
      <div className="bg-card border rounded-xl p-5 flex gap-2">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="user@example.com or example.com" onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button onClick={add}><Plus className="w-4 h-4 mr-2" /> Add</Button>
      </div>
      <div className="bg-card border rounded-xl divide-y">
        {isLoading && [1,2,3].map(i => <div key={i} className="p-4 h-12 animate-pulse bg-muted/30" />)}
        {(rows ?? []).length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No suppressions.</div>}
        {rows?.map(r => (
          <div key={r.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.email || r.domain}</div>
              <div className="text-xs text-muted-foreground">{r.email ? "Email" : "Domain"} · {r.reason} · {new Date(r.created_at).toLocaleDateString()}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => remove(r.id, r.email || r.domain)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
      {confirmDialog}
    </div>
  );
}
