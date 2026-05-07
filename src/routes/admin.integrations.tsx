import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
export const Route = createFileRoute("/admin/integrations")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});
function Page() { return <div><h1 className="text-3xl font-bold mb-4">Integrations</h1><p className="text-muted-foreground">Per-user webhook and API connections are managed under user detail. Platform-wide rate limits live in Compliance.</p></div>; }
