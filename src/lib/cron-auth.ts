// Shared bearer-token guard for /api/public/* cron endpoints.
// Set CRON_SECRET in your environment. Cron callers must send:
//   Authorization: Bearer <CRON_SECRET>
export function verifyCronSecret(request: Request): Response | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Fail closed in production
    return new Response("Cron secret not configured", { status: 503 });
  }
  const auth = request.headers.get("authorization") || "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  // Constant-time compare
  if (provided.length !== expected.length) {
    return new Response("Unauthorized", { status: 401 });
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return new Response("Unauthorized", { status: 401 });
  return null;
}
