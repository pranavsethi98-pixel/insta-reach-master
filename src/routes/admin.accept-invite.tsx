import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { acceptAdminInvite } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/accept-invite")({
  validateSearch: (s: Record<string, unknown>) => ({ token: (s.token as string) ?? "" }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function Page() {
  const { token } = Route.useSearch();
  const accept = useServerFn(acceptAdminInvite);
  const nav = useNavigate();
  const [state, setState] = useState<"idle"|"loading"|"ok"|"err">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    setState("loading");
    accept({ data: { token } })
      .then((r: any) => { setState("ok"); setMsg(`Granted: ${r.role}`); })
      .catch((e: any) => { setState("err"); setMsg(e.message); });
  }, [token, accept]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-card border rounded-xl p-6 max-w-md space-y-3">
        <h1 className="text-xl font-bold">Admin invite</h1>
        <div className="text-sm text-muted-foreground">{state === "loading" ? "Accepting…" : msg}</div>
        {state === "ok" && <Button onClick={() => nav({ to: "/admin" })}>Go to admin</Button>}
      </div>
    </div>
  );
}
