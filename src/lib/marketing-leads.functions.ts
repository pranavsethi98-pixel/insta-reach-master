import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const captureLead = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      email: z.string().email().max(254),
      source: z.string().max(64).default("landing"),
      lead_magnet_slug: z.string().max(64).optional(),
      utm_source: z.string().max(64).optional(),
      utm_medium: z.string().max(64).optional(),
      utm_campaign: z.string().max(64).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    const { error } = await supabaseAdmin.from("marketing_leads").insert({
      email,
      source: data.source,
      lead_magnet_slug: data.lead_magnet_slug ?? null,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      delivered_at: data.lead_magnet_slug ? new Date().toISOString() : null,
    });
    if (error && !/duplicate key/i.test(error.message)) throw new Error(error.message);

    let file_url: string | null = null;
    if (data.lead_magnet_slug) {
      const { data: lm } = await supabaseAdmin
        .from("lead_magnets")
        .select("file_url")
        .eq("slug", data.lead_magnet_slug)
        .eq("is_published", true)
        .maybeSingle();
      file_url = lm?.file_url ?? null;
    }
    return { ok: true, file_url };
  });

export const listLeadMagnets = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("lead_magnets")
      .select("slug,title,subtitle,description,cover_image_url,page_count,file_size_kb,category,sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { magnets: data ?? [] };
  });
