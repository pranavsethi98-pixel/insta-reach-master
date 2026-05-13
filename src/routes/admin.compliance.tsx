import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listBlacklist, addBlacklist, removeBlacklist, listAbuseFlags, listPlatformSettings, setPlatformSetting } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/compliance")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const fb = useServerFn(listBlacklist); const ab = useServerFn(addBlacklist); const rb = useServerFn(removeBlacklist);
  const fa = useServerFn(listAbuseFlags);
  const fs = useServerFn(listPlatformSettings); const ss = useServerFn(setPlatformSetting);
  const { data: bl, refetch: rbl } = useQuery({ queryKey: ["bl"], queryFn: () => fb() });
  const { data: af } = useQuery({ queryKey: ["af"], queryFn: () => fa() });
  const { data: settings, refetch: rs } = useQuery({ queryKey: ["ps"], queryFn: () => fs() });
  const m = useMutation({
    mutationFn: async (fn: () => Promise<any>) => fn(),
    onSuccess: () => { rbl(); rs(); },
    onError: (e: any) => toast.error(e?.message ?? "Action failed"),
  });

  const [kind, setKind] = useState<"email"|"domain"|"ip">("domain");
  const [value, setValue] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Compliance & abuse</h1>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Platform thresholds</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {(settings ?? []).map((s: any) => (
            <div key={s.key} className="flex items-center gap-2">
              <label className="text-sm font-mono w-48">{s.key}</label>
              <Input defaultValue={String(s.value).replace(/"/g, "")} className="w-32"
                onBlur={(e) => { const v = e.target.value; const parsed = isNaN(+v) ? v : +v; m.mutate(() => ss({ data: { key: s.key, value: parsed } })); }} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Global blacklist</h2>
        <div className="flex gap-2 mb-3">
          <select className="bg-background border rounded px-2" value={kind} onChange={(e) => setKind(e.target.value as any)}>
            <option value="domain">domain</option><option value="email">email</option><option value="ip">ip</option>
          </select>
          <Input placeholder="value" value={value} onChange={(e) => setValue(e.target.value)} />
          <Button onClick={() => {
            const v = value.trim();
            if (!v) { toast.error("Enter a value to block"); return; }
            m.mutate(() => ab({ data: { kind, value: v } }));
            setValue("");
          }}>Block</Button>
        </div>
        <div className="space-y-1">
          {(bl ?? []).map((b: any) => (
            <div key={b.id} className="flex justify-between py-2 border-b text-sm">
              <div><Badge variant="outline" className="mr-2">{b.kind}</Badge>{b.value}</div>
              <Button size="sm" variant="ghost" onClick={() => m.mutate(() => rb({ data: { id: b.id } }))}>Remove</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Abuse flags</h2>
        <div className="space-y-1">
          {(af ?? []).map((a: any) => (
            <div key={a.id} className="flex justify-between py-2 border-b text-sm">
              <div><Badge variant={a.severity === "high" ? "destructive" : "outline"} className="mr-2">{a.severity}</Badge>{a.kind} · {a.detail}</div>
              <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
            </div>
          ))}
          {!af?.length && <div className="text-sm text-muted-foreground">No abuse flags.</div>}
        </div>
      </div>
    </div>
  );
}
