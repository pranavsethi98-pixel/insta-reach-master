import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/unsubscribe/$leadId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        // Validate leadId is a UUID before hitting the DB
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_RE.test(params.leadId)) {
          return new Response("Invalid request", { status: 400 });
        }
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );
        const { data: lead } = await supabase
          .from("leads").select("id,user_id,email").eq("id", params.leadId).maybeSingle();
        if (lead) {
          await supabase.from("suppressions").insert({
            user_id: lead.user_id, email: lead.email.toLowerCase(), reason: "unsubscribe",
          });
        }
        return new Response(
          `<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribed</title>
          <style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#0f172a}
          .c{max-width:420px;text-align:center;padding:32px;background:white;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
          h1{font-size:20px;margin:0 0 8px}p{color:#64748b;margin:0}</style></head>
          <body><div class="c"><h1>You're unsubscribed ✓</h1><p>You won't receive further emails from this sender.</p></div></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      },
    },
  },
});
