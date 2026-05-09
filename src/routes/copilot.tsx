import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Wand2, Save } from "lucide-react";
import { generateCampaign } from "@/lib/copilot.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/copilot")({
  component: () => (<RequireAuth><AppShell><CopilotPage /></AppShell></RequireAuth>),
});

const SAMPLES = [
  "Cold outreach to Heads of Sales at Series A SaaS companies (50–200 people) selling our AI sales enablement platform.",
  "Book demos with eCommerce founders for our Shopify retention app.",
  "Pitch our cybersecurity audit service to CTOs of fintech startups.",
];

function CopilotPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const gen = useServerFn(generateCampaign);

  const { data: prof } = useQuery({
    queryKey: ["profile-context"],
    queryFn: async () => (await supabase.from("profiles").select("business_context, company_name, website_url").maybeSingle()).data,
  });

  const saveContext = async (patch: any) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update(patch).eq("id", u.user.id);
    if (error) return toast.error(error.message);
    toast.success("Memory saved");
    qc.invalidateQueries({ queryKey: ["profile-context"] });
  };

  const run = async (save: boolean) => {
    if (prompt.trim().length < 5) return toast.error("Describe your campaign goal first");
    setBusy(true);
    try {
      const r = await gen({ data: { prompt, saveAsCampaign: save } });
      setResult(r);
      if (save && r.campaign_id) {
        toast.success("Campaign created");
        navigate({ to: "/campaigns/$id", params: { id: r.campaign_id } });
      }
    } catch (e: any) {
      toast.error(e.message ?? "AI failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Sparkles className="w-7 h-7 text-primary" /> AI Copilot</h1>
        <p className="text-muted-foreground mt-1">Describe a campaign goal — I'll write the ICP, subject lines, and a 3–4 step sequence.</p>
      </div>

      <details className="bg-card border rounded-xl p-4">
        <summary className="cursor-pointer font-medium">Memory: business context</summary>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div><Label>Company</Label><Input defaultValue={prof?.company_name ?? ""} onBlur={(e) => saveContext({ company_name: e.target.value })} /></div>
          <div><Label>Website</Label><Input defaultValue={prof?.website_url ?? ""} onBlur={(e) => saveContext({ website_url: e.target.value })} placeholder="https://..." /></div>
          <div className="sm:col-span-2"><Label>What you sell / ICP notes</Label>
            <Textarea rows={3} defaultValue={prof?.business_context ?? ""} onBlur={(e) => saveContext({ business_context: e.target.value })} placeholder="We sell X to Y — value prop, differentiator, common objections…" />
          </div>
        </div>
      </details>

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <Label>Campaign brief</Label>
        <Textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Book demos with HR Directors at 200-1000 person logistics companies…" />
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <button key={s} className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80"
              onClick={() => setPrompt(s)}>{s.slice(0, 60)}…</button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => run(false)} disabled={busy} variant="outline">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            Generate preview
          </Button>
          <Button onClick={() => run(true)} disabled={busy}>
            <Save className="w-4 h-4 mr-2" /> Generate & save as campaign
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-5">
            <h2 className="font-semibold mb-2">ICP</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">Titles</div>{(result.icp.titles || []).join(", ")}</div>
              <div><div className="text-xs text-muted-foreground">Industries</div>{(result.icp.industries || []).join(", ")}</div>
              {result.icp.company_size && <div><div className="text-xs text-muted-foreground">Company size</div>{result.icp.company_size}</div>}
              <div className="sm:col-span-2"><div className="text-xs text-muted-foreground">Pain points</div>{(result.icp.pain_points || []).join(" · ")}</div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <h2 className="font-semibold mb-2">Subject variants</h2>
            <ul className="text-sm space-y-1">{result.subject_variants?.map((s: string, i: number) => <li key={i}>{i + 1}. {s}</li>)}</ul>
          </div>
          {result.steps?.map((s: any, i: number) => (
            <div key={i} className="bg-card border rounded-xl p-5">
              <div className="text-xs text-muted-foreground">Step {i + 1} · delay {s.delay_days}d · {s.condition}</div>
              <div className="font-semibold mt-1">{s.subject}</div>
              <pre className="text-sm whitespace-pre-wrap mt-2 font-sans">{s.body}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
