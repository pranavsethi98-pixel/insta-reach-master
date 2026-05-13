import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { getUserDetail, setUserFlag, sendPasswordReset, addUserNote, tagUser, adjustCredits, assignPlan, listPlans, deleteUser } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, KeyRound, Ban, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useConfirm } from "@/components/ConfirmDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$userId")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const fetchD = useServerFn(getUserDetail);
  const fetchP = useServerFn(listPlans);
  const flag = useServerFn(setUserFlag);
  const reset = useServerFn(sendPasswordReset);
  const note = useServerFn(addUserNote);
  const tag = useServerFn(tagUser);
  const credits = useServerFn(adjustCredits);
  const assign = useServerFn(assignPlan);
  const del = useServerFn(deleteUser);

  const { data, refetch } = useQuery({ queryKey: ["admin-user", userId], queryFn: () => fetchD({ data: { userId } }) });
  const { data: plans } = useQuery({ queryKey: ["admin-plans"], queryFn: () => fetchP() });

  const [noteBody, setNoteBody] = useState("");
  const [tagVal, setTagVal] = useState("");
  const [creditDelta, setCreditDelta] = useState("100");
  const [creditReason, setCreditReason] = useState("Manual top-up");

  const { confirm, dialog: confirmDialog } = useConfirm();
  const m = useMutation({
    mutationFn: async (fn: () => Promise<any>) => fn(),
    onSuccess: () => refetch(),
    onError: (e: any) => toast.error(e?.message ?? "Action failed"),
  });

  if (!data) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> All users
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{data.profile?.email}</h1>
          <p className="text-muted-foreground">{data.profile?.full_name} · {data.profile?.company_name}</p>
          <div className="flex gap-2 mt-2">
            {data.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            {data.roles.map((r) => <Badge key={r} variant="outline">{r}</Badge>)}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/view-as/$userId" params={{ userId }}>
            <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" /> View as</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => m.mutate(() => reset({ data: { email: data.profile!.email! } }))}>
            <KeyRound className="w-4 h-4 mr-1" /> Reset password
          </Button>
          <Button variant="outline" size="sm" onClick={() => m.mutate(() => flag({ data: { userId, suspend: !data.flag?.is_suspended } }))}>
            <Ban className="w-4 h-4 mr-1" /> {data.flag?.is_suspended ? "Unsuspend" : "Suspend"}
          </Button>
          <Button variant="destructive" size="sm" onClick={async () => {
            const ok = await confirm({
              title: "Permanently delete user?",
              description: "This will delete the account and all their data. This cannot be undone.",
              confirmLabel: "Delete permanently",
              destructive: true,
            });
            if (ok) {
              try {
                await del({ data: { userId } });
                toast.success("User deleted");
                navigate({ to: "/admin/users" });
              } catch (e: any) {
                toast.error(e?.message ?? "Failed to delete user");
              }
            }
          }}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Credits" value={data.credits} />
        <Stat label="Mailboxes" value={data.mailboxes.length} />
        <Stat label="Campaigns" value={data.campaigns.length} sub={`${data.leadCount} leads`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Subscription</h2>
          <div className="text-sm">
            Current: <span className="font-medium">{data.subscription?.plans?.name ?? "Free"}</span>
          </div>
          <div className="flex gap-2">
            {(plans ?? []).map((p: any) => (
              <Button key={p.id} size="sm" variant="outline"
                onClick={() => m.mutate(() => assign({ data: { userId, planId: p.id } }))}>
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Adjust credits</h2>
          <div className="flex gap-2">
            <Input type="number" value={creditDelta} onChange={(e) => setCreditDelta(e.target.value)} />
            <Input value={creditReason} onChange={(e) => setCreditReason(e.target.value)} placeholder="Reason" />
            <Button onClick={() => m.mutate(() => credits({ data: { userId, delta: parseInt(creditDelta) || 0, reason: creditReason } }))}>Apply</Button>
          </div>
          <div className="text-xs text-muted-foreground">Use negative numbers to deduct.</div>
        </div>

        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Tags</h2>
          <div className="flex gap-2">
            <Input value={tagVal} onChange={(e) => setTagVal(e.target.value)} placeholder="VIP, at-risk…" />
            <Button onClick={() => { if (tagVal) { m.mutate(() => tag({ data: { userId, tag: tagVal } })); setTagVal(""); } }}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.tags.map((t) => (
              <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => m.mutate(() => tag({ data: { userId, tag: t, remove: true } }))}>
                {t} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Internal note</h2>
          <Textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Visible only to admins" rows={3} />
          <Button size="sm" onClick={() => { if (noteBody) { m.mutate(() => note({ data: { userId, body: noteBody } })); setNoteBody(""); } }}>Save note</Button>
        </div>
      </div>

      <Section title="Notes" empty="No notes.">
        {data.notes.map((n) => (
          <div key={n.id} className="border-b last:border-0 py-2 text-sm">
            <div>{n.body}</div>
            <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
          </div>
        ))}
      </Section>

      <Section title="Payment history" empty="No payments.">
        {data.payments.map((p) => (
          <div key={p.id} className="flex justify-between border-b last:border-0 py-2 text-sm">
            <div>${(p.amount_cents / 100).toFixed(2)} <Badge variant="outline" className="ml-2">{p.status}</Badge></div>
            <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
          </div>
        ))}
      </Section>

      <Section title="Credit ledger" empty="No transactions.">
        {data.ledger.slice(0, 30).map((l) => (
          <div key={l.id} className="flex justify-between border-b last:border-0 py-2 text-sm">
            <div className={l.delta >= 0 ? "text-green-500" : "text-red-500"}>{l.delta >= 0 ? "+" : ""}{l.delta} <span className="text-muted-foreground ml-2">{l.reason}</span></div>
            <div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</div>
          </div>
        ))}
      </Section>

      <Section title="Login history" empty="No logins recorded.">
        {data.logins.map((l) => (
          <div key={l.id} className="flex justify-between border-b last:border-0 py-2 text-sm">
            <div>{l.ip ?? "—"} · <span className="text-muted-foreground">{l.user_agent}</span></div>
            <div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</div>
          </div>
        ))}
      </Section>
      {confirmDialog}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: any; sub?: string }) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  return (
    <div className="bg-card border rounded-xl p-5">
      <h2 className="font-semibold mb-2">{title}</h2>
      {arr.length === 0 ? <div className="text-sm text-muted-foreground">{empty}</div> : <div>{children}</div>}
    </div>
  );
}
