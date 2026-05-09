import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(messages: any[], tools?: any[], tool_choice?: any) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, ...(tools ? { tools, tool_choice } : {}) }),
  });
  if (res.status === 429) throw new Error("Rate limited. Try again in a minute.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  return res.json();
}

// Prompt-to-campaign: generates ICP, subject lines, and a 3–4 step sequence.
export const generateCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    prompt: z.string().min(5).max(2000),
    saveAsCampaign: z.boolean().optional(),
    name: z.string().max(120).optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase.from("profiles").select("business_context, company_name, website_url, full_name").eq("id", userId).maybeSingle();
    const ctx = [
      prof?.company_name && `My company: ${prof.company_name}`,
      prof?.website_url && `Website: ${prof.website_url}`,
      prof?.business_context && `Context: ${prof.business_context}`,
    ].filter(Boolean).join("\n");

    const tools = [{
      type: "function",
      function: {
        name: "build_campaign",
        description: "Generate a cold-email outreach campaign brief.",
        parameters: {
          type: "object",
          properties: {
            icp: {
              type: "object",
              properties: {
                titles: { type: "array", items: { type: "string" } },
                industries: { type: "array", items: { type: "string" } },
                company_size: { type: "string" },
                pain_points: { type: "array", items: { type: "string" } },
              },
              required: ["titles", "industries", "pain_points"],
            },
            subject_variants: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
            steps: {
              type: "array", minItems: 3, maxItems: 4,
              items: {
                type: "object",
                properties: {
                  delay_days: { type: "number" },
                  subject: { type: "string" },
                  body: { type: "string" },
                  condition: { type: "string", enum: ["always", "if_not_replied", "if_opened", "if_not_opened", "if_clicked"] },
                },
                required: ["delay_days", "subject", "body", "condition"],
              },
            },
          },
          required: ["icp", "subject_variants", "steps"],
        },
      },
    }];

    const sys = `You are an elite cold-email strategist. Write short, human, specific outreach.
- 60-90 words per email max
- No buzzwords, no "I hope this finds you well"
- Use {{first_name}} and {{company}} merge tags
- Include {spintax|spin tax|variations} on greetings/openings
- For step 2+, use condition "if_not_replied"
- Last step: short bump asking yes/no
- Return ONLY via the build_campaign tool`;

    const json = await callAI(
      [
        { role: "system", content: sys },
        { role: "user", content: `${ctx ? ctx + "\n\n" : ""}Campaign goal: ${data.prompt}` },
      ],
      tools,
      { type: "function", function: { name: "build_campaign" } },
    );

    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI did not return a campaign");
    const result = JSON.parse(call.function.arguments);
    // Normalize single-brace merge tags like {CompanyName} → {{company_name}} (canonicalize known vars)
    const KNOWN = ["first_name","last_name","email","company","title","website","linkedin","sender_name","sender_company","icebreaker"];
    const normalize = (s: string) => (s ?? "").replace(/(?<!\{)\{([A-Za-z][\w]*)\}(?!\})/g, (_m, name: string) => {
      const snake = name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
      const k = KNOWN.find(v => v === snake) ?? snake;
      return `{{${k}}}`;
    });
    result.subject_variants = (result.subject_variants ?? []).map(normalize);
    result.steps = (result.steps ?? []).map((s: any) => ({ ...s, subject: normalize(s.subject), body: normalize(s.body) }));

    let campaign_id: string | null = null;
    if (data.saveAsCampaign) {
      const { data: camp, error } = await supabase.from("campaigns").insert({
        user_id: userId, name: data.name || data.prompt.slice(0, 60), status: "draft",
      }).select().single();
      if (error) throw error;
      campaign_id = camp.id;
      const rows = result.steps.map((s: any, i: number) => ({
        campaign_id: camp.id,
        step_order: i + 1,
        delay_days: s.delay_days ?? (i === 0 ? 0 : 3),
        subject: s.subject,
        body: s.body,
        condition: s.condition || "always",
        variant_subjects: i === 0 ? (result.subject_variants || []).slice(1) : [],
      }));
      await supabase.from("campaign_steps").insert(rows);
    }

    await supabase.from("copilot_briefs").insert({
      user_id: userId, prompt: data.prompt, business_context: ctx, icp: result.icp, result, campaign_id,
    });
    return { ...result, campaign_id };
  });

// Suggest a reply to an inbox conversation
export const suggestReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({
    conversationId: z.string().uuid(),
    intent: z.enum(["positive", "decline", "ask", "followup"]).optional(),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: conv } = await supabase.from("conversations").select("*, messages(*)").eq("id", data.conversationId).single();
    if (!conv) throw new Error("Conversation not found");
    const { data: prof } = await supabase.from("profiles").select("full_name, company_name, calendar_link, ai_reply_tone").eq("id", userId).maybeSingle();

    const thread = (conv.messages ?? [])
      .sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at))
      .map((m: any) => `${m.direction === "outbound" ? "Me" : "Them"}: ${(m.body || "").slice(0, 800)}`)
      .join("\n---\n");

    const intentInstr = {
      positive: "They are interested. Reply briefly, propose a 15-min call, and include the calendar link if available.",
      decline: "They declined politely. Acknowledge graciously, leave the door open, do not push.",
      ask: "They asked a question. Answer concisely without sales fluff.",
      followup: "They went quiet. Send a 1-line bump asking yes/no.",
    }[data.intent || "positive"];

    const json = await callAI([
      { role: "system", content: `You are ${prof?.full_name || "the sender"}, ${prof?.ai_reply_tone || "friendly"} tone. Reply to a cold-outreach conversation. Keep under 70 words. No salutation overload. Output ONLY the reply text.` },
      { role: "user", content: `Calendar: ${prof?.calendar_link || "(none)"}\n\nThread:\n${thread}\n\nGuidance: ${intentInstr}` },
    ]);
    const text = json?.choices?.[0]?.message?.content?.trim() ?? "";
    return { reply: text };
  });

// Categorize replies + summarize (already used for incoming; here exposed for batch)
export const categorizeReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ conversationId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: conv } = await supabase.from("conversations").select("*, messages(*)").eq("id", data.conversationId).single();
    if (!conv) throw new Error("Not found");
    const last = (conv.messages ?? []).filter((m: any) => m.direction === "inbound").slice(-1)[0];
    if (!last) return { category: "other", confidence: 0, summary: "" };

    const tools = [{
      type: "function",
      function: {
        name: "label",
        parameters: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["interested", "not_interested", "out_of_office", "unsubscribe", "question", "other"] },
            confidence: { type: "number" },
            summary: { type: "string" },
          },
          required: ["category", "confidence", "summary"],
        },
      },
    }];
    const json = await callAI(
      [
        { role: "system", content: "Classify a cold-email reply. One sentence summary." },
        { role: "user", content: last.body || "" },
      ],
      tools,
      { type: "function", function: { name: "label" } },
    );
    const args = JSON.parse(json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments || "{}");
    await supabase.from("conversations").update({
      ai_category: args.category, ai_confidence: args.confidence, ai_summary: args.summary,
    }).eq("id", data.conversationId);
    return args;
  });
