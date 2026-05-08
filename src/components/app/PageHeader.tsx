import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  desc,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="border-b border-border/60 pb-6 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary mb-2">{eyebrow}</div>
        )}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight truncate">{title}</h1>
        {desc && <p className="text-muted-foreground mt-1.5 text-sm md:text-[15px] max-w-2xl">{desc}</p>}
        {meta && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground font-mono">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: number; // positive or negative percent
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-5 border transition-all overflow-hidden",
        accent
          ? "bg-gradient-to-br from-primary/15 via-card to-card border-primary/30"
          : "bg-card border-border hover:border-primary/30",
        className
      )}
    >
      <div className="absolute inset-0 bg-dots opacity-[0.04] pointer-events-none" />
      <div className="relative flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        {Icon && (
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", accent ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="relative mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">{value}</div>
      <div className="relative mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
        {sub && <span>{sub}</span>}
        {typeof trend === "number" && (
          <span className={cn("inline-flex items-center gap-0.5 font-mono font-semibold", trend >= 0 ? "text-success" : "text-destructive")}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
    </div>
  );
}

export function Panel({
  title,
  desc,
  actions,
  children,
  className,
  pad = true,
}: {
  title?: string;
  desc?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl bg-card border border-border overflow-hidden", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/70">
          <div className="min-w-0">
            {title && <div className="font-semibold text-sm">{title}</div>}
            {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
          </div>
          {actions}
        </div>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: LucideIcon;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      {desc && <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusPill({ tone = "neutral", children }: { tone?: "ok" | "warn" | "bad" | "neutral" | "primary"; children: ReactNode }) {
  const map = {
    ok: "bg-success/15 text-success border-success/30",
    warn: "bg-warning/15 text-warning-foreground border-warning/30",
    bad: "bg-destructive/15 text-destructive border-destructive/30",
    neutral: "bg-muted text-muted-foreground border-border",
    primary: "bg-primary/15 text-primary border-primary/30",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest border", map[tone])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", tone === "ok" ? "bg-success" : tone === "warn" ? "bg-warning" : tone === "bad" ? "bg-destructive" : tone === "primary" ? "bg-primary" : "bg-muted-foreground")} />
      {children}
    </span>
  );
}
