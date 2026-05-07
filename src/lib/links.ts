// Rewrites href URLs in HTML to go through the click tracking endpoint.
export function rewriteLinks(html: string, origin: string, trackingId: string): string {
  return html.replace(/href=("|')([^"']+)\1/gi, (m, q, url) => {
    if (!/^https?:\/\//i.test(url)) return m;
    if (url.includes("/api/public/track/")) return m;
    const wrapped = `${origin}/api/public/track/click/${trackingId}?u=${encodeURIComponent(url)}`;
    return `href=${q}${wrapped}${q}`;
  });
}
