// Common spam trigger words / phrases. Not exhaustive but catches the worst.
const SPAM_WORDS = [
  "free","guarantee","guaranteed","100% free","act now","limited time","urgent","winner","cash","earn money","make money","buy now",
  "click here","click below","subscribe","unsubscribe","risk free","no risk","amazing","incredible","best price","lowest price",
  "discount","credit","loan","mortgage","investment","crypto","bitcoin","viagra","cialis","dear friend","congratulations",
  "exclusive deal","hidden","this is not spam","double your","extra income","fast cash","get paid","income from home","work from home",
  "miracle","order now","please read","pure profit","satisfaction guaranteed","special promotion","while supplies last","you have been selected"
];

export type SpamReport = {
  score: number; // 0-100, higher = worse
  hits: string[];
  warnings: string[];
  stats: { words: number; chars: number; links: number; allCapsWords: number; exclamations: number };
};

export function scoreSpam(subject: string, body: string): SpamReport {
  const text = `${subject}\n${body}`;
  const lc = text.toLowerCase();
  // Use word-boundary matching for single-word entries (e.g. "free") to avoid
  // false positives on words that contain the spam word as a substring
  // (e.g. "freestyle", "carefree", "freedom"). Multi-word phrases still use
  // substring matching since word boundaries don't apply cleanly there.
  const hits = SPAM_WORDS.filter(w => {
    if (/\s/.test(w)) return lc.includes(w);
    return new RegExp(`(?<![a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z])`, "i").test(lc);
  });
  const warnings: string[] = [];
  const words = (text.match(/\S+/g) ?? []);
  const allCapsWords = words.filter(w => w.length >= 3 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  const exclamations = (text.match(/!/g) ?? []).length;
  const links = (text.match(/https?:\/\//g) ?? []).length;

  if (subject.length > 70) warnings.push("Subject is long (>70 chars). Aim for ≤50.");
  if (subject.toUpperCase() === subject && subject.length > 5) warnings.push("Subject is ALL CAPS — strong spam signal.");
  if (exclamations > 2) warnings.push(`${exclamations} exclamation marks — keep ≤1.`);
  if (allCapsWords > 3) warnings.push(`${allCapsWords} ALL-CAPS words — looks shouty.`);
  if (links > 3) warnings.push(`${links} links — keep to 1–2.`);
  // Skip body-shape warnings until the user has actually written something
  // (otherwise a freshly added blank step screams at them immediately).
  if (body.trim().length > 0) {
    if (words.length < 30) warnings.push("Body is very short; may look low-effort.");
    if (words.length > 250) warnings.push("Body is long; cold emails do best at 50–125 words.");
    if (!/\{\{\s*first_name\s*\}\}/i.test(body)) warnings.push("No personalization tag — add {{first_name}}.");
  }

  let score = 0;
  score += hits.length * 8;
  score += Math.max(0, exclamations - 1) * 5;
  score += Math.max(0, allCapsWords - 2) * 4;
  score += Math.max(0, links - 2) * 6;
  score += subject.length > 70 ? 5 : 0;
  score = Math.min(100, score);

  return {
    score,
    hits,
    warnings,
    stats: { words: words.length, chars: text.length, links, allCapsWords, exclamations },
  };
}
