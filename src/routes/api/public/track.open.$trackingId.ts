import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// 1x1 transparent gif
const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

export const Route = createFileRoute("/api/public/track/open/$trackingId")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );
        try {
          const { data: log } = await supabase
            .from("send_log")
            .select("*")
            .eq("tracking_id", params.trackingId)
            .maybeSingle();
          if (log) {
            if (!log.opened_at) {
              await supabase.from("send_log")
                .update({ opened_at: new Date().toISOString() })
                .eq("id", log.id);
            }
            await supabase.from("email_events").insert({
              user_id: log.user_id,
              send_log_id: log.id,
              campaign_id: log.campaign_id,
              lead_id: log.lead_id,
              mailbox_id: log.mailbox_id,
              event_type: "open",
              user_agent: request.headers.get("user-agent"),
            });
          }
        } catch { /* swallow tracking errors */ }
        return new Response(PIXEL, {
          headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
          },
        });
      },
    },
  },
});
