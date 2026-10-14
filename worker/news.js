const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const WINDOW_MS = 10 * 24 * 60 * 60 * 1000;
const REFRESH_MINUTES = 30;
const CACHE_URL = "https://vibeverdict.ai/api/ai-news-covers";
const OG_CACHE_PREFIX = "https://vibeverdict.ai/og-image-cache/v1/";
const OG_FETCH_LIMIT = 12;
const OG_HOSTS = new Set([
  "techcrunch.com",
  "www.theverge.com",
  "theverge.com",
  "www.theguardian.com",
  "theguardian.com",
  "www.theregister.com",
  "theregister.com",
  "www.nature.com",
  "nature.com",
  "www.lemonde.fr",
  "lemonde.fr",
]);

const SOURCES = [
  { id: "techcrunch", name: "TechCrunch", region: "US", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { id: "verge", name: "The Verge", region: "US", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
  { id: "guardian", name: "The Guardian", region: "UK", url: "https://www.theguardian.com/technology/artificialintelligenceai/rss" },
  { id: "register", name: "The Register", region: "UK", url: "https://www.theregister.com/software/ai_ml/headlines.atom" },
  { id: "nature", name: "Nature", region: "UK", url: "https://www.nature.com/subjects/machine-learning.rss" },
  { id: "lemonde", name: "Le Monde", region: "France", url: "https://www.lemonde.fr/intelligence-artificielle/rss_full.xml" },
  { id: "reddit-llama", name: "Reddit r/LocalLLaMA", region: "Community", kind: "reddit", url: "https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=LocalLLaMA&limit=15&sort=desc" },
  { id: "reddit-ai", name: "Reddit r/artificial", region: "Community", kind: "reddit", url: "https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=artificial&limit=15&sort=desc" },
  { id: "hn", name: "Hacker News", region: "Community", url: "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=40", kind: "hn" },
];

const AI_TITLE = /\b(AI|A\.I\.|LLM|LLMs|GPT|OpenAI|ChatGPT|Claude|Gemini|Anthropic|DeepMind|machine learning|artificial intelligence|generative)\b/i;

const TOPICS = [
  { id: "hardware", label: "Chips", pattern: /\b(gpus?|nvidia|geforce|cuda|tpus?|chips?|chipmakers?|microchips?|semiconductors?|hbm|wafer|foundry|asics?|tsmc|blackwell|hardware)\b/i },
  { id: "robotics", label: "Robotics", pattern: /\b(robots?|robotics|humanoids?|drones?|embodied)\b/i },
  { id: "security", label: "Security", pattern: /\b(security|privacy|deepfakes?|cyber|hack(?:ed|ers|ing)?|vulnerabilit(?:y|ies)|malware|ransomware|encryption|surveillance|phishing|infosec)\b/i },
  { id: "policy", label: "Policy", pattern: /\b(regulations?|regulatory|laws?|lawyers?|legal|government|policy|policies|congress|senate|parliament|legislation|antitrust|lawsuits?|court|copyright|white house)\b/i },
  { id: "money", label: "Business", pattern: /\b(funding|fundrais\w*|stocks?|shares?|ipo|valuation|invest(?:or|ors|ment|ing)?|revenue|profits?|startup|startups|business|markets?|debt|acqui(?:re|sition|red)|layoffs?|earnings|venture)\b/i },
  { id: "research", label: "Research", pattern: /\b(research|scientists?|science|stud(?:y|ies)|health|healthcare|medical|clinical|papers?|physics|biology|journal|patients?|diagnos\w*|disease|neuroimaging|neuroscience|brain|dataset|preprint)\b/i },
  { id: "creative", label: "Creative", pattern: /\b(images?|videos?|music|songs?|audio|voice|arts?|midjourney|sora|runway|films?|cinema|photos?|youtube|creative|animation|podcasts?)\b/i },
  { id: "opensource", label: "Open source", pattern: /\b(open[- ]source|huggingface|hugging face|ollama|gguf|local (?:models?|llms?)|weights|mistral|qwen|deepseek|llama|on-device|self-host(?:ed|ing)?)\b/i },
  { id: "coding", label: "Coding", pattern: /\b(cod(?:e|ing)|developers?|programming|github|copilot|software|engineers?|agents?|cursor|vscode|devtools?|pull requests?)\b/i },
  { id: "models", label: "Models", pattern: /\b(llms?|gpts?|openai|anthropic|claude|gemini|chatgpt|deepmind|language models?|foundation models?|meta|google|models?)\b/i },
];

function clipText(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).trim();
}

function summaryFromBlock(block) {
  const description = tagText(block, "description");
  const summary = tagText(block, "summary");
  const body = tagText(block, "content:encoded");
  const lead = description || summary;
  if (lead && lead.length >= 80) return clipText(lead, 700);
  return clipText(`${lead} ${body}`.trim(), 700);
}

export function topicFor(title, summary) {
  const hay = `${title || ""}\n${summary || ""}`;
  for (const topic of TOPICS) {
    if (topic.pattern.test(hay)) return topic;
  }
  return { id: "ai", label: "AI" };
}

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

function attr(fragment, name) {
  const match = String(fragment || "").match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decode(match[1]) : "";
}

function acceptImage(value, width) {
  const url = safeUrl(value);
  if (!url) return "";
  if (width && width < 80) return "";
  if (/favicon|sprite|pixel|spacer|1x1|blank\.gif|emoji/i.test(url)) return "";
  return url;
}

function imageFromBlock(block) {
  const found = [];
  const tagRe = /<(media:content|media:thumbnail|enclosure)\b([^>]*)\/?>/gi;
  let match;
  while ((match = tagRe.exec(block))) {
    const kind = match[1].toLowerCase();
    const attrs = match[2];
    const type = attr(attrs, "type").toLowerCase();
    const medium = attr(attrs, "medium").toLowerCase();
    if (medium && medium !== "image") continue;
    if (type && !type.startsWith("image/")) continue;
    const url = attr(attrs, "url");
    if (kind === "enclosure" && !type && !/\.(?:jpe?g|png|webp|gif|avif)(?:$|\?)/i.test(url)) continue;
    if (url) found.push({ url, width: Number(attr(attrs, "width")) || 0 });
  }
  const imgRe = /<img\b[^>]*>/gi;
  while ((match = imgRe.exec(block))) {
    const url = attr(match[0], "src");
    if (url) found.push({ url, width: Number(attr(match[0], "width")) || 0 });
  }
  found.sort((a, b) => (b.width || 0) - (a.width || 0));
  for (const candidate of found) {
    const image = acceptImage(candidate.url, candidate.width);
    if (image) return image;
  }
  return "";
}

function redditPreviewUrl(image) {
  const options = [];
  if (image && image.source && image.source.url) options.push(image.source);
  if (image && Array.isArray(image.resolutions)) options.push(...image.resolutions);
  const usable = options.filter((option) => option && option.url && Number(option.width) >= 480);
  usable.sort((a, b) => Math.abs(Number(a.width) - 960) - Math.abs(Number(b.width) - 960));
  return usable.length ? String(usable[0].url) : "";
}

function imageFromReddit(row) {
  const images = row && row.preview && Array.isArray(row.preview.images) ? row.preview.images : [];
  if (images.length) {
    const source = images[0] && images[0].source;
    const image = acceptImage(decode(redditPreviewUrl(images[0])), Number(source && source.width) || 0);
    if (image) return image;
  }
  const thumb = String(row && row.thumbnail || "");
  if (/^https?:\/\//i.test(thumb)) return acceptImage(thumb, Number(row.thumbnail_width) || 0);
  return "";
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
      image: imageFromBlock(block),
      summary: summaryFromBlock(block),
    });
  });
  return items;
}

function itemsFromReddit(payload, source) {
  const rows = payload && Array.isArray(payload.data) ? payload.data : [];
  const items = [];
  for (const row of rows.slice(0, 15)) {
    if (!row || row.removed_by_category || row.banned_by) continue;
    const title = decode(row.title);
    const permalink = String(row.permalink || "");
    const url = safeUrl(permalink.startsWith("http") ? permalink : `https://www.reddit.com${permalink}`);
    const created = Number(row.created_utc);
    if (!title || !url || !created) continue;
    const score = Number(row.score);
    items.push({
      title,
      url,
      source: source.name,
      region: source.region,
      publishedAt: new Date(created * 1000).toISOString(),
      popularity: Number.isFinite(score) && score > 0 ? score : 0,
      image: imageFromReddit(row),
      summary: clipText(decode(row.selftext || "").replace(/^\[(removed|deleted)\]$/, ""), 700),
    });
  }
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
      summary: clipText(decode(hit.story_text || ""), 700),
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
    const topic = topicFor(item.title, item.summary);
    kept.push({
      title: item.title,
      url: item.url,
      source: item.source,
      region: item.region,
      publishedAt: item.publishedAt,
      image: acceptImage(item.image, 0) || null,
      topic: topic.id,
      topicLabel: topic.label,
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
  if (source.kind === "reddit") return itemsFromReddit(await response.json(), source);
  return itemsFromXml(await response.text(), source);
}

function ogHostAllowed(pageUrl) {
  try {
    return OG_HOSTS.has(new URL(pageUrl).hostname.toLowerCase());
  } catch {
    return false;
  }
}

function ogCacheRequest(pageUrl) {
  return new Request(OG_CACHE_PREFIX + encodeURIComponent(pageUrl));
}

async function readCachedOg(pageUrl) {
  try {
    if (typeof caches === "undefined" || !caches.default) return null;
    const hit = await caches.default.match(ogCacheRequest(pageUrl));
    if (!hit) return null;
    const data = await hit.json();
    return acceptImage(data && data.image, 0);
  } catch {
    return null;
  }
}

async function storeCachedOg(pageUrl, image) {
  const ttl = image ? 7 * 24 * 3600 : 12 * 3600;
  const response = new Response(JSON.stringify({ image: image || "" }), {
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=${ttl}`,
    },
  });
  try {
    if (typeof caches === "undefined" || !caches.default) return;
    await caches.default.put(ogCacheRequest(pageUrl), response);
  } catch { /* a missed cache still returns the image for this response */ }
}

async function readHead(response) {
  if (!response.body || typeof response.body.getReader !== "function") {
    return (await response.text()).slice(0, 65536);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  try {
    while (html.length < 65536) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
  } finally {
    try { await reader.cancel(); } catch { /* the body may already be closed */ }
  }
  return html;
}

function extractOg(html, pageUrl) {
  const patterns = [
    /<meta\b[^>]*\bproperty\s*=\s*["']og:image(?::secure_url|:url)?["'][^>]*>/gi,
    /<meta\b[^>]*\bname\s*=\s*["']twitter:image(?::src)?["'][^>]*>/gi,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html))) {
      const content = attr(match[0], "content");
      let absolute = "";
      try { absolute = new URL(content, pageUrl).href; } catch { absolute = ""; }
      const image = acceptImage(absolute, 0);
      if (image) return image;
    }
  }
  return "";
}

async function fetchOgImage(pageUrl) {
  const response = await fetch(pageUrl, {
    headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) return { image: "", cache: response.status === 404 || response.status === 410 };
  const type = response.headers.get("content-type") || "";
  if (type && !/html|xml/i.test(type)) return { image: "", cache: true };
  const html = await readHead(response);
  return { image: extractOg(html, response.url || pageUrl), cache: true };
}

async function attachOgImages(items) {
  const pending = [];
  for (const item of items) {
    if (item.image || !ogHostAllowed(item.url)) continue;
    const cached = await readCachedOg(item.url);
    if (cached !== null) {
      item.image = cached || null;
      continue;
    }
    pending.push(item);
  }
  await Promise.all(pending.slice(0, OG_FETCH_LIMIT).map(async (item) => {
    try {
      const found = await fetchOgImage(item.url);
      item.image = found.image || null;
      if (found.cache) await storeCachedOg(item.url, found.image);
    } catch { /* leave the card on the placeholder */ }
  }));
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
  try {
    await attachOgImages(items);
  } catch { /* headlines still render without thumbnails */ }
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
