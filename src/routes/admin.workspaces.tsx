import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/workspaces")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Workspaces</h1>
      <p className="text-muted-foreground">Each user account = one workspace. Manage owners, transfer, and archive from the user detail page.</p>
    </div>
  );
}
