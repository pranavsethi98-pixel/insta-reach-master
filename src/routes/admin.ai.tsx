import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listLlmProviders, upsertLlmProvider } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ai")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const f = useServerFn(listLlmProviders); const u = useServerFn(upsertLlmProvider);
  const { data, refetch } = useQuery({ queryKey: ["llm"], queryFn: () => f() });
  const m = useMutation({
    mutationFn: async (fn: () => Promise<any>) => fn(),
    onSuccess: () => { refetch(); toast.success("Saved"); },
    onError: (e: any) => toast.error(e?.message ?? "Action failed"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">AI controls</h1>
        <Button onClick={() => m.mutate(() => u({ data: { name: "openai", default_model: "gpt-4o-mini", is_enabled: true, byok_allowed: false } }))}>+ Provider</Button>
      </div>
      <div className="bg-card border rounded-xl p-5">
        <p className="text-sm text-muted-foreground mb-3">Providers configured. Lovable AI Gateway is used by default — no API keys needed.</p>
        <div className="space-y-2">
          {(data ?? []).map((p: any) => (
            <div key={p.id} className="flex justify-between items-center py-2 border-b">
              <div>
                <div className="font-medium">{p.name} <Badge variant="outline" className="ml-2">{p.default_model}</Badge></div>
                <div className="text-xs text-muted-foreground">cap: {p.monthly_token_cap ?? "—"} tokens · BYOK: {p.byok_allowed ? "yes" : "no"}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => m.mutate(() => u({ data: { ...p, byok_allowed: !p.byok_allowed } }))}>Toggle BYOK</Button>
                <Button size="sm" variant="outline" onClick={() => m.mutate(() => u({ data: { ...p, is_enabled: !p.is_enabled } }))}>{p.is_enabled ? "Disable" : "Enable"}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
