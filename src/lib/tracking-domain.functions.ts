import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import dns from "node:dns/promises";

export const verifyTrackingDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row } = await supabase.from("tracking_domains").select("*").eq("id", data.id).single();
    if (!row) throw new Error("Not found");
    let verified = false;
    let detail = "no_cname";
    try {
      const recs = await dns.resolveCname(row.domain);
      detail = `found:${recs.join(",")}`;
      verified = recs.some(r => r.toLowerCase().endsWith(row.cname_target.toLowerCase()));
    } catch (e: any) {
      detail = e?.code ?? "lookup_failed";
    }
    await supabase.from("tracking_domains").update({
      verified, last_checked_at: new Date().toISOString(),
    }).eq("id", data.id);
    return { verified, detail };
  });
