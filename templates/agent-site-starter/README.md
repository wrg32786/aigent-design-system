# Aigent site starter

An Astro site that an agent (Claude Code, Cursor, or Codex) can build on without lowering the bar. It ships with:

- the Aigent design tokens and four themes (`src/styles/tokens.css`, graphite by default)
- a small section kit: header, hero, proof rows, one scroll story, closing action, footer
- one GSAP scroll timeline with reduced-motion and mobile handling (`src/scripts/scroll-story.ts`)
- an optional Remotion hero-loop slot, off by default
- `AGENTS.md` and `CLAUDE.md` that tell the agent which Aigent skills to load and which gates to run
- the Aigent skills installed under `.claude/skills/`

## Commands

```bash
npm install
npm run dev        # local dev server
npm run build      # static build into dist/
npm run taste      # Aigent copy and design linter on src/ and the built HTML
npm run gates      # build, then the linter; any warning fails
npm run export     # build, then a publish-site local export into .aigent/publish/site
```

Requires Node 22.23 or newer (Astro 7).

## Why Astro

The Aigent system is HTML-first: static templates, CSS tokens, and small scripts. Astro builds to plain static HTML with no client JavaScript unless a component asks for it, so the only script on this page is the scroll story. That output is what the publish-site skill exports and deploys, and `.astro` files are already covered by the Aigent linter.

## Make it yours

1. Fill in `src/site.config.ts` with real facts. All visible copy should trace back to it.
2. Change the theme and the focal visual. Recoloring the starter is not a new brand.
3. Rewrite every section. The demonstration copy describes this starter, not your product.
4. Run `npm run gates`, then check the page at desktop and phone widths with motion on and off.

## Optional Remotion hero loop

Off by default. Scaffold with `--with-remotion` to get an isolated render project in `remotion/`, or add it later by following the `remotion-web-assets` skill. Render into `public/media/`, then set `heroVideo` in `src/site.config.ts`. The site plays the rendered MP4; Remotion never runs in the browser. Reduced motion shows the still instead.

## Deploy

Deployment goes through the Aigent publish-site skill (`.claude/skills/publish-site/SKILL.md`). It exports only files the built entry references, then deploys with the provider's official CLI:

```bash
npm run build
npx --yes --allow-git=all github:wrg32786/aigent-design-system publish export --project-dir dist --entry /index.html --out .aigent/publish/site
npx --yes --allow-git=all github:wrg32786/aigent-design-system publish deploy --provider netlify --mode preview --site my-site --project-dir dist --entry /index.html
```

Swap `netlify` for `vercel` or `cloudflare`. Only deploy to a provider and domain you have authorized.

## Licenses

- Starter code: MIT, from [aigent-design-system](https://github.com/wrg32786/aigent-design-system).
- [Astro](https://astro.build): MIT.
- [GSAP](https://gsap.com): **not MIT.** Installed from npm under GSAP's own [Standard "No Charge" License](https://gsap.com/standard-license) (owned by Webflow). Free for commercial websites, including the former bonus plugins. It may not be used in no-code visual animation builders that compete with Webflow. GSAP source is not copied into this project.
- [Remotion](https://www.remotion.dev) (optional `remotion/` only): **not MIT.** Source-available under the [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md). Free for individuals, for-profit organizations with up to three employees, non-profits, and evaluation. Larger for-profit companies need a paid [company license](https://www.remotion.pro/license). Remotion source is not copied into this project.
- Fonts (Archivo Narrow, Public Sans, Martian Mono via Fontsource): SIL Open Font License 1.1.

Recheck the GSAP and Remotion terms before you ship; both can change.
