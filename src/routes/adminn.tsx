import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/adminn")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
