import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { pushTemplate } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/admin/content")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const f = useServerFn(pushTemplate);
  const m = useMutation({ mutationFn: async (fn: () => Promise<any>) => fn() });
  const [t, setT] = useState({ title: "", subject: "", body: "", category: "Outbound", planCodes: "" });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content & templates</h1>
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Push template to users</h2>
        <Input placeholder="Title" value={t.title} onChange={(e) => setT({...t, title: e.target.value})} />
        <Input placeholder="Subject (optional)" value={t.subject} onChange={(e) => setT({...t, subject: e.target.value})} />
        <Textarea rows={6} placeholder="Body" value={t.body} onChange={(e) => setT({...t, body: e.target.value})} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Category" value={t.category} onChange={(e) => setT({...t, category: e.target.value})} />
          <Input placeholder="Plan codes (comma) or empty for all" value={t.planCodes} onChange={(e) => setT({...t, planCodes: e.target.value})} />
        </div>
        <Button onClick={async () => {
          const r: any = await m.mutateAsync(() => f({ data: {
            title: t.title, subject: t.subject || undefined, body: t.body, category: t.category,
            planCodes: t.planCodes ? t.planCodes.split(",").map(s => s.trim()).filter(Boolean) : undefined,
          } }));
          alert(`Pushed to ${r.recipients} users`);
          setT({ title: "", subject: "", body: "", category: "Outbound", planCodes: "" });
        }}>Push</Button>
      </div>
    </div>
  );
}
