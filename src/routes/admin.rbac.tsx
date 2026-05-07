import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listAdminInvites, inviteAdmin, listUsers, grantRole, revokeRole } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const Route = createFileRoute("/admin/rbac")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

const ROLES = ["super_admin", "billing_admin", "support_admin", "read_only_admin"] as const;

function Page() {
  const fi = useServerFn(listAdminInvites); const inv = useServerFn(inviteAdmin);
  const fu = useServerFn(listUsers); const gr = useServerFn(grantRole); const rv = useServerFn(revokeRole);
  const { data: invites, refetch: ri } = useQuery({ queryKey: ["invites"], queryFn: () => fi() });
  const { data: users, refetch: ru } = useQuery({ queryKey: ["users-rbac"], queryFn: () => fu({ data: {} }) });
  const m = useMutation({ mutationFn: async (fn: () => Promise<any>) => fn(), onSuccess: () => { ri(); ru(); } });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<typeof ROLES[number]>("support_admin");

  const admins = (users ?? []).filter((u: any) => u.roles.length > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admins & Roles</h1>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Invite admin</h2>
        <div className="flex gap-2">
          <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="bg-background border rounded px-3" value={role} onChange={(e) => setRole(e.target.value as any)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button onClick={async () => {
            try {
              const out: any = await inv({ data: { email, role } });
              alert(`Invite link: ${window.location.origin}/admin/accept-invite?token=${out.token}`);
              setEmail("");
              ri();
            } catch (e: any) { alert(e.message); }
          }}>Invite</Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Active admins</h2>
        <div className="space-y-1">
          {admins.map((u: any) => (
            <div key={u.id} className="flex justify-between items-center py-2 border-b text-sm">
              <div>
                <div className="font-medium">{u.email}</div>
                <div className="flex gap-1 mt-1">{u.roles.map((r: string) => (
                  <Badge key={r} variant="outline" className="cursor-pointer" onClick={() => {
                    if (confirm(`Revoke ${r} from ${u.email}?`)) m.mutate(() => rv({ data: { userId: u.id, role: r as any } }));
                  }}>{r} ×</Badge>
                ))}</div>
              </div>
              <select className="bg-background border rounded px-2 py-1 text-xs" defaultValue=""
                onChange={(e) => { if (e.target.value) { m.mutate(() => gr({ data: { userId: u.id, role: e.target.value as any } })); e.target.value = ""; } }}>
                <option value="">+ add role…</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Pending invites</h2>
        <div className="space-y-1">
          {(invites ?? []).filter((i: any) => !i.accepted_at).map((i: any) => (
            <div key={i.id} className="flex justify-between py-2 border-b text-sm">
              <div>{i.email} · <Badge variant="outline">{i.role}</Badge></div>
              <code className="text-xs text-muted-foreground">{i.token.slice(0,16)}…</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
