import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-copilot")({
  component: () => <Navigate to="/copilot" />,
});
