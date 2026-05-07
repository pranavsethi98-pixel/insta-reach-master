import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listSubsequences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ campaignId: z.string().uuid().optional() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase.from("subsequences").select("*, steps:subsequence_steps(*)").order("created_at", { ascending: false });
    if (data.campaignId) q = q.eq("parent_campaign_id", data.campaignId);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { items: rows ?? [] };
  });

const StepSchema = z.object({
  step_order: z.number(),
  delay_days: z.number().min(0).max(60),
  subject: z.string().max(255),
  body: z.string().max(10000),
});

export const upsertSubsequence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    id: z.string().uuid().optional(),
    parent_campaign_id: z.string().uuid(),
    name: z.string().min(1).max(120),
    trigger_event: z.enum(["opened", "clicked", "replied", "not_opened", "not_replied"]),
    trigger_after_days: z.number().min(0).max(60),
    trigger_step: z.number().nullable().optional(),
    is_active: z.boolean().default(true),
    steps: z.array(StepSchema).max(10),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { steps, id, ...payload } = data;
    let subId = id;
    if (subId) {
      await supabase.from("subsequences").update(payload).eq("id", subId);
      await supabase.from("subsequence_steps").delete().eq("subsequence_id", subId);
    } else {
      const { data: created, error } = await supabase.from("subsequences").insert({ ...payload, user_id: userId }).select().single();
      if (error) throw error;
      subId = created.id;
    }
    if (steps.length) {
      await supabase.from("subsequence_steps").insert(steps.map(s => ({ ...s, subsequence_id: subId })));
    }
    return { id: subId };
  });

export const deleteSubsequence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await context.supabase.from("subsequences").delete().eq("id", data.id);
    return { ok: true };
  });
