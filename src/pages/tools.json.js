import { tools } from '../lib/data.js';
export function GET(){ return new Response(JSON.stringify(tools,null,1),{headers:{'Content-Type':'application/json'}}); }
