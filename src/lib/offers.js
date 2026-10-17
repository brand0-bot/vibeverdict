// A numeric price is added only when the plan text is one amount.
// "Free" is 0 USD. "From $X" and "Starting from $X" use that starting amount.
// Ranges, "or" alternatives, contact-sales, and usage rates stay text-only.
const USAGE = /pay[-\s]?as[-\s]?you[-\s]?go|\+\s*usage|usage\s+billed|\/hour|\bper\s+hour\b|\bper\s+minute\b|\bper\s+[\d,]|\bper\s+character|\bapi\s+rates\b|\bapi\s+provider\b/i;
const RANGE = /[$€]\d[\d,]*(?:\.\d+)?\s*[-–—]\s*[$€]?\d/;
const BILLING = /^((?:\/(?:user|seat|member))?(?:\/(?:mo|month|yr|year))?|per\s+(?:user|seat|member)(?:\s*\/\s*|\s+per\s+)(?:mo|month|yr|year)|per\s+(?:month|year|user|seat|member))(?:\s+billed\s+(?:monthly|annually|yearly))?(?:\s+with\s+[A-Za-z][\w\s.-]*)?$/i;

export function parseOfferPrice(price) {
  const text = String(price ?? '').trim();
  if (!text || USAGE.test(text)) return null;
  if (/^free(?:\s*\([^)]*\))?$/i.test(text)) return { price: '0', priceCurrency: 'USD' };

  const amounts = [...text.matchAll(/[$€]\d+(?:,\d{3})*(?:\.\d+)?/g)];
  if (amounts.length !== 1 || RANGE.test(text)) return null;
  const amount = amounts[0];
  const lead = text.slice(0, amount.index).trim();
  if (lead && !/^(?:starting\s+)?from$/i.test(lead)) return null;

  const m = amount[0].match(/^([$€])(\d+(?:,\d{3})*(?:\.\d+)?)$/);
  if (!m) return null;
  const raw = m[2].replace(/,/g, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;

  const rest = text.slice(amount.index + amount[0].length).trim().replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (rest && !BILLING.test(rest)) return null;
  return { price: raw, priceCurrency: m[1] === '€' ? 'EUR' : 'USD' };
}

export function offerFromPlan(plan) {
  const offer = { '@type': 'Offer', name: plan.plan, description: plan.price };
  const parsed = parseOfferPrice(plan.price);
  if (parsed) {
    offer.price = parsed.price;
    offer.priceCurrency = parsed.priceCurrency;
  }
  return offer;
}

const UNPRICED = "Pricing hasn't been researched yet. We don't publish prices we haven't verified.";

export function offersForTool(tool) {
  if (tool.pricing?.length) return tool.pricing.map(offerFromPlan);
  return [{ '@type': 'Offer', name: tool.name, description: UNPRICED }];
}
