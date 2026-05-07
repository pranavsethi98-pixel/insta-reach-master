import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/deliverability")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});
function Page() {
  return <div><h1 className="text-3xl font-bold mb-4">Deliverability</h1><p className="text-muted-foreground">IP reputation tracker and warmup network health are managed in <a className="underline" href="/admin/mailboxes">Mailboxes</a> and <a className="underline" href="/admin/compliance">Compliance</a>.</p></div>;
}
