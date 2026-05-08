import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Twitter, Github, Linkedin, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-background/75 border-b border-border/60" : "bg-transparent border-b border-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-glow">
            <ArrowRight className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-lg ring-1 ring-white/15" />
          </div>
          <span className="font-extrabold text-[17px] tracking-tight">EmailSend<span className="text-muted-foreground font-normal">.ai</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 px-1.5 py-1.5 rounded-full surface-1 backdrop-blur">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="px-3.5 py-1.5 text-[13px] rounded-full text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "px-3.5 py-1.5 text-[13px] rounded-full bg-primary text-primary-foreground font-semibold shadow-glow" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {authed ? (
            <Button onClick={() => navigate({ to: "/dashboard" })} className="rounded-full">Open app</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate({ to: "/login" })} className="hidden sm:inline-flex rounded-full text-sm">Sign in</Button>
              <Button onClick={() => navigate({ to: "/login" })} className="rounded-full text-sm shadow-glow group">
                Start free <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Button>
            </>
          )}
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="md:hidden ml-1 p-2 rounded-md hover:bg-accent">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground" activeProps={{ className: "px-3 py-2.5 rounded-lg text-sm bg-accent text-foreground font-semibold" }}>
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-border/60 mt-24 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-glow">
              <ArrowRight className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-lg">EmailSend<span className="text-muted-foreground font-normal">.ai</span></span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">Cold email infrastructure that delivers. Built for operators who send for a living.</p>
          <div className="flex gap-2 mt-5">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a key={i} href="#" aria-label="social" className="w-9 h-9 rounded-full surface-1 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">Product</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/features" className="text-foreground/80 hover:text-primary">Features</Link></li>
            <li><Link to="/pricing" className="text-foreground/80 hover:text-primary">Pricing</Link></li>
            <li><Link to="/resources" className="text-foreground/80 hover:text-primary">Resources</Link></li>
            <li><Link to="/login" className="text-foreground/80 hover:text-primary">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="text-foreground/80 hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="text-foreground/80 hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">Legal</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#" className="text-foreground/80 hover:text-primary">Privacy</a></li>
            <li><a href="#" className="text-foreground/80 hover:text-primary">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EmailSend.ai · Cold email infrastructure that delivers.
      </div>
    </footer>
  );
}

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient mesh + grid */}
      <div className="pointer-events-none fixed inset-0 bg-mesh opacity-90" />
      <div className="pointer-events-none fixed inset-0 bg-grid bg-grid-fade opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-noise opacity-[0.4] mix-blend-overlay" />
      <MarketingHeader />
      <main className="relative">{children}</main>
      <MarketingFooter />
    </div>
  );
}
