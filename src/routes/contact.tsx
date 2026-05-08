import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Send, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/MarketingLayout";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — EmailSend.ai" },
      { name: "description", content: "Talk to the EmailSend team about pricing, deliverability, or partnerships. We reply within one business day." },
      { property: "og:title", content: "Contact — EmailSend.ai" },
      { property: "og:description", content: "Get in touch with the EmailSend team." },
    ],
  }),
});

function ContactPage() {
  const [sending, setSending] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Thanks! We'll get back to you within one business day.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  };
  return (
    <MarketingLayout>
      <section className="relative max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-20 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-start">
        <div>
          <div className="text-eyebrow mb-5">Contact</div>
          <h1 className="text-display">
            Let's<br />
            <span className="text-gradient">talk shop.</span>
          </h1>
          <p className="mt-7 text-lg text-muted-foreground max-w-md leading-relaxed">
            Pricing, deliverability, partnerships, or just want to nerd out about cold email? Drop us a note and a real human will respond.
          </p>

          <div className="mt-10 space-y-3">
            <a href="mailto:hello@emailsend.ai" className="surface-1 rounded-2xl p-5 flex items-center gap-4 group hover:border-primary/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Email</div>
                <div className="font-semibold">hello@emailsend.ai</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </a>
            <div className="surface-1 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Live chat</div>
                <div className="font-semibold">In-app, weekdays 9am–6pm UTC</div>
              </div>
            </div>
            <div className="surface-1 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Response time</div>
                <div className="font-semibold">&lt; 1 business day · usually 4 hrs</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="surface-1 rounded-3xl p-7 md:p-8 space-y-5 shadow-soft">
          <div className="text-eyebrow">Send a note</div>
          <div>
            <Label htmlFor="name" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Your name</Label>
            <Input id="name" required className="mt-2 h-12 bg-background" placeholder="Jane Operator" />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Work email</Label>
            <Input id="email" type="email" required className="mt-2 h-12 bg-background" placeholder="you@company.com" />
          </div>
          <div>
            <Label htmlFor="msg" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Message</Label>
            <Textarea id="msg" rows={5} required className="mt-2 bg-background resize-none" placeholder="What are you working on?" />
          </div>
          <Button type="submit" className="w-full rounded-full h-12 shadow-glow" disabled={sending}>
            {sending ? "Sending..." : (<>Send message <Send className="w-4 h-4 ml-1.5" /></>)}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">We never share your email. Promise.</p>
        </form>
      </section>
    </MarketingLayout>
  );
}
