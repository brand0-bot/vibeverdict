import { tools, bySlug } from '../lib/data.js';
import { comparisons, comparisonTitle, roundups } from '../lib/guides.js';

export function GET() {
  const body = {
    tools,
    comparisons: comparisons.map(page => ({
      slug: page.slug,
      title: comparisonTitle(page, bySlug),
      url: `https://vibeverdict.ai/compare/${page.slug}/`,
      tools: page.tools,
      verdict: page.verdict || null
    })),
    roundups: roundups.map(page => ({
      slug: page.slug,
      title: page.title,
      url: `https://vibeverdict.ai/best/${page.slug}/`,
      tools: page.tools.map(t => t.slug),
      verdict: page.verdict
    }))
  };
  return new Response(JSON.stringify(body, null, 1), { headers: { 'Content-Type': 'application/json' } });
}
