import { createFileRoute } from "@tanstack/react-router";

// IMAP polling from Cloudflare Workers is not reliable (raw TCP/TLS limitations
// in the Worker runtime). This endpoint is a placeholder so the cron job
// doesn't 404. Reply detection is currently handled via:
//   - manual "mark as replied" in the inbox UI
//   - open/click tracking pixel (server route /api/public/track/open/:tracking_id)
// To enable real IMAP sync later, run a small Node worker outside the edge
// runtime and have it write to public.messages + public.conversations.

export const Route = createFileRoute("/api/public/imap-sync")({
  server: {
    handlers: {
      POST: async () => Response.json({ ok: true, note: "IMAP sync placeholder" }),
    },
  },
});
