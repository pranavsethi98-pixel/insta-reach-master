import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<null | { type: "error" | "success"; text: string }>(null);

  // Supabase fires PASSWORD_RECOVERY after the user clicks the reset link.
  // We only set ready on that specific event — not on generic SIGNED_IN —
  // to prevent a normally logged-in user who navigates to /reset-password
  // from seeing (and being able to submit) the new-password form.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (password.length > 72) {
      setMessage({ type: "error", text: "Password must be 72 characters or fewer." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Passwords don't match." });
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Password updated");
      setTimeout(() => navigate({ to: "/dashboard" }), 1200);
    } catch (err: any) {
      const raw = err?.message || "";
      const text = /same password|reuse/i.test(raw)
        ? "New password must be different from your current password."
        : /session|expired|token/i.test(raw)
          ? "Your reset link has expired. Please request a new one."
          : "Could not update password. Please try again.";
      setMessage({ type: "error", text });
      toast.error(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col px-6 sm:px-10 py-8">
      <header className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded bg-primary text-primary-foreground inline-flex items-center justify-center font-bold transition-transform group-hover:translate-x-0.5">→</span>
          <span className="font-semibold tracking-tight">EmailSend<span className="text-muted-foreground font-normal">.ai</span></span>
        </Link>
        <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition">← back to sign in</Link>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-primary" /> Reset password
          </div>
          <h1 className="text-4xl font-semibold tracking-tight leading-[1.05]">
            {done ? "All set." : "Choose a new password."}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {done
              ? "Redirecting you to your dashboard…"
              : "Make it strong. You'll use this to sign in next time."}
          </p>

          {!ready && !done && (
            <div className="mt-8 rounded-lg border border-border bg-card/40 px-4 py-4 text-sm text-muted-foreground">
              Waiting for recovery link… If you got here without clicking the email, request a new reset link from the sign-in page.
            </div>
          )}

          {ready && !done && (
            <form onSubmit={submit} className="mt-8 space-y-3">
              {message && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${message.type === "error" ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-success/50 bg-success/10 text-success"}`}>
                  {message.text}
                </div>
              )}
              <div className="flex items-center gap-3 px-3 rounded-lg border border-border bg-card/40 focus-within:border-primary transition">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="password" autoComplete="new-password" required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (6+ chars)"
                  className="h-11 border-0 bg-transparent focus-visible:ring-0 pl-0"
                />
              </div>
              <div className="flex items-center gap-3 px-3 rounded-lg border border-border bg-card/40 focus-within:border-primary transition">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="password" autoComplete="new-password" required minLength={6}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-11 border-0 bg-transparent focus-visible:ring-0 pl-0"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 group">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Update password<ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" /></>}
              </Button>
            </form>
          )}

          {done && (
            <div className="mt-8 flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" /> Password updated successfully
            </div>
          )}

          <div className="mt-10 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Encrypted at rest · SOC 2 ready
          </div>
        </motion.div>
      </div>
    </div>
  );
}
