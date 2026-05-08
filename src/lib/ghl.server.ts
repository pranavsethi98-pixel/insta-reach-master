// Server-only GoHighLevel REST client (Private Integration Token / API v2).
// Docs: https://highlevel.stoplight.io/docs/integrations/

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

export type GhlResult<T = any> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

function authHeaders() {
  const token = process.env.GHL_PRIVATE_TOKEN;
  if (!token) throw new Error("GHL_PRIVATE_TOKEN not configured");
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export function getLocationId(): string {
  const id = process.env.GHL_LOCATION_ID;
  if (!id) throw new Error("GHL_LOCATION_ID not configured");
  return id;
}

async function request<T = any>(path: string, init: RequestInit = {}): Promise<GhlResult<T>> {
  try {
    const r = await fetch(`${GHL_BASE}${path}`, {
      ...init,
      headers: { ...authHeaders(), ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(15000),
    });
    const text = await r.text();
    let data: any = undefined;
    try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }
    if (!r.ok) {
      return { ok: false, status: r.status, error: typeof data === "string" ? data : (data?.message ?? r.statusText), data };
    }
    return { ok: true, status: r.status, data };
  } catch (e: any) {
    return { ok: false, status: 0, error: String(e?.message ?? e) };
  }
}

export const ghl = {
  // GET /locations/:id — used for connection test
  getLocation: () => request(`/locations/${getLocationId()}`),

  // POST /contacts/upsert — create or update a contact in this location
  upsertContact: (input: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    tags?: string[];
    source?: string;
    customFields?: Array<{ id?: string; key?: string; field_value: any }>;
  }) =>
    request<{ contact: { id: string } }>(`/contacts/upsert`, {
      method: "POST",
      body: JSON.stringify({ locationId: getLocationId(), ...input }),
    }),

  // GET /contacts/:id
  getContact: (id: string) => request(`/contacts/${id}`),

  // POST /contacts/:id/notes — log activity as a note
  addNote: (contactId: string, body: string) =>
    request(`/contacts/${contactId}/notes`, {
      method: "POST",
      body: JSON.stringify({ body, userId: "" }),
    }),

  // POST /contacts/:id/tags
  addTags: (contactId: string, tags: string[]) =>
    request(`/contacts/${contactId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags }),
    }),
};
