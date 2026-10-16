import { copyFileSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const buildDate = new Date().toISOString();

// lastVerified is the only dated field on a tool. Use it when it is a real
// calendar day; otherwise the page gets the build date. No other dates are invented.
function toolLastChecked() {
  const dir = fileURLToPath(new URL('./src/content/tools/', import.meta.url));
  const dates = new Map();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const value = data.lastVerified;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) continue;
    const time = Date.parse(`${value}T00:00:00.000Z`);
    if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value) continue;
    dates.set(file.slice(0, -5), value);
  }
  return dates;
}

const toolDates = toolLastChecked();

function lastmodFor(url) {
  const path = new URL(url).pathname.replace(/\/+$/, '');
  const tool = path.match(/^\/tools\/([^/]+)$/);
  if (tool && toolDates.has(tool[1])) return toolDates.get(tool[1]);
  return buildDate;
}

// Crawlers request /sitemap.xml. @astrojs/sitemap writes sitemap-index.xml, so copy
// that file after the build. The alias is the index itself, not a second sitemap.
function sitemapXmlAlias() {
  return {
    name: 'sitemap-xml-alias',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const base = dir.href.endsWith('/') ? dir : new URL(`${dir.href}/`);
        const index = fileURLToPath(new URL('sitemap-index.xml', base));
        copyFileSync(index, fileURLToPath(new URL('sitemap.xml', base)));
      }
    }
  };
}

export default defineConfig({
  site: 'https://vibeverdict.ai',
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = lastmodFor(item.url);
        return item;
      }
    }),
    sitemapXmlAlias()
  ]
});
