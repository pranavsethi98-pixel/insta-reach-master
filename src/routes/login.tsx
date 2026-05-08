import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "signin" | "signup";
type Step = "form" | "verifyEmail";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<null | "email" | "google" | "resend">(null);
  const [message, setMessage] = useState<null | { type: "error" | "success"; text: string }>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setMessage({ type: "error", text: "Enter your email and password." });
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setMessage(null);
    setLoading("email");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/onboarding",
          },
        });
        if (error) throw error;
        const sentMessage = "We sent a verification email to " + cleanEmail;
        setEmail(cleanEmail);
        setMessage({ type: "success", text: sentMessage });
        toast.success(sentMessage);
        setStep("verifyEmail");
      }
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      const reasons = err?.weak_password?.reasons?.join(", ");
      const text = reasons ? `${msg} (${reasons})` : msg;
      setMessage({ type: "error", text });
      toast.error(text, { duration: 8000 });
    } finally {
      setLoading(null);
    }
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setStep("form");
    setMessage(null);
  };

  const resendVerificationEmail = async () => {
    setLoading("resend");
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      toast.success("Verification email resent");
    } catch (err: any) {
      toast.error(err.message || "Could not resend verification email");
    } finally {
      setLoading(null);
    }
  };

  const forgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setMessage({ type: "error", text: "Enter your email above first, then click forgot password." });
      return;
    }
    if (loading) return;
    setMessage(null);
    setLoading("email");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      const text = `Reset link sent to ${cleanEmail}. Check your inbox.`;
      setMessage({ type: "success", text });
      toast.success(text);
    } catch (err: any) {
      const text = err?.message || "Could not send reset email";
      setMessage({ type: "error", text });
      toast.error(text);
    } finally {
      setLoading(null);
    }
  };

  const google = async () => {
    if (loading) return;
    setMessage(null);
    setLoading("google");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) {
      setMessage({ type: "error", text: "Google sign-in failed. Try email/password instead." });
      toast.error("Google sign-in failed");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-[1.1fr_1fr]">
      {/* LEFT — form */}
      <div className="relative flex flex-col px-6 sm:px-10 lg:px-16 py-8 lg:py-10">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded bg-primary text-primary-foreground inline-flex items-center justify-center font-bold transition-transform group-hover:translate-x-0.5">→</span>
            <span className="font-semibold tracking-tight">EmailSend<span className="text-muted-foreground font-normal">.ai</span></span>
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition">← back to site</Link>
        </header>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-primary" />
                {mode === "signin" ? "Sign in" : "Create account"}
              </div>
              <div className="mt-6 grid grid-cols-2 rounded-lg border border-border bg-card/40 p-1">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  aria-pressed={mode === "signin"}
                  className={`h-10 rounded-md text-sm font-medium transition ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  aria-pressed={mode === "signup"}
                  className={`h-10 rounded-md text-sm font-medium transition ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Sign up
                </button>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                {mode === "signin"
                  ? <>Welcome back.</>
                  : <>Start sending in <span className="text-primary">5 minutes</span>.</>}
              </h1>
              <p className="mt-3 text-muted-foreground">
                {mode === "signin"
                  ? "Pick up where you left off. Your warmup never sleeps."
                  : "Free for 14 days. No credit card. Real inbox placement from day one."}
              </p>
            </motion.div>

            <div className="mt-8 space-y-3">
              <Button
                variant="outline"
                onClick={google}
                disabled={!!loading}
                className="w-full h-11 justify-center gap-3 border-border hover:bg-card"
              >
                {loading === "google"
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <GoogleGlyph />}
                Continue with Google
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono">
                  <span className="bg-background px-3 text-muted-foreground">or with email</span>
                </div>
              </div>

              {message && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${message.type === "error" ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-success/50 bg-success/10 text-success"}`}>
                  {message.text}
                </div>
              )}

              {step === "verifyEmail" ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-card/40 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="w-4 h-4 text-primary" /> Verification email sent
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Click the verification link sent to <span className="font-mono text-foreground">{email}</span>. After verifying, you'll be sent to onboarding.
                    </p>
                  </div>
                  <Button type="button" onClick={() => switchMode("signin")} className="w-full h-11 group">
                    Sign in after verifying<ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <button type="button" onClick={() => setStep("form")} className="hover:text-foreground">← back</button>
                    <button type="button" onClick={resendVerificationEmail} disabled={!!loading} className="hover:text-foreground">
                      {loading === "resend" ? "sending…" : "resend email"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-3">
                  <FieldIcon icon={<Mail className="w-4 h-4" />}>
                    <Input
                      type="email" autoComplete="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-11 border-0 bg-transparent focus-visible:ring-0 pl-0"
                    />
                  </FieldIcon>
                  <FieldIcon icon={<Lock className="w-4 h-4" />}>
                    <Input
                      type="password" required minLength={6}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signin" ? "Your password" : "Create a strong password (6+ chars)"}
                      className="h-11 border-0 bg-transparent focus-visible:ring-0 pl-0"
                    />
                  </FieldIcon>

                  <Button type="submit" disabled={!!loading} className="w-full h-11 group">
                    {loading === "email"
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>{mode === "signin" ? "Sign in" : "Send verification email"}<ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" /></>}
                  </Button>
                </form>
              )}

              {step === "form" && (
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                    className="hover:text-foreground transition"
                  >
                    {mode === "signin" ? "Don't have an account? Sign up" : "Already have one? Sign in"}
                  </button>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={forgotPassword}
                      disabled={!!loading}
                      className="hover:text-foreground transition disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-10 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              SOC 2 ready · Encrypted at rest · GDPR
            </div>
          </div>
        </div>

        <footer className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} EmailSend.ai</span>
          <span className="flex items-center gap-3">
            <Link to="/pricing" className="hover:text-foreground">pricing</Link>
            <Link to="/about" className="hover:text-foreground">about</Link>
            <Link to="/contact" className="hover:text-foreground">contact</Link>
          </span>
        </footer>
      </div>

      {/* RIGHT — infrastructure visual */}
      <div className="hidden lg:block relative overflow-hidden border-l border-border bg-card/30">
        <AmbientGrid />
        <SendPulsePanel />
      </div>
    </div>
  );
}

function FieldIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3 rounded-lg border border-border bg-card/40 focus-within:border-primary transition">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41 35.5 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

function AmbientGrid() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
    </>
  );
}

function SendPulsePanel() {
  // Tiny live-feel sparkline + streaming feed (deterministic seed for SSR).
  const bars = useMemo(() => Array.from({ length: 28 }, (_, i) => 18 + Math.round(Math.abs(Math.sin(i * 0.7)) * 60 + (i % 5) * 4)), []);
  const feed = [
    { t: "now",    e: "j.kim@northwind.io",    s: "delivered" as const },
    { t: "0:02",   e: "ops@globex.com",         s: "opened" as const },
    { t: "0:04",   e: "harlan@acme.co",         s: "replied" as const },
    { t: "0:09",   e: "p.wells@initech.io",     s: "delivered" as const },
    { t: "0:12",   e: "sales@hooli.com",        s: "opened" as const },
    { t: "0:18",   e: "mira@stark-ind.co",      s: "delivered" as const },
  ];

  return (
    <div className="relative h-full flex items-center justify-center p-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Console card */}
        <div className="rounded-xl border border-border bg-background/70 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/40">
            <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              live · iad-1
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">v2.0</div>
          </div>

          {/* stats */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {[
              { k: "Sent today", v: "12,847", d: "+18%" },
              { k: "Inbox rate",  v: "99.2%",  d: "stable" },
              { k: "Reply rate",  v: "38.4%",  d: "+4.2pt" },
            ].map((s) => (
              <div key={s.k} className="px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">{s.k}</div>
                <div className="font-mono text-xl mt-1 tabular-nums">{s.v}</div>
                <div className="text-[10px] font-mono text-success mt-0.5">{s.d}</div>
              </div>
            ))}
          </div>

          {/* sparkline */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-end gap-[3px] h-20">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + i * 0.012, duration: 0.4, ease: "easeOut" }}
                  style={{ height: `${h}%`, transformOrigin: "bottom" }}
                  className={`flex-1 rounded-sm ${i === bars.length - 1 ? "bg-primary" : "bg-primary/30"}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-muted-foreground">
              <span>last 24h sends</span>
              <span className="tabular-nums">peak 1,204/h</span>
            </div>
          </div>

          {/* feed */}
          <div className="border-t border-border">
            {feed.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-center justify-between px-4 py-2 text-[12px] font-mono border-b border-border/60 last:border-0"
              >
                <span className="text-muted-foreground tabular-nums w-10">{row.t}</span>
                <span className="flex-1 truncate text-foreground/80">{row.e}</span>
                <StatusPill kind={row.s} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* tagline */}
        <div className="mt-8 px-1">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> trusted by 4,200+ operators
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Cold email infrastructure that delivers. Warmup, sending, and reply detection on one console — built for teams that send to win.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function StatusPill({ kind }: { kind: "delivered" | "opened" | "replied" }) {
  const map = {
    delivered: { c: "text-muted-foreground border-border", l: "delivered" },
    opened:    { c: "text-primary border-primary/40 bg-primary/5", l: "opened" },
    replied:   { c: "text-success border-success/40 bg-success/5", l: "replied" },
  } as const;
  const m = map[kind];
  return (
    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${m.c}`}>
      {m.l}
    </span>
  );
}
