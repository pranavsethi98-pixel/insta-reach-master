import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listCreditCosts, setCreditCost } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/admin/credits")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const f = useServerFn(listCreditCosts); const s = useServerFn(setCreditCost);
  const { data, refetch } = useQuery({ queryKey: ["credit-costs"], queryFn: () => f() });
  const m = useMutation({ mutationFn: async (fn: () => Promise<any>) => fn(), onSuccess: () => refetch() });
  const [action, setAction] = useState(""); const [cost, setCost] = useState("1");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Credit costs</h1>
      <div className="bg-card border rounded-xl p-5">
        <div className="flex gap-2 mb-4">
          <Input placeholder="action_name" value={action} onChange={(e) => setAction(e.target.value)} />
          <Input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className="w-32" />
          <Button onClick={() => m.mutate(() => s({ data: { action, cost: parseFloat(cost) } }))}>Save</Button>
        </div>
        <div className="space-y-1">
          {(data ?? []).map((c: any) => (
            <div key={c.action} className="flex justify-between py-2 border-b text-sm items-center">
              <div className="font-mono">{c.action}</div>
              <div className="flex items-center gap-2">
                <Input type="number" step="0.01" defaultValue={c.cost} className="w-24"
                  onBlur={(e) => { if (parseFloat(e.target.value) !== c.cost) m.mutate(() => s({ data: { action: c.action, cost: parseFloat(e.target.value) } })); }} />
                <span className="text-muted-foreground text-xs">credits</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
