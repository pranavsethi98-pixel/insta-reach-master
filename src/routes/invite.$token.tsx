import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$token")({
  component: AcceptInvite,
});

function AcceptInvite() {
  const { token } = useParams({ from: "/invite/$token" });
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ready" | "done" | "error" | "accepting">("loading");
  const [invite, setInvite] = useState<any>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/login", search: { invite: token } as any });
        return;
      }
      const { data, error } = await supabase
        .from("workspace_invites")
        .select("*")
        .eq("token", token)
        .maybeSingle();
      if (error || !data) { setStatus("error"); setMsg("Invite not found or expired."); return; }
      if (data.accepted_at) { setStatus("error"); setMsg("Invite already accepted."); return; }
      // Check expiry if the invite has an expiry timestamp
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setStatus("error"); setMsg("This invite link has expired. Ask the workspace admin to send a new one."); return;
      }
      setInvite(data);
      setStatus("ready");
    })();
  }, [token, navigate]);

  const accept = async () => {
    if (status === "accepting") return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !invite) return;
    setStatus("accepting");
    const { error: mErr } = await supabase.from("workspace_members").insert({
      workspace_id: invite.workspace_id, user_id: user.id, role: invite.role,
    } as any);
    if (mErr && !/duplicate|unique/i.test(mErr.message)) {
      toast.error("Could not join workspace. Please try again.");
      setStatus("ready");
      return;
    }
    await supabase.from("workspace_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);
    setStatus("done");
    setTimeout(() => navigate({ to: "/dashboard" }), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Workspace invite</h1>
        {status === "loading" && <p className="text-muted-foreground">Loading…</p>}
        {status === "error" && <p className="text-destructive">{msg}</p>}
        {(status === "ready" || status === "accepting") && (
          <>
            <p className="text-muted-foreground mb-4">You've been invited to join as <b>{invite.role}</b>.</p>
            <Button onClick={accept} disabled={status === "accepting"} className="w-full">
              {status === "accepting" ? "Joining…" : "Accept invite"}
            </Button>
          </>
        )}
        {status === "done" && <p className="text-primary">Joined! Redirecting…</p>}
      </Card>
    </div>
  );
}
