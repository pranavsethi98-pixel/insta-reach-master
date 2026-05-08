import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, FileText, Lock } from "lucide-react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { listLeadMagnets } from "@/lib/marketing-leads.functions";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  head: () => ({
    meta: [
      { title: "Free Cold Email Resources — EmailSend.ai" },
      { name: "description", content: "Free playbooks, templates, and frameworks for cold email operators. PDFs, checklists, and SOPs from the EmailSend.ai team." },
      { property: "og:title", content: "Free Cold Email Resources — EmailSend.ai" },
      { property: "og:description", content: "Free playbooks and templates from the EmailSend.ai team." },
    ],
  }),
});

const SLUG_TO_PATH: Record<string, string> = {
  "deliverability-bible": "/deliverability-bible",
  "sequence-blueprint": "/sequence-blueprint",
  "reply-rate-formula": "/reply-rate-formula",
  "47-templates": "/47-templates",
};

function ResourcesPage() {
  const fetchMagnets = useServerFn(listLeadMagnets);
  const { data } = useQuery({ queryKey: ["lead-magnets"], queryFn: () => fetchMagnets() });
  const magnets = data?.magnets ?? [];

  return (
    <MarketingLayout>
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-mono uppercase tracking-wider mb-6">
          <Lock className="w-3 h-3 text-primary" />
          <span className="text-muted-foreground">Free · No signup tax</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
          The cold email <span className="text-primary">resource library.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Every playbook, framework, and template our team uses to ship outbound that actually works. Free. Forever. No tier-locked nonsense.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-5">
        {magnets.map((m: any) => {
          const path = SLUG_TO_PATH[m.slug];
          const content = (
            <div className="bg-card border border-border rounded-2xl p-7 h-full hover:border-primary/40 transition-colors group">
              <div className="flex items-center justify-between mb-5">
                <FileText className="w-7 h-7 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{m.category}</span>
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight leading-tight mb-2">{m.title}</h3>
              {m.subtitle && <p className="text-sm text-muted-foreground mb-5">{m.subtitle}</p>}
              <div className="flex items-center justify-between pt-5 border-t border-border/60 text-xs">
                <span className="font-mono text-muted-foreground">{m.page_count ?? "—"} pages · PDF</span>
                <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get it <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
          return path ? (
            <Link key={m.slug} to={path}>{content}</Link>
          ) : (
            <div key={m.slug}>{content}</div>
          );
        })}
        {!magnets.length && (
          <div className="col-span-2 text-center text-muted-foreground py-20">Loading the library...</div>
        )}
      </section>
    </MarketingLayout>
  );
}
