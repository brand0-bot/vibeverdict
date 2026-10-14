const files = import.meta.glob('../content/tools/*.json', { eager: true });
export const tools = Object.entries(files).map(([p, m]) => ({ slug: p.split('/').pop().replace('.json',''), ...m.default })).sort((a,b)=>a.name.localeCompare(b.name));
// Optional affiliateUrl on a tool. Absent means the official website.
export function visitUrl(tool) { return tool.affiliateUrl || tool.website; }
export const bySlug = Object.fromEntries(tools.map(t=>[t.slug,t]));
export const categories = { 'coding-agents':'Coding Agents', 'app-builders':'App Builders (Vibe Coding)', 'chat':'Chat & LLMs', 'agent-frameworks':'Agents & Automation', 'media':'Image, Voice & Music', 'writing':'Writing & Docs' };
export const label = { 'worth-it':'Worth it', 'depends':'Depends', 'skip':'Skip', 'pending':'Pending' };
