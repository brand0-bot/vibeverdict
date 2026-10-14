import sponsors from '../data/sponsors.json' with { type: 'json' };

// A sponsor is { name, logo, pitch, href, cta, pages, start, end }.
// pages are slot ids: "category/coding-agents", "best/ai-voice-generators", "best".
// start and end are inclusive YYYY-MM-DD dates. An empty list renders no sponsor.
export function sponsorFor(slot, list = sponsors, today = new Date()) {
  if (!slot || !Array.isArray(list) || list.length === 0) return null;
  const day = today.toISOString().slice(0, 10);
  return list.find((s) => {
    if (!s || !s.name || !s.logo || !s.pitch || !s.href || !s.cta) return false;
    if (!Array.isArray(s.pages) || !s.pages.includes(slot)) return false;
    if (typeof s.start !== 'string' || typeof s.end !== 'string') return false;
    return s.start <= day && day <= s.end;
  }) || null;
}
