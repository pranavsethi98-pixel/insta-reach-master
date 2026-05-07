import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Users, Mail, Copy, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteTeammate } from "@/lib/team.functions";

export const Route = createFileRoute("/team")({
  component: () => (
    <RequireAuth><AppShell><TeamPage /></AppShell></RequireAuth>
  ),
});

function TeamPage() {
  const qc = useQueryClient();
  const inviteFn = useServerFn(inviteTeammate);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [open, setOpen] = useState(false);

  const { data: workspaces } = useQuery({
    queryKey: ["my_workspaces"],
    queryFn: async () => (await supabase.from("workspaces").select("*").order("created_at")).data ?? [],
  });
  const ws = workspaces?.[0];

  const { data: members } = useQuery({
    queryKey: ["members", ws?.id],
    enabled: !!ws,
    queryFn: async () => (await supabase.from("workspace_members").select("*").eq("workspace_id", ws!.id)).data ?? [],
  });
  const { data: invites } = useQuery({
    queryKey: ["invites", ws?.id],
    enabled: !!ws,
    queryFn: async () => (await supabase.from("workspace_invites").select("*").eq("workspace_id", ws!.id).is("accepted_at", null)).data ?? [],
  });

  const sendInvite = async () => {
    if (!ws || !email) return;
    try {
      const res = await inviteFn({ data: { workspaceId: ws.id, email, role } });
      await navigator.clipboard.writeText(res.inviteUrl);
      toast.success("Invite created — link copied to clipboard");
      setEmail("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["invites", ws.id] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  const revoke = async (id: string) => {
    await supabase.from("workspace_invites").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["invites", ws?.id] });
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">Invite teammates to {ws?.name ?? "your workspace"}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><UserPlus className="w-4 h-4 mr-2" />Invite</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite teammate</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} placeholder="alice@company.com" /></div>
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={sendInvite}>Generate invite link</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 font-semibold"><Users className="w-4 h-4" />Members ({members?.length ?? 0})</div>
        <div className="space-y-2">
          {(members ?? []).map(m => (
            <div key={m.user_id} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm font-mono">{m.user_id.slice(0, 8)}…</span>
              <Badge>{m.role}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 font-semibold"><Mail className="w-4 h-4" />Pending invites ({invites?.length ?? 0})</div>
        <div className="space-y-2">
          {(invites ?? []).map(i => (
            <div key={i.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <div className="text-sm">{i.email}</div>
                <div className="text-xs text-muted-foreground">{i.role}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => copyLink(i.token)}><Copy className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => revoke(i.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {(!invites || invites.length === 0) && <p className="text-sm text-muted-foreground">No pending invites.</p>}
        </div>
      </Card>
    </div>
  );
}
