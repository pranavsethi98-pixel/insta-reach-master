import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createServerClient } from "@/integrations/supabase/client.server";

export const captureLead = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      email: z.string().email().max(254),
      source: z.string().max(64).default("landing_playbook"),
      utm_source: z.string().max(64).optional(),
      utm_medium: z.string().max(64).optional(),
      utm_campaign: z.string().max(64).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = createServerClient();
    const { error } = await supabase.from("marketing_leads").insert({
      email: data.email.toLowerCase().trim(),
      source: data.source,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
