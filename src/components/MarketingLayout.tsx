import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Twitter, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-lg tracking-tight">EmailSend<span className="text-muted-foreground font-normal">.ai</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="px-3 py-1.5 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              activeProps={{ className: "px-3 py-1.5 text-sm rounded-full bg-accent text-accent-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {authed ? (
            <Button onClick={() => navigate({ to: "/dashboard" })}>Open app</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate({ to: "/login" })} className="hidden sm:inline-flex">Sign in</Button>
              <Button onClick={() => navigate({ to: "/login" })} className="rounded-full">Start free</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold">EmailSend<span className="text-muted-foreground font-normal">.ai</span></span>
          </div>
          <p className="text-sm text-muted-foreground">Cold outreach that lands in inboxes — and gets replies.</p>
          <div className="flex gap-3 mt-4 text-muted-foreground">
            <a href="#" aria-label="Twitter"><Twitter className="w-4 h-4 hover:text-foreground" /></a>
            <a href="#" aria-label="GitHub"><Github className="w-4 h-4 hover:text-foreground" /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin className="w-4 h-4 hover:text-foreground" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Privacy</a></li>
            <li><a href="#" className="hover:text-foreground">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EmailSend. All rights reserved.
      </div>
    </footer>
  );
}

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Playful background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] -right-40 w-[500px] h-[500px] rounded-full bg-warning/30 blur-3xl" />
      <MarketingHeader />
      <main className="relative">{children}</main>
      <MarketingFooter />
    </div>
  );
}
