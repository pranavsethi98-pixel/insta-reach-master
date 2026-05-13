import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listUsers } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin/users")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const fn = useServerFn(listUsers);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data } = useQuery({
    queryKey: ["admin-users", debouncedSearch],
    queryFn: () => fn({ data: { search: debouncedSearch } }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Input className="max-w-xs" placeholder="Search email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Plan</th>
              <th className="px-4 py-2">Roles</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u: any) => (
              <tr key={u.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-2">
                  <Link to="/admin/users/$userId" params={{ userId: u.id }} className="font-medium hover:underline">
                    {u.email}
                  </Link>
                  <div className="text-xs text-muted-foreground">{u.full_name}</div>
                </td>
                <td className="px-4 py-2">{u.subscription?.plans?.name ?? <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-2">
                  {u.roles.length === 0 ? <span className="text-muted-foreground">user</span> : u.roles.map((r: string) => <Badge key={r} variant="outline" className="mr-1">{r}</Badge>)}
                </td>
                <td className="px-4 py-2">{u.tags.map((t: string) => <Badge key={t} variant="secondary" className="mr-1">{t}</Badge>)}</td>
                <td className="px-4 py-2">
                  {u.flag?.is_banned && <Badge variant="destructive">banned</Badge>}
                  {u.flag?.is_suspended && <Badge variant="destructive">suspended</Badge>}
                  {!u.flag?.is_banned && !u.flag?.is_suspended && <Badge variant="outline">active</Badge>}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
