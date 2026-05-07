import { createFileRoute, Navigate } from "@tanstack/react-router";

// User-facing route alias to the public unsub endpoint
export const Route = createFileRoute("/unsubscribe/$leadId")({
  component: () => {
    const { leadId } = Route.useParams();
    if (typeof window !== "undefined") {
      window.location.replace(`/api/public/unsubscribe/${leadId}`);
    }
    return null as any;
  },
});
