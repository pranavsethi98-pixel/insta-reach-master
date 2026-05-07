import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/campaigns/")({
  component: () => (
    <RequireAuth><AppShell><CampaignsList /></AppShell></RequireAuth>
  ),
});

function CampaignsList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const create = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim()) return;
    const { data, error } = await supabase.from("campaigns").insert({ user_id: user.id, name }).select().single();
    if (error) return toast.error(error.message);
    setOpen(false); setName("");
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    navigate({ to: "/campaigns/$id", params: { id: data.id } });
  };

  const statusColor = (s: string) => ({
    draft: "bg-muted",
    active: "bg-success/15 text-success",
    paused: "bg-warning/15 text-warning-foreground",
    completed: "bg-accent",
  } as Record<string, string>)[s] ?? "bg-muted";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Multi-step email sequences.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New campaign</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create campaign</DialogTitle></DialogHeader>
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q2 outbound" /></div>
            <DialogFooter><Button onClick={create}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns?.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Send className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No campaigns yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {campaigns?.map((c) => (
            <Link key={c.id} to="/campaigns/$id" params={{ id: c.id }} className="bg-card border rounded-xl p-5 hover:border-primary transition-colors">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{c.name}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(c.status)}`}>{c.status}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Window {c.send_window_start}:00 – {c.send_window_end}:00
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
