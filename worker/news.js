const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const WINDOW_MS = 10 * 24 * 60 * 60 * 1000;
const REFRESH_MINUTES = 30;
const CACHE_URL = "https://vibeverdict.ai/api/headlines";

const SOURCES = [
  { id: "techcrunch", name: "TechCrunch", region: "US", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { id: "verge", name: "The Verge", region: "US", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
  { id: "guardian", name: "The Guardian", region: "UK", url: "https://www.theguardian.com/technology/artificialintelligenceai/rss" },
  { id: "register", name: "The Register", region: "UK", url: "https://www.theregister.com/software/ai_ml/headlines.atom" },
  { id: "nature", name: "Nature", region: "UK", url: "https://www.nature.com/subjects/machine-learning.rss" },
  { id: "lemonde", name: "Le Monde", region: "France", url: "https://www.lemonde.fr/intelligence-artificielle/rss_full.xml" },
  { id: "reddit-llama", name: "Reddit r/LocalLLaMA", region: "Community", url: "https://old.reddit.com/r/LocalLLaMA/.rss", hotRank: true },
  { id: "reddit-ai", name: "Reddit r/artificial", region: "Community", url: "https://old.reddit.com/r/artificial/.rss", hotRank: true },
  { id: "hn", name: "Hacker News", region: "Community", url: "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=40", kind: "hn" },
];

const AI_TITLE = /\b(AI|A\.I\.|LLM|LLMs|GPT|OpenAI|ChatGPT|Claude|Gemini|Anthropic|DeepMind|machine learning|artificial intelligence|generative)\b/i;

function decode(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => safeCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => safeCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeCodePoint(n) {
  if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) return "";
  try { return String.fromCodePoint(n); } catch { return ""; }
}

function tagText(block, tag) {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decode(match[1]) : "";
}

function linkHref(block) {
  const match = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i);
  if (match) return decode(match[1]);
  return tagText(block, "link");
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.href;
  } catch {
    return "";
  }
}

function itemsFromXml(xml, source) {
  const chunks = String(xml || "").split(/<(?:item|entry)\b/i).slice(1);
  const items = [];
  chunks.slice(0, 15).forEach((chunk, index) => {
    const block = chunk.split(/<\/(?:item|entry)>/i)[0];
    const title = tagText(block, "title");
    const url = safeUrl(linkHref(block));
    const published = tagText(block, "published") || tagText(block, "updated") || tagText(block, "pubDate") || tagText(block, "dc:date");
    const publishedAt = Date.parse(published);
    if (!title || !url || !publishedAt) return;
    items.push({
      title,
      url,
      source: source.name,
      region: source.region,
      publishedAt: new Date(publishedAt).toISOString(),
      popularity: source.hotRank ? Math.max(1, 12 - index) * 2 : 0,
    });
  });
  return items;
}

function itemsFromHn(payload) {
  const hits = payload && Array.isArray(payload.hits) ? payload.hits : [];
  const items = [];
  for (const hit of hits) {
    const title = decode(hit.title);
    if (!title || !AI_TITLE.test(title)) continue;
    const url = safeUrl(hit.url) || safeUrl(hit.story_url) || safeUrl(`https://news.ycombinator.com/item?id=${hit.objectID || ""}`);
    const publishedAt = Date.parse(hit.created_at);
    if (!url || !publishedAt) continue;
    const points = Number(hit.points);
    items.push({
      title,
      url,
      source: "Hacker News",
      region: "Community",
      publishedAt: new Date(publishedAt).toISOString(),
      popularity: Number.isFinite(points) && points > 0 ? points : 0,
    });
  }
  return items;
}

function normTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function titleKey(title) {
  return normTitle(title).split(" ").filter((word) => word.length > 2).slice(0, 8).join(" ");
}

function urlKey(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return url;
  }
}

function sameStory(a, b) {
  if (urlKey(a.url) === urlKey(b.url)) return true;
  const left = titleKey(a.title);
  const right = titleKey(b.title);
  if (!left || !right) return false;
  return left === right || left.startsWith(right) || right.startsWith(left);
}

export function rankItems(items, now = Date.now()) {
  const fresh = items.filter((item) => {
    const ts = Date.parse(item.publishedAt);
    return ts && ts <= now + 5 * 60 * 1000 && now - ts <= WINDOW_MS;
  });
  fresh.sort((a, b) => score(b, now) - score(a, now) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const kept = [];
  const counts = new Map();
  for (const item of fresh) {
    if (kept.some((other) => sameStory(other, item))) continue;
    const count = counts.get(item.source) || 0;
    if (count >= 4) continue;
    counts.set(item.source, count + 1);
    kept.push({
      title: item.title,
      url: item.url,
      source: item.source,
      region: item.region,
      publishedAt: item.publishedAt,
    });
    if (kept.length >= 40) break;
  }
  return kept;
}

function score(item, now) {
  const ageHours = Math.max(0, (now - Date.parse(item.publishedAt)) / 3600000);
  const boostHours = Math.log10(1 + Math.max(0, item.popularity || 0)) * 6;
  return -ageHours + boostHours;
}

async function loadSource(source) {
  const response = await fetch(source.url, {
    headers: { "user-agent": UA, accept: source.kind === "hn" ? "application/json" : "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`${source.id} ${response.status}`);
  if (source.kind === "hn") return itemsFromHn(await response.json());
  return itemsFromXml(await response.text(), source);
}

export async function buildNews() {
  const results = await Promise.all(SOURCES.map(async (source) => {
    try {
      return { ok: true, items: await loadSource(source) };
    } catch {
      return { ok: false, items: [] };
    }
  }));
  const failed = results.filter((result) => !result.ok).length;
  const items = rankItems(results.flatMap((result) => result.items));
  return {
    ok: failed < SOURCES.length,
    updatedAt: new Date().toISOString(),
    refreshMinutes: REFRESH_MINUTES,
    items,
  };
}

function newsResponse(payload, ttl) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=120",
      "cdn-cache-control": `public, max-age=${ttl}`,
    },
  });
}

export async function newsFromCache() {
  const cacheKey = new Request(CACHE_URL);
  try {
    const cached = await caches.default.match(cacheKey);
    if (cached) return cached;
  } catch { /* local runtimes may not expose the cache */ }
  const payload = await buildNews();
  const ttl = payload.ok ? REFRESH_MINUTES * 60 : 120;
  const response = newsResponse(payload, ttl);
  try {
    await caches.default.put(cacheKey, response.clone());
  } catch { /* serving the fresh payload is enough */ }
  return response;
}

export async function refreshNewsCache() {
  const payload = await buildNews();
  const ttl = payload.ok ? REFRESH_MINUTES * 60 : 120;
  const response = newsResponse(payload, ttl);
  try {
    await caches.default.put(new Request(CACHE_URL), response.clone());
  } catch { /* cron still exercised the feeds */ }
  return response;
}
