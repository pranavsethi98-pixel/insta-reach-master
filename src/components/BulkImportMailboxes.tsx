import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, FileText, Link2, Sparkles, Loader2 } from "lucide-react";
import { parseFile, parseCsvText, parsePastedPairs, toGsheetCsvUrl, type BulkRow } from "@/lib/bulk-mailbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BulkImportMailboxes({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [pasted, setPasted] = useState("");
  const [pairs, setPairs] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = async (f: File | null) => {
    if (!f) return;
    try {
      const parsed = await parseFile(f);
      setRows(parsed);
      toast.success(`Parsed ${parsed.length} rows`);
    } catch (e: any) { toast.error(e.message); }
  };
  const onPaste = () => {
    if (!pasted.trim()) { toast.error("Paste CSV text first (with a header row)."); return; }
    try {
      const parsed = parseCsvText(pasted);
      if (!parsed.length) { toast.error("No accounts found — check that you included email and password columns."); return; }
      setRows(parsed);
      toast.success(`Parsed ${parsed.length} rows`);
    } catch (e: any) { toast.error(e.message); }
  };
  const onPairs = () => {
    if (!pairs.trim()) { toast.error("Paste email,password pairs first (one per line)."); return; }
    const parsed = parsePastedPairs(pairs);
    if (!parsed.length) { toast.error("No accounts found — paste lines like: me@gmail.com,app-password"); return; }
    setRows(parsed);
    toast.success(`Parsed ${parsed.length} accounts`);
  };
  const onSheet = async () => {
    if (!sheetUrl) return;
    setBusy(true);
    try {
      const url = toGsheetCsvUrl(sheetUrl);
      const r = await fetch(url);
      if (!r.ok) throw new Error("Couldn't fetch sheet — make sure it's published or shared 'Anyone with link can view'.");
      const text = await r.text();
      const parsed = parseCsvText(text);
      setRows(parsed);
      toast.success(`Parsed ${parsed.length} rows`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const importAll = async () => {
    if (!rows.length) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setBusy(true);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Build valid rows for batch insert — skip invalid emails
    const validRows = rows
      .filter(r => r.from_email && emailRe.test(r.from_email))
      .map(r => ({
        user_id: user.id,
        label: r.label!, from_name: r.from_name!, from_email: r.from_email,
        smtp_host: r.smtp_host!, smtp_port: r.smtp_port!, smtp_secure: r.smtp_secure!,
        smtp_username: r.smtp_username!, smtp_password: r.smtp_password,
        imap_host: r.imap_host, imap_port: r.imap_port, imap_secure: r.imap_secure,
        imap_username: r.smtp_username!,
        // Use dedicated imap_password if provided, otherwise fall back to smtp_password
        imap_password: (r as any).imap_password ?? r.smtp_password,
        daily_limit: r.daily_limit!, ramp_up_enabled: true, warmup_enabled: true,
      }));
    const skipped = rows.length - validRows.length;
    let ok = 0, fail = 0;
    if (validRows.length > 0) {
      // Batch insert in chunks of 50 to stay within request size limits
      const CHUNK = 50;
      for (let i = 0; i < validRows.length; i += CHUNK) {
        const { error } = await supabase.from("mailboxes").insert(validRows.slice(i, i + CHUNK) as any);
        if (error) fail += Math.min(CHUNK, validRows.length - i);
        else ok += Math.min(CHUNK, validRows.length - i);
      }
    }
    setBusy(false);
    const parts = [`Imported ${ok} mailbox${ok !== 1 ? "es" : ""}`];
    if (fail) parts.push(`${fail} failed (likely duplicates)`);
    if (skipped) parts.push(`${skipped} skipped (invalid email)`);
    toast.success(parts.join(", "));
    if (ok > 0) {
      setOpen(false); setRows([]); setPasted(""); setPairs(""); setSheetUrl("");
      onImported();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Bulk import</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk add mailboxes</DialogTitle>
          <DialogDescription>Add many SMTP accounts at once. We auto-detect Gmail, Outlook, Zoho, Yahoo and fill in host/port for you.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="file"><FileSpreadsheet className="w-4 h-4 mr-1.5" /> CSV / Excel</TabsTrigger>
            <TabsTrigger value="sheet"><Link2 className="w-4 h-4 mr-1.5" /> Google Sheet</TabsTrigger>
            <TabsTrigger value="paste"><FileText className="w-4 h-4 mr-1.5" /> Paste CSV</TabsTrigger>
            <TabsTrigger value="quick"><Sparkles className="w-4 h-4 mr-1.5" /> Quick paste</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              Upload a <b>.csv</b> or <b>.xlsx</b> file. Required columns: <code>email</code>, <code>password</code>. Optional: <code>name, smtp_host, smtp_port, smtp_secure, daily_limit, provider</code>.
            </p>
            <Input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            <a className="text-xs text-primary underline" href="data:text/csv;charset=utf-8,email,password,name,daily_limit%0Ame@gmail.com,abcdABCDabcdABCD,My Name,30%0Asales@outlook.com,xxxxxxxxxx,Sales,40" download="mailboxes-template.csv">Download example template</a>
          </TabsContent>

          <TabsContent value="sheet" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              Paste a Google Sheets URL (must be shared "Anyone with link can view" or published to web). We convert it to a CSV export automatically.
            </p>
            <div className="flex gap-2">
              <Input placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} />
              <Button onClick={onSheet} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}</Button>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">Paste CSV text with a header row.</p>
            <Textarea rows={8} value={pasted} onChange={e => setPasted(e.target.value)} placeholder="email,password,name&#10;me@gmail.com,abcdabcd,My Name" />
            <Button onClick={onPaste} variant="outline">Parse</Button>
          </TabsContent>

          <TabsContent value="quick" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              One account per line as <b>email,password</b> (or space/tab separated). Provider auto-detected for Gmail/Outlook/Zoho/Yahoo.
            </p>
            <Textarea rows={8} value={pairs} onChange={e => setPairs(e.target.value)} placeholder="me@gmail.com,abcdabcdabcdabcd&#10;sales@outlook.com xxxxxxxxx" />
            <Button onClick={onPairs} variant="outline">Parse</Button>
          </TabsContent>
        </Tabs>

        {rows.length > 0 && (
          <div className="border rounded-lg overflow-hidden mt-2">
            <div className="bg-muted px-3 py-2 text-xs font-medium">{rows.length} accounts ready · auto-filled SMTP/IMAP</div>
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50"><tr>
                  <th className="text-left p-2">Email</th><th className="text-left p-2">SMTP</th><th className="text-left p-2">Provider</th><th className="text-left p-2">Daily</th>
                </tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.from_email}</td>
                      <td className="p-2">{r.smtp_host}:{r.smtp_port}</td>
                      <td className="p-2">{r.provider ?? "custom"}</td>
                      <td className="p-2">{r.daily_limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={importAll} disabled={!rows.length || busy}>
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {rows.length > 0 ? `Import ${rows.length} mailbox${rows.length !== 1 ? "es" : ""}` : "Import mailboxes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
