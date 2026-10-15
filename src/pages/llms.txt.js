import { tools, categories, categoryBlurbs, bySlug } from '../lib/data.js';
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
    '',
    '## Categories',
    ...Object.entries(categories).map(([slug, name]) => `- [${name}](https://vibeverdict.ai/category/${slug}/): ${categoryBlurbs[slug] || name + ' verdicts and verified pricing.'}`),
    '',
    '## More',
    '- [AI news](https://vibeverdict.ai/news/): Recent AI headlines from public feeds, shown as the outlet published them.',
    '- [Newsletter](https://vibeverdict.ai/newsletter/): The weekly email: price changes, new tools, and one honest pick. The signup box is on this page.',
    '- [About](https://vibeverdict.ai/about/): How VibeVerdict rates tools. Prices are read from the vendor site, dated, and marked when unverified.',
    '- [Affiliate disclosure](https://vibeverdict.ai/disclosure/): Some links earn a commission. A commission never changes a verdict.',
    '- [Advertise](https://vibeverdict.ai/advertise/): Labeled sponsorships. The price is on request, and a sponsorship never changes a verdict.',
    '- [Submit your tool](https://vibeverdict.ai/submit/): Free submission, a $49 one-time fast-track review within 7 days, or featured placement at $99 a month ($79 a month for the first 3 months). Payment buys speed and visibility, never the verdict.',
    '- [Contact](https://vibeverdict.ai/contact/): Email hello@vibeverdict.ai. Advertising inquiries go to the advertise page.',
    ''
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
