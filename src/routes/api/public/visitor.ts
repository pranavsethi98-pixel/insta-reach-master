import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const Body = z.object({
  k: z.string().min(8).max(64),
  u: z.string().max(2000).optional(),
  r: z.string().max(2000).optional(),
  e: z.string().email().max(255).optional(),
});

export const Route = createFileRoute("/api/public/visitor")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = Body.parse(await request.json());
          const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
          const { data: pixel } = await supabase.from("visitor_pixels").select("id, user_id, is_active").eq("pixel_key", body.k).maybeSingle();
          if (!pixel || !pixel.is_active) return new Response("ok", { headers: cors });
          const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
          const ua = request.headers.get("user-agent") || null;
          await supabase.from("visitor_events").insert({
            user_id: pixel.user_id, pixel_id: pixel.id,
            url: body.u || null, referrer: body.r || null, ip, user_agent: ua,
            visitor_email: body.e || null,
          });
          return new Response("ok", { headers: cors });
        } catch {
          return new Response("ok", { headers: cors });
        }
      },
    },
  },
});
