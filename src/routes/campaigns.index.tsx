import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type MouseEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Send, Clock, Activity, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState, StatusPill } from "@/components/app/PageHeader";
import { useConfirm } from "@/components/ConfirmDialog";
import { smartTruncate } from "@/lib/utils";

export const Route = createFileRoute("/campaigns/")({
  component: () => (
    <RequireAuth><AppShell><CampaignsList /></AppShell></RequireAuth>
  ),
});

function CampaignsList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) return toast.error("Campaign name is required");
    if (trimmed.length > 120) return toast.error("Name must be 120 characters or fewer");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Not signed in");
    setCreating(true);
    const { data, error } = await supabase.from("campaigns").insert({ user_id: user.id, name: trimmed }).select().single();
    setCreating(false);
    if (error) return toast.error(error.message);
    setOpen(false); setName("");
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    navigate({ to: "/campaigns/$id", params: { id: data.id } });
  };

  const removeCampaign = async (id: string, cName: string) => {
    const ok = await confirm({
      title: `Delete campaign "${cName}"?`,
      description: "All sequence steps, lead assignments, and analytics for this campaign will be permanently removed. This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    toast.success("Campaign deleted");
  };

  const tone = (s: string) =>
    s === "active" ? "ok" : s === "paused" ? "warn" : s === "completed" ? "primary" : "neutral";

  const total = campaigns?.length ?? 0;
  const active = campaigns?.filter(c => c.status === "active").length ?? 0;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Outbound"
        title="Campaigns"
        desc="Multi-step email sequences across all your mailboxes."
        meta={
          <>
            <span>{total} total</span>
            <span className="text-success">{active} active</span>
          </>
        }
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-glow"><Plus className="w-4 h-4 mr-1.5" /> New campaign</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create campaign</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Q4 outbound"
                  onKeyDown={(e) => { if (e.key === "Enter") create(); }}
                  autoFocus
                />
                {name.length > 0 && !name.trim() && (
                  <p className="text-xs text-destructive">Name can't be just spaces.</p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={create} className="rounded-full" disabled={creating}>
                  {creating ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {campaignsLoading && (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />)}
        </div>
      )}

      {!campaignsLoading && campaigns?.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No campaigns yet"
          desc="Build your first multi-step sequence in 30 seconds with the AI Copilot, or start from scratch."
          action={
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setOpen(true)} className="rounded-full"><Plus className="w-4 h-4 mr-1.5" /> Blank campaign</Button>
              <Link to="/copilot"><Button variant="outline" className="rounded-full">Use AI Copilot</Button></Link>
            </div>
          }
        />
      ) : !campaignsLoading && (
        <div className="grid gap-3">
          {campaigns?.map((c) => (
            <div
              key={c.id}
              className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all flex items-center gap-4"
            >
              <Link
                to="/campaigns/$id"
                params={{ id: c.id }}
                className="flex items-center gap-4 flex-1 min-w-0"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow transition-all">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" title={c.name}>{smartTruncate(c.name, 90)}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 font-mono">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {c.send_window_start != null && c.send_window_end != null ? `${c.send_window_start}:00 – ${c.send_window_end}:00 ${c.timezone || "UTC"}` : "No send window set"}</span>
                    <span>limit · {c.daily_send_limit ?? "—"}/day</span>
                  </div>
                </div>
              </Link>
              <StatusPill tone={tone(c.status) as any}>{c.status}</StatusPill>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); removeCampaign(c.id, c.name); }}
                title="Delete campaign"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {confirmDialog}
    </div>
  );
}
