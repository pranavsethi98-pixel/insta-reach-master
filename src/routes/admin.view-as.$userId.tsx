import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { viewAsUser } from "@/lib/admin.functions";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/view-as/$userId")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const { userId } = Route.useParams();
  const f = useServerFn(viewAsUser);
  const { data } = useQuery({ queryKey: ["va", userId], queryFn: () => f({ data: { userId } }) });
  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  return (
    <div className="space-y-4">
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm"><Eye className="w-4 h-4" /> Viewing as <strong>{data.profile?.email}</strong> (read-only)</div>
        <Link to="/admin/users/$userId" params={{ userId }} className="text-sm hover:underline"><ArrowLeft className="w-4 h-4 inline" /> Back</Link>
      </div>
      <h1 className="text-3xl font-bold">{data.profile?.email}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat l="Plan" v={data.subscription?.plans?.name ?? "Free"} />
        <Stat l="Credits" v={data.credits} />
        <Stat l="Mailboxes" v={data.mailboxes.length} />
        <Stat l="Campaigns" v={data.campaigns.length} />
      </div>
      <Card title="Mailboxes">{data.mailboxes.map((m: any) => <Row key={m.id} a={m.label} b={m.from_email} c={<Badge variant={m.is_active ? "outline" : "destructive"}>{m.is_active ? "active" : "off"}</Badge>} />)}</Card>
      <Card title="Campaigns">{data.campaigns.map((c: any) => <Row key={c.id} a={c.name} b={new Date(c.created_at).toLocaleDateString()} c={<Badge>{c.status}</Badge>} />)}</Card>
      <Card title="Recent leads">{data.leads.slice(0, 30).map((l: any) => <Row key={l.id} a={l.email} b={`${l.first_name ?? ""} ${l.last_name ?? ""}`} c={<Badge variant="outline">{l.pipeline_stage}</Badge>} />)}</Card>
      <Card title="Recent conversations">{data.conversations.slice(0, 30).map((c: any) => <Row key={c.id} a={c.subject ?? "(no subject)"} b={c.classification ?? c.ai_category ?? "—"} c={<Badge variant="outline">{c.status}</Badge>} />)}</Card>
    </div>
  );
}
function Stat({ l, v }: any) { return <div className="bg-card border rounded-xl p-4"><div className="text-sm text-muted-foreground">{l}</div><div className="text-2xl font-bold">{v}</div></div>; }
function Card({ title, children }: any) { return <div className="bg-card border rounded-xl p-5"><h2 className="font-semibold mb-2">{title}</h2><div>{children}</div></div>; }
function Row({ a, b, c }: any) { return <div className="flex justify-between py-2 border-b last:border-0 text-sm"><div className="font-medium">{a}</div><div className="text-muted-foreground text-xs">{b}</div><div>{c}</div></div>; }
