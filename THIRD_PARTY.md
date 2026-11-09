# Third-Party Notes

AIgent-authored code and documentation are MIT licensed. External code, media, models, fonts, services, inspiration references, and registry items remain governed by their own licenses and terms.

## Inspiration references

Inspiration Intelligence stores URL captures, screenshots, motion frames, extracted evidence, and Design DNA under `.aigent/inspiration`, which is ignored by Git.

Do not use it to bypass access controls or collect authenticated, private, paywalled, personal, or confidential material without explicit authority. Do not publish third-party screenshots, copy, assets, code, or extracted private records merely because they were captured locally.

The synthesis workflow is designed to abstract ideas, systems, and methods while excluding source expression:

- source copy and claims
- photographs, footage, 3D assets, audio, icons, logos, and marks
- exact section order
- exact typography pairing and scale
- exact animation timing, keyframes, and camera path
- source HTML, CSS, JavaScript, shaders, and private implementation

The originality audit is a design-review heuristic, not legal advice or a determination of copyright, trademark, patent, privacy, contract, or terms-of-service compliance.

## Browser tooling

Playwright and Chrome DevTools Protocol are used for development-time capture and browser evidence. Their own licenses apply. Optional Chrome DevTools MCP, Stagehand, Figma, Penpot, and local embedding models are documented as adapters but are not vendored or installed by the neutral core.

## Direct runtime references

Some example pages load optional runtimes from public CDNs, including GSAP, `@splinetool/viewer`, and Three.js. Production projects should pin versions, review current licenses, apply an appropriate content-security policy, and self-host when needed.

## Impeccable

The context-first workflow, surface modes, structural layout assessment, role-based typography, motion thesis, anti-reference discipline, and deterministic quality-floor thinking were informed by `pbakaus/impeccable` under Apache License 2.0.

No Impeccable command implementation, detector code, decision UI, source skill text, or project files are vendored. The AIgent planner, Inspiration Intelligence, catalogs, checks, templates, and consolidated skill are original implementations.

## External component sources

`design-intelligence/component-sources.json` links to mature sources such as shadcn/ui, Radix Primitives, Base UI, Ark UI, Floating UI, Motion Primitives, Magic UI, TanStack Virtual, React Bits, and SmoothUI. They are not copied into this repository. Review the exact source, version, registry payload, and license before installation.

## GitHub registry

The root `registry.json` distributes only declared repository files. It does not silently install external registries. Inspect any item before applying it to a project.

## Creative-production catalog

`creative-production/catalog.json` links to third-party marketplaces, stock libraries, AI services, open models, and production utilities. Records are summaries, not legal advice. Verify commercial use, attribution, redistribution, trademark, privacy, model-release, and current plan terms for the exact asset or service.

## Demo media, fonts, and Spline

Demo media is for repository demonstration and should be replaced when a commercial project requires different provenance or warranty. Fonts and public Spline scenes retain their own terms. A working URL is not proof of redistribution rights.

## Ultra Web Design

`skills/aigent-business-sites/` is adapted from [Ultra Web Design](https://github.com/wrg32786/Ultra-web-design) (Apache-2.0, Copyright 2026 Ultra Web Design contributors). Those files stay under Apache-2.0. Ultra's own upstream credits are carried in [`skills/aigent-business-sites/NOTICE.md`](skills/aigent-business-sites/NOTICE.md).

## scroll-craft, taste-skill, and Hallmark

`skills/aigent-design/reference/scroll.md`, `copy.md`, and `gates.md`, the additions to `motion.md`, `craft-floor.md`, and `skills/gsap-scroll-choreography/SKILL.md`, and the `taste/copy-slop-word`, `taste/copy-stock-phrase`, and `taste/scroll-cue` rules in `scripts/design-audit.mjs` are adapted from three MIT-licensed projects:

- [nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft), Copyright (c) 2026 Nate Herk: scroll storytelling method, page grammars, scroll devices and their failure modes, layered heroes, scroll verification
- [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill), Copyright (c) 2026 Leonxlnx: anti-slop copy method, device budget, slop word and stock phrase lists
- [nutlope/hallmark](https://github.com/nutlope/hallmark), Copyright (c) 2026 Hallmark contributors: Floor, Reflex, and Finish review tiers, generated-design tells, fresh-context reviews, native CSS scroll timelines

The material was condensed and rewritten for Aigent. No engine code, scripts, themes, templates, photographs, screenshots, fonts, or media from those projects are vendored. Pinned snapshots, what came from each, and the full MIT notices are in [`skills/aigent-design/NOTICE.md`](skills/aigent-design/NOTICE.md), which ships with the installed skill.

## Agent site starter: Astro, GSAP, Remotion, and fonts

`templates/agent-site-starter/` is Aigent-authored (MIT). It installs its runtime from npm and copies no third-party source into this repository or into scaffolded sites.

- **Astro** (MIT): the site framework, installed from npm.
- **GSAP** (`gsap` on npm): **not MIT.** It is distributed under GSAP's own [Standard "No Charge" License](https://gsap.com/standard-license), owned by Webflow. Commercial websites, including the former bonus plugins, are covered at no charge. The license prohibits use in no-code visual animation builders that compete with Webflow, and Webflow may amend it. The starter imports `gsap` and `gsap/ScrollTrigger` from npm; nothing is vendored.
- **Remotion** (`remotion`, `@remotion/cli` on npm, optional `remotion/` folder only): **not MIT.** It is source-available under the [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md). Free for individuals, for-profit organizations with up to three employees, non-profits, and evaluation; larger for-profit organizations need a paid [company license](https://www.remotion.pro/license). The folder is off by default, is only added with `create-site --with-remotion`, and never runs in the browser.
- **Fonts** (`@fontsource/archivo-narrow`, `@fontsource/public-sans`, `@fontsource/martian-mono`): SIL Open Font License 1.1, installed from npm.

The official [GSAP agent skills](https://github.com/greensock/gsap-skills) and [Remotion agent skills](https://github.com/remotion-dev/skills) are linked as optional installs. They are not copied into this repository or the starter.

Recheck the GSAP and Remotion terms before distribution; both can change.
