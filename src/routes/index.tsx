import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Mail, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Outreachly — Cold email outreach, automated" },
      { name: "description", content: "Connect unlimited mailboxes, rotate sends, and run multi-step cold email sequences with spintax and merge tags." },
    ],
  }),
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Outreachly</span>
        </div>
        <Button onClick={() => navigate({ to: "/login" })}>Sign in</Button>
      </header>
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Cold email outreach,<br />
          <span className="text-primary">automated at scale.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect dozens of mailboxes, rotate sends to protect deliverability,
          and run multi-step sequences with spintax and personalization.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button size="lg" onClick={() => navigate({ to: "/login" })}>Get started free</Button>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {[
          { icon: Mail, title: "Mailbox rotation", desc: "Connect unlimited SMTP inboxes with daily caps and randomized delays." },
          { icon: Users, title: "Smart sequencing", desc: "Multi-step drips, spintax variants, and dynamic merge tags." },
          { icon: BarChart3, title: "Full visibility", desc: "Track every send, reply, and step in real time." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-card border rounded-xl p-6">
            <Icon className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
