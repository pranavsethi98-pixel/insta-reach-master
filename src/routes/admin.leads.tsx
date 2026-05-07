import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/leads")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});
function Page() {
  return <div><h1 className="text-3xl font-bold mb-4">Lead database</h1><p className="text-muted-foreground">SuperSearch usage, enrichment provider rates, and database health (wired to credit_ledger filtered by reason).</p></div>;
}
