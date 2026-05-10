// Advanced templating engine:
//   {hello|hi|hey}                  → spintax (random pick, supports nesting)
//   {{first_name}}                  → merge tag
//   {{first_name|there}}            → merge tag with fallback
//   {% if company %}...{% endif %}  → liquid-ish conditional
//   {% if opened %}...{% else %}...{% endif %}
//   {% if not replied %}...{% endif %}

export function spintax(input: string): string {
  // Match a single-brace group, but skip merge tags like {{first_name}} so
  // spintax never eats placeholders meant for mergeTags().
  const re = /(?<!\{)\{([^{}]+)\}(?!\})/;
  let s = input;
  let guard = 0;
  while (re.test(s) && guard++ < 50) {
    s = s.replace(re, (_m, group: string) => {
      const opts = group.split("|");
      return opts[Math.floor(Math.random() * opts.length)];
    });
  }
  return s;
}

export function mergeTags(input: string, lead: Record<string, any>): string {
  return input.replace(/\{\{\s*([\w.]+)\s*(?:\|\s*([^}]*))?\}\}/g, (_m, key: string, fallback?: string) => {
    const k = key.toLowerCase();
    const map: Record<string, any> = {
      first_name: lead.first_name,
      firstname: lead.first_name,
      last_name: lead.last_name,
      lastname: lead.last_name,
      email: lead.email,
      company: lead.company,
      title: lead.title,
      website: lead.website,
      linkedin: lead.linkedin,
      calendar_link: lead.calendar_link,
      icebreaker: lead.icebreaker,
      unsubscribe: lead.unsubscribe_url,
      unsubscribe_url: lead.unsubscribe_url,
      sender_name: lead.sender_name,
      sender_company: lead.sender_company,
    };
    if (map[k] != null && map[k] !== "") return String(map[k]);
    const cf = lead.custom_fields || {};
    if (cf[key] != null && cf[key] !== "") return String(cf[key]);
    return (fallback ?? "").trim();
  });
}

// Evaluate {% if expr %}...{% else %}...{% endif %} blocks.
// `flags` provides booleans like opened/clicked/replied; `lead` provides string presence.
function evalCondition(expr: string, lead: Record<string, any>, flags: Record<string, boolean>): boolean {
  expr = expr.trim();
  let negate = false;
  if (expr.startsWith("not ")) { negate = true; expr = expr.slice(4).trim(); }
  const key = expr.toLowerCase();
  let truthy = false;
  if (key in flags) truthy = !!flags[key];
  else {
    const v = (lead as any)[key] ?? (lead.custom_fields ?? {})[expr];
    truthy = v != null && String(v).trim() !== "";
  }
  return negate ? !truthy : truthy;
}

export function liquid(input: string, lead: Record<string, any>, flags: Record<string, boolean> = {}): string {
  // Process innermost {% if %}...{% endif %} repeatedly.
  const re = /\{%\s*if\s+([^%]+?)\s*%\}([\s\S]*?)(?:\{%\s*else\s*%\}([\s\S]*?))?\{%\s*endif\s*%\}/;
  let s = input;
  let guard = 0;
  while (re.test(s) && guard++ < 30) {
    s = s.replace(re, (_m, cond: string, a: string, b?: string) =>
      evalCondition(cond, lead, flags) ? a : (b ?? ""),
    );
  }
  return s;
}

// Convert single-brace {first_name} → {{first_name}} so users typing the
// shorter form still get a working merge tag. We deliberately do NOT touch
// bare words — replacing the literal word "email" or "company" in prose
// would corrupt sentences like "manual email tasks".
export function normalizeTemplate(input: string): string {
  return (input ?? "").replace(/(?<!\{)\{([A-Za-z][\w]*)\}(?!\})/g, (_m, name: string) => {
    const snake = name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
    return `{{${snake}}}`;
  });
}

export function renderEmail(template: string, lead: Record<string, any>, flags: Record<string, boolean> = {}): string {
  return mergeTags(spintax(liquid(normalizeTemplate(template), lead, flags)), lead);
}
