import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listUsers } from "@/lib/admin.functions";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/workspaces")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const f = useServerFn(listUsers);
  const { data } = useQuery({ queryKey: ["ws-users"], queryFn: () => f({ data: {} }) });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Workspaces</h1>
      <p className="text-muted-foreground text-sm">Each user account = one workspace. Click through to manage owners, plans, and credits.</p>
      <div className="bg-card border rounded-xl divide-y">
        {(data ?? []).map((u: any) => (
          <Link key={u.id} to="/admin/users/$userId" params={{ userId: u.id }} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{u.full_name ?? u.email}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{u.credits_balance ?? 0} credits · joined {new Date(u.created_at).toLocaleDateString()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
