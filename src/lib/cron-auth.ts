// Shared bearer-token guard for /api/public/* cron endpoints.
// Set CRON_SECRET in your environment. Cron callers must send:
//   Authorization: Bearer <CRON_SECRET>
import { timingSafeEqual } from "crypto";

export function verifyCronSecret(request: Request): Response | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Fail closed in production
    return new Response("Cron secret not configured", { status: 503 });
  }
  const auth = request.headers.get("authorization") || "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  // Use Node's native constant-time compare to prevent timing attacks
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length || !timingSafeEqual(expectedBuf, providedBuf)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
