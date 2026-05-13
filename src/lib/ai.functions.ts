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
      .from("leads").select("*").in("id", data.leadIds).eq("user_id", context.userId);
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

      // Skip the API call entirely when there is no personalization signal —
      // the model would just hallucinate or return an empty string anyway.
      if (!ctx.trim()) {
        results.push({ id: lead.id, icebreaker: "" });
        continue;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15_000);
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          signal: controller.signal,
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You write one-sentence personalized cold-email openers. Output ONLY the sentence — no markdown, no asterisks, no bold, no bullet points, no quotes, no preamble, no placeholders like [Product Name] or {company}. If you have no real personalization signal, return an empty string. Max 20 words. No emojis." },
              { role: "user", content: `Write an icebreaker for:\n${ctx}` },
            ],
          }),
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          results.push({ id: lead.id, icebreaker: "" });
          continue;
        }
        const json: any = await res.json();
        let text = json?.choices?.[0]?.message?.content?.trim() ?? "";
        // Strip markdown bold/italic, leading list markers, surrounding quotes,
        // and reject outputs that still contain unfilled [Placeholder] tokens.
        text = text
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/\*(.+?)\*/g, "$1")
          .replace(/^\s*[-*•]\s+/, "")
          .replace(/^["'“”']+|["'“”']+$/g, "")
          .trim();
        if (/\[[A-Z][^\]]*\]|\{\{[^}]+\}\}/.test(text)) text = "";
        await supabase.from("leads").update({ icebreaker: text }).eq("id", lead.id);
        results.push({ id: lead.id, icebreaker: text });
      } catch {
        results.push({ id: lead.id, icebreaker: "" });
      }
    }
    return { results };
  });
