import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate a string to `max` characters and append an ellipsis.
 * Strips trailing whitespace and dangling opening punctuation
 * (e.g. "(", "[", "{", "-", "/", "·") so the result reads cleanly
 * — no "…" left dangling after a lonely "(".
 */
export function smartTruncate(input: string | null | undefined, max: number): string {
  const s = (input ?? "").toString();
  if (s.length <= max) return s;
  let cut = s.slice(0, max);
  // Walk back over whitespace and dangling open punctuation
  cut = cut.replace(/[\s\-–—_/\\(){}\[\]<>·,;:.&+]+$/u, "");
  if (!cut) cut = s.slice(0, max).trimEnd();
  return `${cut}…`;
}
