import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/track/click/$trackingId")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const dest = url.searchParams.get("u") || "/";
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );

        const { data: log } = await supabase
          .from("send_log")
          .select("id,user_id,campaign_id,lead_id,click_count")
          .eq("tracking_id", params.trackingId)
          .maybeSingle();

        if (log) {
          await supabase.from("send_log").update({
            clicked_at: new Date().toISOString(),
            click_count: (log.click_count ?? 0) + 1,
          }).eq("id", log.id);

          await supabase.from("click_events").insert({
            user_id: log.user_id,
            send_log_id: log.id,
            campaign_id: log.campaign_id,
            lead_id: log.lead_id,
            url: dest,
            user_agent: request.headers.get("user-agent") ?? null,
          });
        }

        return new Response(null, { status: 302, headers: { Location: dest } });
      },
    },
  },
});
