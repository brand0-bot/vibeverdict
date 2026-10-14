import { tools, categories } from '../lib/data.js';
export function GET(){ const lines=['# VibeVerdict','> Honest, dated verdicts and verified pricing for AI, agent and vibe-coding tools.','',
 ...Object.entries(categories).flatMap(([k,v])=>['## '+v,...tools.filter(t=>t.category===k).map(t=>`- [${t.name}](https://vibeverdict.ai/tools/${t.slug}/): ${t.verdict} Pricing: ${t.pricing.map(p=>p.plan+' '+p.price).join('; ')||'n/a'}. ${t.verified?'Verified '+t.lastVerified:'UNVERIFIED'}.`),''])];
 return new Response(lines.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8'}}); }
