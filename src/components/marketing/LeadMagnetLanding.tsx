import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Download, CheckCircle2, FileText, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarketingLayout } from "@/components/MarketingLayout";
import { captureLead } from "@/lib/marketing-leads.functions";

export type Magnet = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  pages: number;
  bullets: string[];
  toc: { num: string; title: string; desc: string }[];
  testimonial?: { quote: string; name: string; role: string };
};

export function LeadMagnetLanding({ magnet }: { magnet: Magnet }) {
  const capture = useServerFn(captureLead);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("loading");
    try {
      const res = await capture({ data: { email, source: `magnet:${magnet.slug}`, lead_magnet_slug: magnet.slug } });
      setFileUrl(res.file_url);
      setState("done");
      if (res.file_url) window.open(res.file_url, "_blank");
    } catch {
      setState("idle");
    }
  };

  return (
    <MarketingLayout>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-mono uppercase tracking-wider mb-6">
            <Lock className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">Free · {magnet.badge}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.95]">
            {magnet.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">{magnet.subtitle}</p>

          <ul className="mt-8 space-y-3">
            {magnet.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-full px-5"
              disabled={state !== "idle"}
              required
            />
            <Button type="submit" size="lg" className="rounded-full h-12 px-6" disabled={state !== "idle"}>
              {state === "loading" ? "Sending..." : state === "done" ? "Sent ✓" : (<>Get the PDF <ArrowRight className="w-4 h-4 ml-1" /></>)}
            </Button>
          </form>
          {state === "done" && (
            <p className="mt-3 text-sm text-success flex items-center gap-2">
              <Download className="w-4 h-4" />
              {fileUrl ? <a href={fileUrl} target="_blank" rel="noreferrer" className="underline">Download didn't open? Click here.</a> : "Check your inbox."}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">No spam. Unsubscribe anytime. We won't sell your email — that would be ironic.</p>
        </div>

        {/* COVER MOCK */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-gradient-to-br from-card to-background border border-border rounded-2xl p-8 shadow-2xl rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between mb-6">
              <FileText className="w-8 h-8 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">{magnet.pages} pages · PDF</span>
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">EmailSend.ai</div>
            <h3 className="text-2xl font-extrabold tracking-tight leading-tight mb-4">{magnet.title}</h3>
            <p className="text-sm text-muted-foreground">{magnet.subtitle}</p>
            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Volume {magnet.badge}</span>
              <span className="font-mono text-primary">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">What's inside</div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">No fluff. Just the operator's playbook.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {magnet.toc.map((t) => (
            <div key={t.num} className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="font-mono text-2xl text-primary/60 font-bold">{t.num}</div>
                <div>
                  <div className="font-semibold mb-1">{t.title}</div>
                  <div className="text-sm text-muted-foreground">{t.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {magnet.testimonial && (
        <section className="max-w-3xl mx-auto px-6 py-20">
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}
            </div>
            <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6">"{magnet.testimonial.quote}"</p>
            <div className="text-sm">
              <div className="font-semibold">{magnet.testimonial.name}</div>
              <div className="text-muted-foreground">{magnet.testimonial.role}</div>
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-primary/15 to-card border border-primary/30 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Ready when you are.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Drop your email. We'll send the PDF straight to your inbox. Read it tonight, ship better outbound tomorrow.</p>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-full px-5"
              disabled={state !== "idle"}
              required
            />
            <Button type="submit" size="lg" className="rounded-full h-12 px-6" disabled={state !== "idle"}>
              {state === "done" ? "Sent ✓" : "Send it"}
            </Button>
          </form>
          <div className="mt-8">
            <Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              Browse all free resources <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
