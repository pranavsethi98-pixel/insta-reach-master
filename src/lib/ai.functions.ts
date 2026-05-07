import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const generateIcebreakers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ leadIds: z.array(z.string().uuid()).min(1).max(50) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

    const { data: leads, error } = await supabase
      .from("leads").select("*").in("id", data.leadIds);
    if (error) throw error;

    const results: { id: string; icebreaker: string }[] = [];
    for (const lead of leads ?? []) {
      const ctx = [
        lead.first_name && `Name: ${lead.first_name} ${lead.last_name ?? ""}`,
        lead.title && `Title: ${lead.title}`,
        lead.company && `Company: ${lead.company}`,
        lead.website && `Website: ${lead.website}`,
        lead.linkedin && `LinkedIn: ${lead.linkedin}`,
      ].filter(Boolean).join("\n");

      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You write one-sentence personalized cold-email openers. Keep it natural, specific, max 20 words. No emojis. No fluff. Output ONLY the sentence." },
              { role: "user", content: `Write an icebreaker for:\n${ctx}` },
            ],
          }),
        });
        if (!res.ok) {
          results.push({ id: lead.id, icebreaker: "" });
          continue;
        }
        const json: any = await res.json();
        const text = json?.choices?.[0]?.message?.content?.trim() ?? "";
        await supabase.from("leads").update({ icebreaker: text }).eq("id", lead.id);
        results.push({ id: lead.id, icebreaker: text });
      } catch {
        results.push({ id: lead.id, icebreaker: "" });
      }
    }
    return { results };
  });
