# VibeVerdict.ai

VibeVerdict is an “is this AI tool worth it?” tracker. It lists AI, agent, and vibe-coding tools with a one-line verdict, dated pricing (sourced from the vendor), pros and cons, and alternatives. Ratings are Worth it, Depends, Skip, or Pending when a price has not been verified.

## Develop

```bash
npm install
npm run dev
```

## Deploy on Cloudflare Pages

The site is a static [Astro](https://astro.build) build.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |

Connect this repository in Cloudflare Pages, use those build settings, and deploy. `astro.config.mjs` sets the canonical site to `https://vibeverdict.ai`.
