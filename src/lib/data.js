const files = import.meta.glob('../content/tools/*.json', { eager: true });
export const tools = Object.entries(files).map(([p, m]) => ({ slug: p.split('/').pop().replace('.json',''), ...m.default })).sort((a,b)=>a.name.localeCompare(b.name));
const reviewFiles = import.meta.glob('../content/reviews/*.json', { eager: true });
export const reviews = Object.fromEntries(Object.entries(reviewFiles).map(([p, m]) => [p.split('/').pop().replace('.json', ''), m.default]));
// Optional affiliateUrl on a tool. Absent means the official website.
export function visitUrl(tool) { return tool.affiliateUrl || tool.website; }
export const bySlug = Object.fromEntries(tools.map(t=>[t.slug,t]));
export const categories = { 'coding-agents':'Coding Agents', 'app-builders':'App Builders (Vibe Coding)', 'chat':'Chat & LLMs', 'agent-frameworks':'Agents & Automation', 'media':'Image, Voice & Music', 'writing':'Writing & Docs' };
export const categoryBlurbs = {
  'coding-agents': 'Coding agent verdicts and pricing for Cursor, Claude Code, GitHub Copilot, Warp, Windsurf, and the other tools in this category.',
  'app-builders': 'App builder verdicts and pricing for Lovable, Bolt.new, v0, Replit, and Base44. A price is shown only after we verify it on the vendor site.',
  'chat': 'Chat and LLM verdicts and pricing for ChatGPT, Claude, Gemini, Grok, and Perplexity, with the date each price was last checked.',
  'agent-frameworks': 'Agent and automation verdicts and pricing for n8n, Zapier, Make, CrewAI, and LangChain. Unverified prices are left off the page.',
  'media': 'Image, voice, and music verdicts and pricing for ElevenLabs, Murf, Midjourney, Runway, and Suno. Each price links to the official source.',
  'writing': 'Writing and docs verdicts and pricing for Notion AI, Gamma, Jasper, Beautiful.ai, and Tome. Prices we could not verify are marked.'
};
export const label = { 'worth-it':'Worth it', 'depends':'Depends', 'skip':'Skip', 'pending':'Pending' };
