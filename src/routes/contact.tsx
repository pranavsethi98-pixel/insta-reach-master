import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
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
      { title: "Contact — EmailSend" },
      { name: "description", content: "Talk to the EmailSend team about pricing, features, or partnerships." },
      { property: "og:title", content: "Contact — EmailSend" },
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
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Let's <span className="text-primary">talk.</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Questions about pricing, deliverability, or just want to chat outbound strategy? Drop us a note.
          </p>
          <div className="space-y-4">
            <a href="mailto:hello@emailsend.ai" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Mail className="w-5 h-5" /></div>
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground group-hover:text-foreground">hello@emailsend.ai</div>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
              <div>
                <div className="text-sm font-medium">Live chat</div>
                <div className="text-sm text-muted-foreground">Available Mon–Fri, 9am–6pm UTC</div>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" rows={5} required className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={sending}>
            {sending ? "Sending..." : (<>Send message <Send className="w-4 h-4 ml-1" /></>)}
          </Button>
        </form>
      </section>
    </MarketingLayout>
  );
}
