import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const inviteTeammate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: z.string().uuid().optional(),
      email: z.string().email(),
      role: z.enum(["admin", "member"]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let wsId = data.workspaceId;
    if (!wsId) {
      const { data: existing } = await supabase.from("workspaces").select("id").eq("owner_id", userId).limit(1).maybeSingle();
      if (existing?.id) wsId = existing.id;
      else {
        const { data: created, error: ce } = await supabase.from("workspaces").insert({ name: "My Workspace", owner_id: userId } as any).select("id").single();
        if (ce) throw ce;
        wsId = created.id;
        await supabase.from("workspace_members").insert({ workspace_id: wsId, user_id: userId, role: "owner" } as any);
      }
    }
    const { data: invite, error } = await supabase
      .from("workspace_invites")
      .insert({
        workspace_id: wsId,
        email: data.email.toLowerCase(),
        role: data.role,
        invited_by: userId,
      } as any)
      .select()
      .single();
    if (error) throw error;
    const origin = process.env.SITE_URL || "https://id-preview--c1fb09cc-dc95-493b-92f3-507054f93627.lovable.app";
    return {
      ok: true,
      inviteUrl: `${origin}/invite/${(invite as any).token}`,
    };
  });
