import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
  integrations: [sitemap(), sitemapXmlAlias()]
});
