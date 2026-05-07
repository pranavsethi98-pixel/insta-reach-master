import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const inviteTeammate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspaceId: z.string().uuid(),
      email: z.string().email(),
      role: z.enum(["admin", "member"]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: invite, error } = await supabase
      .from("workspace_invites")
      .insert({
        workspace_id: data.workspaceId,
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
