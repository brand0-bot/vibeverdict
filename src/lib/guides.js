export const comparisons = [
  { slug: 'cursor-vs-github-copilot', tools: ['cursor', 'github-copilot'] },
  { slug: 'lovable-vs-bolt', tools: ['lovable', 'bolt'] },
  { slug: 'chatgpt-vs-claude', tools: ['chatgpt', 'claude'] },
  { slug: 'claude-code-vs-openai-codex', tools: ['claude-code', 'openai-codex'] },
  { slug: 'v0-vs-lovable', tools: ['v0', 'lovable'] },
  {
    slug: 'elevenlabs-vs-murf',
    tools: ['elevenlabs', 'murf'],
    title: 'ElevenLabs vs Murf',
    description: 'ElevenLabs vs Murf: a flat creator plan against pay-as-you-go voice API rates, with only the prices each vendor published.',
    verdict: 'ElevenLabs publishes a creator plan at $6 a month for 30,000 credits. Murf’s pricing page, opened the same day, lists API rates starting at $0.01 per 1,000 characters and a $10 API credit, not a flat studio subscription. Buy ElevenLabs for a monthly voiceover plan. Use Murf if you are metering an API. The affiliate link on ElevenLabs does not decide that.',
    related: [{ href: '/best/ai-voice-generators/', title: 'Best AI voice generators' }]
  },
  {
    slug: 'gamma-vs-beautiful-ai-vs-tome',
    tools: ['gamma', 'beautiful-ai', 'tome'],
    title: 'Gamma vs Beautiful.ai vs Tome',
    description: 'Gamma vs Beautiful.ai vs Tome for AI presentations. Only Beautiful.ai had a dollar price we could read on the vendor’s pricing page.',
    verdict: 'Beautiful.ai is the only one of the three with a dollar price on its pricing page: Pro at $14.50 a month billed annually, and Team at $40 per user billed annually or $50 billed monthly. Gamma’s pricing page returned 403, so its paid price is omitted. Tome’s pricing URL returned deployment not found, so there is nothing to buy from a page we could open. Gamma’s affiliate program is not active, and it does not move Gamma ahead of a price we could not check.',
    related: [{ href: '/best/ai-presentation-makers/', title: 'Best AI presentation makers' }]
  },
  {
    slug: 'n8n-vs-zapier-vs-make',
    tools: ['n8n', 'zapier', 'make'],
    title: 'n8n vs Zapier vs Make',
    description: 'n8n vs Zapier vs Make: verified execution and task prices where the vendor published them, and no guessed Make dollars.',
    verdict: 'n8n cloud Starter is €24 a month, or €20 billed annually, for 2,500 workflow executions, and you can self-host the community edition. Zapier’s cards start at $0 for 100 tasks, Professional from $19.99 a month, and Team from $69 a month. Make’s pricing page confirms a free plan of 1,000 credits a month, but the Core, Pro, and Teams dollar amounts were not in the text we could read, so they are omitted. Pick n8n when you want a visible per-execution price or self-hosting, and Zapier when you want the no-code catalog. n8n’s affiliate program is pending and does not change that.',
  },
  {
    slug: 'lovable-vs-bolt-vs-v0',
    tools: ['lovable', 'bolt', 'v0'],
    title: 'Lovable vs Bolt vs v0',
    description: 'Lovable vs Bolt vs v0 for vibe coding. Entry prices checked on each vendor’s docs or pricing page.',
    verdict: 'The entry prices are close, which is the useful part. Lovable Pro starts at $25 a month for 100 credits, or $21 a month billed annually. Bolt Pro is $25 a month billed monthly, starting at 10 million tokens, and Teams is $30 per member. v0 Plus is $30 per user a month. Lovable has a pending affiliate relationship and no affiliate URL yet, so the Visit button goes to lovable.dev. Pick Lovable to ship a hosted full-stack app from a prompt, Bolt for token billing in the browser, and v0 if you are already on React and Vercel.',
    related: [{ href: '/best/ai-app-builders/', title: 'Best AI app builders for vibe coding' }, { href: '/compare/lovable-vs-bolt/', title: 'Lovable vs Bolt' }, { href: '/compare/v0-vs-lovable/', title: 'v0 vs Lovable' }]
  },
  {
    slug: 'cursor-vs-windsurf-vs-claude-code',
    tools: ['cursor', 'windsurf', 'claude-code'],
    title: 'Cursor vs Windsurf vs Claude Code',
    description: 'Cursor vs Windsurf vs Claude Code. Claude Code has a price on claude.com/pricing. Cursor and Windsurf prices are omitted.',
    verdict: 'Claude Code is included with Claude Pro at $20 a month, or $17 a month when $200 is billed up front for the year. Max starts at $100 a month. Cursor’s public pricing page did not match a clean Cursor price list, so this page does not print a Cursor price: see the vendor site. Windsurf’s pricing URL redirects to Devin, and there is no standalone Windsurf checkout, so there is no Windsurf price either. On a price we could verify, Claude Code is the one you can buy from the page we opened.',
    related: [{ href: '/compare/claude-code-vs-openai-codex/', title: 'Claude Code vs OpenAI Codex' }, { href: '/compare/cursor-vs-github-copilot/', title: 'Cursor vs GitHub Copilot' }]
  }
];

export const roundups = [
  {
    slug: 'ai-voice-generators',
    title: 'Best AI voice generators',
    description: 'Best AI voice generators with prices taken from each vendor’s pricing page. ElevenLabs has a live affiliate link. Murf does not.',
    verdict: 'ElevenLabs is the creator plan we could price: Starter is $6 a month for 30,000 credits. Murf is the API option, at $0.01 per 1,000 characters for Falcon, with no studio subscription on the page we opened. ElevenLabs is listed first because that monthly plan exists, not because the link pays a commission.',
    tools: [
      { slug: 'elevenlabs', why: 'Flat monthly plans, including Starter at $6 for 30,000 credits. This is the straightforward voiceover purchase.' },
      { slug: 'murf', why: 'Pay-as-you-go API. Falcon is $0.01 per 1,000 characters. Skip it if you wanted a studio subscription price; that price was not on the page.' }
    ]
  },
  {
    slug: 'ai-app-builders',
    title: 'Best AI app builders for vibe coding',
    description: 'Best AI app builders for vibe coding: Lovable, v0, and Bolt, with entry prices from each vendor.',
    verdict: 'For a whole app from a prompt, Lovable Pro starts at $25 a month (100 credits). v0 Plus is $30 per user a month and is the better pick when the output has to be React on Vercel. Bolt Pro is the same $25 a month as Lovable, billed monthly, and is the token-metered alternative. Lovable’s affiliate program is pending and has no tracking URL, so it is not why Lovable leads this list.',
    tools: [
      { slug: 'lovable', why: 'Hosted full-stack apps from a prompt. Pro is $25 a month for 100 credits, or $21 a month on the annual plan.' },
      { slug: 'v0', why: 'Best when you want React and Next.js UI that deploys to Vercel. Plus is $30 per user a month. Premium at $20 is being sunset for new users and is not listed as a current plan.' },
      { slug: 'bolt', why: 'In-browser builder. Pro is $25 a month billed monthly, starting at 10 million tokens. Teams is $30 per member. Yearly savings are advertised at up to 28%, without yearly dollar amounts on the page.' }
    ]
  },
  {
    slug: 'ai-presentation-makers',
    title: 'Best AI presentation makers',
    description: 'Best AI presentation makers. Beautiful.ai has a published price. Gamma and Tome prices are omitted.',
    verdict: 'Beautiful.ai Pro is $14.50 a month billed annually, with unlimited AI slides. That is the only dollar price we could read on a vendor pricing page. Gamma is fine to try on its free plan, but its paid price is not shown because gamma.app/pricing did not load. Tome is not a recommendation: its pricing URL did not resolve. Gamma is not ranked first, even though an affiliate program is pending.',
    tools: [
      { slug: 'beautiful-ai', why: 'The priced option. Pro is $14.50 a month billed annually. Team is $40 per user billed annually or $50 billed monthly. The 14-day trial needs a card.' },
      { slug: 'gamma', why: 'A free plan exists, and the help center lists monthly credits, but the pricing page did not load and no dollar amount is published here. See the vendor site before you pay.' },
      { slug: 'tome', why: 'tome.app/pricing returned deployment not found. There is no price, and no reason to send you to checkout.' }
    ]
  }
];

export function comparisonTitle(page, bySlug) {
  return page.title || page.tools.map(slug => bySlug[slug].name).join(' vs ');
}

export function guidesFor(slug, bySlug) {
  const pages = [];
  for (const page of comparisons) {
    if (page.tools.includes(slug)) pages.push({ href: `/compare/${page.slug}/`, title: comparisonTitle(page, bySlug) });
  }
  for (const page of roundups) {
    if (page.tools.some(t => t.slug === slug)) pages.push({ href: `/best/${page.slug}/`, title: page.title });
  }
  return pages;
}
