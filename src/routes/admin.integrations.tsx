import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { platformAnalytics } from "@/lib/admin.functions";
import { Globe, Webhook, Calendar, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/integrations")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});
function Page() {
  const f = useServerFn(platformAnalytics);
  const { data } = useQuery({ queryKey: ["analytics-int"], queryFn: () => f() });
  const items = [
    { icon: Webhook, label: "Webhook endpoints", count: data?.webhooks ?? 0 },
    { icon: Calendar, label: "Calendly connections", count: data?.calendlyConnections ?? 0 },
    { icon: MessageSquare, label: "Slack connections", count: data?.slackConnections ?? 0 },
    { icon: Globe, label: "Visitor pixels installed", count: data?.visitorPixels ?? 0 },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Integrations</h1>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i.label} className="bg-card border rounded-xl p-4 flex items-center gap-4">
            <i.icon className="w-6 h-6 text-primary" />
            <div className="flex-1"><div className="text-sm text-muted-foreground">{i.label}</div><div className="text-2xl font-bold">{i.count}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
