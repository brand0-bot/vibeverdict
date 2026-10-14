# VibeVerdict.ai

VibeVerdict is an “is this AI tool worth it?” tracker. It lists AI, agent, and vibe-coding tools with a one-line verdict, dated pricing (sourced from the vendor), pros and cons, and alternatives. Ratings are Worth it, Depends, Skip, or Pending when a price has not been verified.

## Develop

```bash
npm install
npm run dev
```

## Deploy on Cloudflare Workers

The site is a static [Astro](https://astro.build) build plus `worker/index.js`. `wrangler.jsonc` names the Worker `vibeverdict`, serves `./dist`, and runs that Worker first for `/api/*` so the newsletter box can subscribe through Beehiiv. Node.js is pinned to 22.19.0 in `.node-version`.

For Git-connected Cloudflare Workers Builds:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

`astro.config.mjs` sets the canonical site to `https://vibeverdict.ai`.
