import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
export const Route = createFileRoute("/admin/visitors")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});
function Page() { return <div><h1 className="text-3xl font-bold mb-4">Website visitors</h1><p className="text-muted-foreground">Pixel installs and resolution rates are visible per-user in the user detail view.</p></div>; }
