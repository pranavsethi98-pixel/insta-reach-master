// {hello|hi|hey} → randomly picks one. Supports nesting.
export function spintax(input: string): string {
  const re = /\{([^{}]+)\}/;
  let s = input;
  while (re.test(s)) {
    s = s.replace(re, (_m, group: string) => {
      const opts = group.split("|");
      return opts[Math.floor(Math.random() * opts.length)];
    });
  }
  return s;
}

export function mergeTags(input: string, lead: Record<string, any>): string {
  return input.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => {
    const k = key.toLowerCase();
    const map: Record<string, any> = {
      first_name: lead.first_name,
      firstname: lead.first_name,
      last_name: lead.last_name,
      lastname: lead.last_name,
      email: lead.email,
      company: lead.company,
      title: lead.title,
    };
    if (map[k] != null && map[k] !== "") return String(map[k]);
    const cf = lead.custom_fields || {};
    if (cf[key] != null) return String(cf[key]);
    return "";
  });
}

export function renderEmail(template: string, lead: Record<string, any>): string {
  return mergeTags(spintax(template), lead);
}
