import { tools, categories, bySlug } from '../lib/data.js';
import { comparisons, comparisonTitle, roundups } from '../lib/guides.js';

export function GET() {
  const priceLine = (t) => t.verified
    ? `Pricing: ${t.pricing.map(p => p.plan + ' ' + p.price).join('; ') || 'n/a'}. Verified ${t.lastVerified}.`
    : 'Pricing: see vendor site. UNVERIFIED.';
  const lines = [
    '# VibeVerdict',
    '> Honest, dated verdicts and verified pricing for AI, agent and vibe-coding tools.',
    '',
    ...Object.entries(categories).flatMap(([k, v]) => [
      '## ' + v,
      ...tools.filter(t => t.category === k).map(t => `- [${t.name}](https://vibeverdict.ai/tools/${t.slug}/): ${t.verdict} ${priceLine(t)}`),
      ''
    ]),
    '## Comparisons',
    ...comparisons.map(page => `- [${comparisonTitle(page, bySlug)}](https://vibeverdict.ai/compare/${page.slug}/): ${page.verdict || 'Side-by-side verdicts from the tool pages.'}`),
    '',
    '## Roundups',
    ...roundups.map(page => `- [${page.title}](https://vibeverdict.ai/best/${page.slug}/): ${page.verdict}`),
    ''
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
