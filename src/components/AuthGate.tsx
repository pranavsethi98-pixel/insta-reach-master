import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadingTimeout = window.setTimeout(() => {
      if (!active) return;
      setSession(null);
      setLoading(false);
    }, 5000);

    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      window.clearTimeout(loadingTimeout);
      setSession(nextSession);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      applySession(s);
    });

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => applySession(null));

    return () => {
      active = false;
      window.clearTimeout(loadingTimeout);
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
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!session) return null;
  return <>{children}</>;
}
