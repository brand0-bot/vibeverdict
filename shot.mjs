import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1280,height:900} });
await p.goto('http://localhost:4321/'); await p.screenshot({ path:'screenshots/home.png', fullPage:true });
await p.goto('http://localhost:4321/tools/lovable/'); await p.screenshot({ path:'screenshots/tool-lovable.png', fullPage:true });
await b.close();
