import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RequireAuth } from "@/components/AuthGate";
import { AdminShell } from "@/components/AdminShell";
import { listAllTickets, replyTicket, listAnnouncements, upsertAnnouncement } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/support")({
  component: () => <RequireAuth><AdminShell><Page /></AdminShell></RequireAuth>,
});

function Page() {
  const ft = useServerFn(listAllTickets); const rt = useServerFn(replyTicket);
  const fa = useServerFn(listAnnouncements); const ua = useServerFn(upsertAnnouncement);
  const { data: tickets, refetch: rti } = useQuery({ queryKey: ["tk"], queryFn: () => ft() });
  const { data: anns, refetch: ran } = useQuery({ queryKey: ["an"], queryFn: () => fa() });
  const m = useMutation({
    mutationFn: async (fn: () => Promise<any>) => fn(),
    onSuccess: () => { rti(); ran(); },
    onError: (e: any) => toast.error(e?.message ?? "Action failed"),
  });

  const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  const [reply, setReply] = useState<Record<string,string>>({});

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Support & announcements</h1>

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Broadcast announcement</h2>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button disabled={m.isPending} onClick={() => {
          if (!title.trim()) { toast.error("Title is required"); return; }
          if (!body.trim()) { toast.error("Body is required"); return; }
          m.mutate(() => ua({ data: { title, body, audience: "all", is_active: true } }));
          setTitle(""); setBody("");
        }}>Publish</Button>
        <div className="space-y-1 mt-3">
          {(anns ?? []).map((a: any) => (
            <div key={a.id} className="flex justify-between py-2 border-b text-sm">
              <div><span className="font-medium">{a.title}</span> · <span className="text-muted-foreground">{a.audience}</span></div>
              <Button size="sm" variant="ghost" onClick={() => m.mutate(() => ua({ data: { ...a, is_active: !a.is_active } }))}>{a.is_active ? "Hide" : "Show"}</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Tickets</h2>
        <div className="space-y-3">
          {(tickets ?? []).map((t: any) => (
            <div key={t.id} className="border rounded p-3">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{t.subject} <Badge variant="outline" className="ml-2">{t.status}</Badge></div>
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-sm mt-2">{t.body}</div>
              <div className="flex gap-2 mt-2">
                <Input placeholder="Reply…" value={reply[t.id] ?? ""} onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })} />
                <Button size="sm" disabled={m.isPending} onClick={() => {
                  if (!(reply[t.id] ?? "").trim()) { toast.error("Enter a reply first"); return; }
                  m.mutate(() => rt({ data: { ticketId: t.id, body: reply[t.id] ?? "", status: "answered" } }));
                  setReply({ ...reply, [t.id]: "" });
                }}>Reply</Button>
                <Button size="sm" variant="ghost" disabled={m.isPending} onClick={() => m.mutate(() => rt({ data: { ticketId: t.id, body: "", status: "closed" } }))}>Close</Button>
              </div>
            </div>
          ))}
          {!tickets?.length && <div className="text-sm text-muted-foreground">No tickets.</div>}
        </div>
      </div>
    </div>
  );
}
