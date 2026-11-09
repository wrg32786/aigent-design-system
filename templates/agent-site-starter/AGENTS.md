# Agent instructions

This site was scaffolded from the Aigent site starter. It is already wired to the Aigent design rules. Follow this file for every design, copy, or frontend change.

## Load the skills first

Before writing or changing any page, read:

1. `.claude/skills/aigent-design/SKILL.md`, the design router. It routes to the references below.
2. `.claude/skills/aigent-design/reference/craft-floor.md` before implementation and again before review.
3. `.claude/skills/aigent-design/reference/copy.md` before writing any visible text.
4. `.claude/skills/aigent-design/reference/scroll.md` and `.claude/skills/gsap-scroll-choreography/SKILL.md` before touching scroll or motion.
5. `.claude/skills/aigent-design/reference/gates.md` before calling a page done.
6. `.claude/skills/publish-site/SKILL.md` before any deploy.
7. `.claude/skills/remotion-web-assets/SKILL.md` only if `remotion/` exists and the hero loop is in scope.

Specialist skills mention paths such as `integrations/gsap/README.md`. Those live in the Aigent repository: https://github.com/wrg32786/aigent-design-system. They are not copied here.

If the skills folder is missing, install it:

```bash
npx --yes --allow-git=all github:wrg32786/aigent-design-system install
```

Optional tool-specific skills, maintained by their vendors (not bundled here):

- GSAP: `npx skills add https://github.com/greensock/gsap-skills`
- Remotion: `npx skills add remotion-dev/skills`

## Project authority

- `src/site.config.ts` is the fact sheet. Copy comes from it. Do not invent metrics, quotes, customers, or logos.
- `src/styles/tokens.css` holds the design tokens (copied from Aigent). Change the visual world through tokens and `src/styles/site.css`, not raw colors in components.
- The demonstration copy describes this starter. Replace all of it before shipping.
- Once the user approves a direction, record it in `.aigent/design-direction.md` and follow it on later pages.

## Rules that stay

- one `h1` per page; skip link and visible focus states
- every chapter readable with JavaScript off and with reduced motion on
- one GSAP timeline per sequence (`src/scripts/scroll-story.ts`); no scattered triggers
- GSAP and Remotion come from npm only; never copy or vendor their source
- the Remotion hero loop stays off (`heroVideo: null`) unless the brief earns it
- no secrets, tokens, or private data in the repo or the build

## Before you ship

Run the gates and fix every error and warning, or record a waiver as `gates.md` describes:

```bash
npm run gates            # build, then the Aigent copy and design linter; any warning fails
```

The linter reads `src/` and the built `dist/index.html`. When you add pages, add their built HTML (for example `dist/about/index.html`) to the `taste` and `gates` scripts. It skips bundled library code in `dist/_astro/` on purpose.

Then check the page in a browser at 1280 x 800 and 390 x 844, with motion on and with reduced motion, and walk the Floor, Reflex, and Finish tiers in `gates.md`. For browser-measured checks:

```bash
npx --yes --allow-git=all github:wrg32786/aigent-design-system setup-browser
npm run preview -- --port 4321 &
npx --yes --allow-git=all github:wrg32786/aigent-design-system resolve --target . --url http://127.0.0.1:4321
```

## Deploy

Use the publish-site skill. The site builds to static files in `dist/`:

```bash
npm run export   # build, then a local export through publish-site
```

Deploy only to a provider and domain the user has authorized. See the README for provider commands.
