// GHL inbound webhook. Configure in GHL → Settings → Webhooks.
// Optional shared secret: set GHL_WEBHOOK_SECRET; we compare it from
// the `x-ghl-secret` header (timing-safe). If unset, we accept all (dev).
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { timingSafeEqual } from "crypto";

function safeEq(a: string, b: string) {
  const A = Buffer.from(a); const B = Buffer.from(b);
  if (A.length !== B.length) return false;
  return timingSafeEqual(A, B);
}

export const Route = createFileRoute("/api/public/ghl-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.GHL_WEBHOOK_SECRET;
        if (secret) {
          const got = request.headers.get("x-ghl-secret") ?? "";
          if (!safeEq(got, secret)) return new Response("Unauthorized", { status: 401 });
        }
        let body: any = {};
        try { body = await request.json(); } catch { /* keep empty */ }
        const event = String(body?.type ?? body?.event ?? "unknown");
        const contactId = body?.contact?.id ?? body?.contactId ?? null;

        let userId: string | null = null;
        if (contactId) {
          const { data } = await supabaseAdmin
            .from("ghl_contact_map").select("user_id, lead_id")
            .eq("ghl_contact_id", contactId).maybeSingle();
          userId = (data as any)?.user_id ?? null;
        }

        await supabaseAdmin.from("ghl_sync_log").insert({
          user_id: userId,
          direction: "inbound",
          action: event,
          ghl_contact_id: contactId,
          status: "ok",
          http_status: 200,
          payload: body,
        } as any);

        return Response.json({ ok: true });
      },
    },
  },
});
