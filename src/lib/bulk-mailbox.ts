import * as XLSX from "xlsx";
import Papa from "papaparse";

export type BulkRow = {
  label?: string;
  from_name?: string;
  from_email: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_username?: string;
  smtp_password: string;
  imap_host?: string;
  imap_port?: number;
  imap_secure?: boolean;
  daily_limit?: number;
  provider?: string;
};

const PRESETS: Record<string, Partial<BulkRow>> = {
  gmail:   { smtp_host: "smtp.gmail.com",         smtp_port: 587, smtp_secure: false, imap_host: "imap.gmail.com",         imap_port: 993, imap_secure: true },
  outlook: { smtp_host: "smtp-mail.outlook.com",  smtp_port: 587, smtp_secure: false, imap_host: "outlook.office365.com",  imap_port: 993, imap_secure: true },
  office365:{ smtp_host: "smtp-mail.outlook.com", smtp_port: 587, smtp_secure: false, imap_host: "outlook.office365.com",  imap_port: 993, imap_secure: true },
  zoho:    { smtp_host: "smtp.zoho.com",          smtp_port: 587, smtp_secure: false, imap_host: "imap.zoho.com",          imap_port: 993, imap_secure: true },
  yahoo:   { smtp_host: "smtp.mail.yahoo.com",    smtp_port: 587, smtp_secure: false, imap_host: "imap.mail.yahoo.com",    imap_port: 993, imap_secure: true },
};

function detectProvider(email: string): string | undefined {
  const d = email.split("@")[1]?.toLowerCase() ?? "";
  if (d.includes("gmail")) return "gmail";
  if (d.includes("outlook") || d.includes("hotmail") || d.includes("live") || d.includes("office365")) return "outlook";
  if (d.includes("zoho")) return "zoho";
  if (d.includes("yahoo")) return "yahoo";
  return undefined;
}

function normalizeKey(k: string): string {
  return k.toLowerCase().replace(/[\s_\-]+/g, "_").trim();
}

const ALIASES: Record<string, string> = {
  email: "from_email", from: "from_email", from_email: "from_email", address: "from_email", username: "smtp_username",
  user: "smtp_username", password: "smtp_password", pass: "smtp_password", app_password: "smtp_password",
  smtp_user: "smtp_username", smtp_password: "smtp_password", smtp_pass: "smtp_password",
  smtp_host: "smtp_host", host: "smtp_host", smtp_port: "smtp_port", port: "smtp_port",
  smtp_ssl: "smtp_secure", smtp_secure: "smtp_secure", ssl: "smtp_secure", tls: "smtp_secure",
  imap_host: "imap_host", imap_port: "imap_port", imap_ssl: "imap_secure", imap_secure: "imap_secure",
  name: "from_name", from_name: "from_name", display_name: "from_name", label: "label",
  daily: "daily_limit", daily_limit: "daily_limit", limit: "daily_limit", provider: "provider",
};

export function normalizeRow(raw: Record<string, any>): BulkRow | null {
  const row: any = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = ALIASES[normalizeKey(k)] ?? normalizeKey(k);
    row[key] = typeof v === "string" ? v.trim() : v;
  }
  if (!row.from_email || !row.smtp_password) return null;
  const provider = (row.provider || detectProvider(row.from_email))?.toLowerCase();
  const preset = provider ? PRESETS[provider] : undefined;
  const merged: BulkRow = {
    from_email: row.from_email,
    smtp_password: String(row.smtp_password),
    smtp_username: row.smtp_username || row.from_email,
    from_name: row.from_name || row.from_email.split("@")[0],
    label: row.label || row.from_email,
    smtp_host: row.smtp_host || preset?.smtp_host,
    smtp_port: Number(row.smtp_port) || preset?.smtp_port || 587,
    smtp_secure: typeof row.smtp_secure === "boolean" ? row.smtp_secure : (String(row.smtp_secure ?? "").toLowerCase() === "true" || preset?.smtp_secure || false),
    imap_host: row.imap_host || preset?.imap_host,
    imap_port: Number(row.imap_port) || preset?.imap_port || 993,
    imap_secure: typeof row.imap_secure === "boolean" ? row.imap_secure : true,
    daily_limit: Number(row.daily_limit) || 30,
    provider,
  };
  if (!merged.smtp_host) return null;
  return merged;
}

export function parseCsvText(text: string): BulkRow[] {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  return (result.data as Record<string, any>[]).map(normalizeRow).filter(Boolean) as BulkRow[];
}

export async function parseFile(file: File): Promise<BulkRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const buf = await file.arrayBuffer();
  if (ext === "csv" || ext === "txt") {
    return parseCsvText(new TextDecoder().decode(buf));
  }
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
  return rows.map(normalizeRow).filter(Boolean) as BulkRow[];
}

// "email,password" or "email password" or "email | password" lines
export function parsePastedPairs(text: string): BulkRow[] {
  return text.split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/[,;|\t ]+/).map(s => s.trim()).filter(Boolean);
      if (parts.length < 2) return null;
      return normalizeRow({ email: parts[0], password: parts.slice(1).join(" ") });
    })
    .filter(Boolean) as BulkRow[];
}

// Convert google sheets share URL to csv export URL
export function toGsheetCsvUrl(url: string): string {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!m) return url;
  const id = m[1];
  const gidMatch = url.match(/[#?&]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}
