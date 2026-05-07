import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Conditions over send_log for a lead within a time window.
// field: opened_count | clicked_count | replied_count | sent_count | bounced
// op: gte | lte | eq
type Condition = { field: string; op: "gte" | "lte" | "eq"; value: number; window_days?: number };
type Action =
  | { type: "set_stage"; stage: string }
  | { type: "add_to_campaign"; campaign_id: string }
  | { type: "add_tag"; tag: string }
  | { type: "webhook" };

function within(rows: any[], days?: number) {
  if (!days) return rows;
  const cutoff = Date.now() - days * 86400000;
  return rows.filter((r) => +new Date(r.sent_at) >= cutoff);
}

function aggregate(rows: any[]): Record<string, number> {
  return {
    sent_count: rows.length,
    opened_count: rows.filter((r) => r.opened_at).length,
    clicked_count: rows.filter((r) => r.clicked_at).length,
    replied_count: rows.filter((r) => r.replied_at).length,
    bounced: rows.filter((r) => r.bounced_at).length,
  };
}

function check(value: number, op: "gte" | "lte" | "eq", target: number) {
  if (op === "gte") return value >= target;
  if (op === "lte") return value <= target;
  return value === target;
}

export const runSalesflows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: flows } = await supabase.from("salesflows").select("*").eq("user_id", userId).eq("is_active", true);
    if (!flows?.length) return { matched: 0 };

    const { data: leads } = await supabase.from("leads").select("id, pipeline_stage, custom_fields").eq("user_id", userId);
    if (!leads?.length) return { matched: 0 };

    const { data: log } = await supabase.from("send_log").select("lead_id, sent_at, opened_at, clicked_at, replied_at, bounced_at").eq("user_id", userId);
    const byLead: Record<string, any[]> = {};
    for (const r of log ?? []) {
      if (!r.lead_id) continue;
      (byLead[r.lead_id] ||= []).push(r);
    }

    const { data: existing } = await supabase.from("salesflow_matches").select("salesflow_id, lead_id").eq("user_id", userId);
    const seen = new Set((existing ?? []).map((m) => `${m.salesflow_id}:${m.lead_id}`));

    let matched = 0;
    for (const flow of flows) {
      const conds: Condition[] = (flow.conditions as any) ?? [];
      const actions: Action[] = (flow.actions as any) ?? [];
      for (const lead of leads) {
        const key = `${flow.id}:${lead.id}`;
        if (seen.has(key)) continue;
        const rows = byLead[lead.id] ?? [];
        const ok = conds.length > 0 && conds.every((c) => {
          const slice = within(rows, c.window_days);
          const agg = aggregate(slice);
          const v = (agg as any)[c.field] ?? 0;
          return check(v, c.op, c.value);
        });
        if (!ok) continue;
        matched++;
        await supabase.from("salesflow_matches").insert({ salesflow_id: flow.id, lead_id: lead.id, user_id: userId });
        for (const a of actions) {
          if (a.type === "set_stage") {
            await supabase.from("leads").update({ pipeline_stage: a.stage }).eq("id", lead.id);
          } else if (a.type === "add_to_campaign") {
            await supabase.from("campaign_leads").insert({ campaign_id: a.campaign_id, lead_id: lead.id }).then(() => null, () => null);
          } else if (a.type === "add_tag") {
            const cf = (lead.custom_fields as any) || {};
            const tags = new Set([...(cf.tags || []), a.tag]);
            await supabase.from("leads").update({ custom_fields: { ...cf, tags: [...tags] } }).eq("id", lead.id);
          }
        }
      }
    }
    return { matched };
  });

export const saveSalesflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
    conditions: z.array(z.any()),
    actions: z.array(z.any()),
    is_active: z.boolean().optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.id) {
      await supabase.from("salesflows").update({
        name: data.name, description: data.description, conditions: data.conditions,
        actions: data.actions, is_active: data.is_active ?? true,
      }).eq("id", data.id).eq("user_id", userId);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("salesflows").insert({
      user_id: userId, name: data.name, description: data.description,
      conditions: data.conditions, actions: data.actions, is_active: data.is_active ?? true,
    }).select().single();
    if (error) throw error;
    return { id: row.id };
  });
