import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

// Cache the session at module scope so navigating between RequireAuth-wrapped
// routes doesn't re-show the "Loading…" splash (which caused a black flash on
// every page transition because RequireAuth unmounts AppShell while loading).
let cachedSession: Session | null = null;
let cachedReady = false;

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [loading, setLoading] = useState(!cachedReady);

  useEffect(() => {
    let active = true;

    const apply = (s: Session | null) => {
      if (!active) return;
      cachedSession = s;
      cachedReady = true;
      setSession(s);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => apply(s));

    if (!cachedReady) {
      const timeout = window.setTimeout(() => apply(null), 5000);
      supabase.auth
        .getSession()
        .then(({ data }) => { window.clearTimeout(timeout); apply(data.session); })
        .catch(() => { window.clearTimeout(timeout); apply(null); });
    }

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { session, loading } = useAuthSession();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }
  // Prevent blank/black screen during the async navigate() call
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">
        Redirecting…
      </div>
    );
  }
  return <>{children}</>;
}
