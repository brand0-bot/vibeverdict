// src/data/x-highlights.json is an array of posts we summarize ourselves.
// { author, handle, summary, url, date, likes?, reposts? }
// url must be https://x.com/{handle}/status/{id} (twitter.com is accepted).
// date is YYYY-MM-DD. likes and reposts are optional non-negative integers.
// An empty array hides the On X section.
const POST_URL = /^https:\/\/(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+/;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function count(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function cleanHighlights(raw) {
  if (!Array.isArray(raw)) return [];
  const items = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const author = text(entry.author);
    const handle = text(entry.handle).replace(/^@/, "");
    const summary = text(entry.summary);
    const url = text(entry.url);
    const date = text(entry.date);
    if (!author || !/^[A-Za-z0-9_]{1,15}$/.test(handle) || !summary || !POST_URL.test(url) || !/^\d{4}-\d{2}-\d{2}/.test(date)) continue;
    const item = { author, handle, summary, url, date: date.slice(0, 10) };
    const likes = count(entry.likes);
    const reposts = count(entry.reposts);
    if (likes !== null) item.likes = likes;
    if (reposts !== null) item.reposts = reposts;
    items.push(item);
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  return items;
}
