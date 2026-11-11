# Changelog

## Unreleased — Product hardening

### Added

- `templates/agent-site-starter`: Astro site starter wired to the design rules, with the token themes, a small section kit (header, hero, proof rows, scroll story, closing action, footer), one GSAP scroll timeline with mobile and reduced-motion handling, an optional Remotion hero-loop project that is off by default, `AGENTS.md`/`CLAUDE.md`/Cursor rule that load the skills and require the gates, and publish-site deploy notes
- `create-site <dir>` CLI command (also `npm run create-site` and `scripts/create-site.mjs`) that scaffolds the starter, copies `tokens/system.css`, installs the Aigent, GSAP choreography, and publish-site skills, and runs `npm install`
- `agent-site-starter` and `agent-site-remotion-hero` registry items, used as the scaffold manifest
- `npm run starter:check` contract test, also run by `npm run check`; in CI (or with `--build`) it scaffolds with `npm install`, builds with Astro, runs the design audit and copy linter with warnings as failures, and exports through publish-site
- `THIRD_PARTY.md` notes for Astro, GSAP's Standard "No Charge" License, Remotion's company license, and Fontsource fonts
- `reference/scroll.md`: feeling curve and single peak, eight page grammars, scroll device families with tuning ranges, scrub/pin/pan failure modes, layered heroes, signature move and structural fingerprint check, native CSS scroll timelines, and scroll verification (adapted from scroll-craft and Hallmark, MIT)
- `reference/copy.md`: fact sheet, voice card, reader-question shape, per-page device budget, banned slop, and over-correction table (adapted from taste-skill and Hallmark, MIT)
- `reference/gates.md`: Floor, Reflex, and Finish review tiers with on-the-record waivers, six-axis pre-build critique, mirror test, concrete generated-design tells, and fresh-context hero and finish reviews (adapted from Hallmark and taste-skill, MIT)
- Taste rules `taste/copy-slop-word`, `taste/copy-stock-phrase`, and `taste/scroll-cue` for visible HTML copy, with literal trade uses exempted, plus self-check fixtures
- `skills/aigent-design/NOTICE.md` with pinned source snapshots and MIT notices, installed with the skill
- `aigent-business-sites` specialist skill adapted from Ultra Web Design: business content architecture, proof ladder, preserve-mode redesign, release audit, working templates, and business-site evals
- install ownership manifest at `.aigent/install.json`
- project-safe `init`, explicit `setup-browser`, stronger `doctor`, package-backed `taste`, and safe `uninstall` commands
- consumer install contract test covering existing project authority, update conflicts, and modified-file preservation
- selective `.gitignore` management for private/runtime Aigent evidence
- private/local-network guard for Inspiration URL capture with explicit `--allow-private` override
- comparative evaluation protocol and fixed bright-consumer, dense-operations, and cinematic-launch briefs
- `case-studies/site-library`: write-up of the Site Library, fictional brand sites built to this skill, with its method and the two finished sites, Deep Line Subsea and Six Lines (two screenshots each, no site source or assets)
- `reference/type.md`: pairing rule (one loud display face over one quiet partner, no pairing repeated across a set of sites), a table of free pairings, free stand-ins for commercial styles, and a reset of scale, tracking, and line height on every type pass
- `reference/layout.md`: screen rhythm at 1440, 820, 768, and 390, two-screen sections as two groups with nothing crossing the screen line, and a console recipe that lists every block's distance from the line
- `reference/resolve.md`: five-viewport `aigent.resolve.json` for pages with a screen rhythm or tablet layout, and a scratch copy with the hero forced to one screen to separate hero findings from section findings
- `reference/media.md`: stand-in photography rules (licence, credits page, one grade, true to the copy, new file name on replace under an immutable cache)

### Changed

- `copy.md` now forbids hiding copy with `display: none` to fit a screen; a cut is made in the markup and recorded with its reason
- `gates.md` adds two Floor tells (component custom properties a system token can shadow, unregistered fluid and component tokens) and says a reviewer's `ship` is not the owner's approval
- `scroll.md` adds depth layers on film time and keeps a signature's feedback on screen with its control on phones
- `cinematic-asset-gallery` shows a motion site as a recorded loop of its motion, never a still
- `motion.md`, `craft-floor.md`, and `gsap-scroll-choreography` now carry reveal, count, pointer, and parallax calibration, the new refuse-by-default items, and pointers to the scroll, copy, and gates references
- default install now writes only Aigent skill/vendor files under `.claude/skills/aigent-design/`; it no longer follows registry dependencies into customer project roots
- `init` creates `.aigent/project-context.md` instead of installing Aigent's own `PRODUCT.md` or `DESIGN.md` into consumer repos
- browser-backed commands run through the Aigent package rather than copied project scripts
- README now describes Taste as a smell linter, Vision as a structured review protocol, and Design Intelligence as deterministic planning rather than overstating autonomous visual judgment
- Vault and immersive deck now use the current agent-native install path and no longer teach retired Studio/shadcn workflows
- publishing guidance no longer depends on retired Canvas state
- CI now validates the consumer product boundary and runs on `master` pushes as well as pull requests
- roadmap now prioritizes comparative proof, real case studies, platform fixtures, visual regression, and immutable distribution before additional major features

## 1.4.0 — Aigent Art Direction

### Added

- small installed visual exemplar library for hierarchy, product proof, cinematic coherence, typography, and common generated-design failure modes
- internal Variance, Motion, and Density controls so expression adapts to the product instead of converging on one house style
- persistent `.aigent/design-direction.md` contract after the user approves a visual direction
- preservation contract for scoped iterations so targeted improvements do not casually redesign unrelated approved work

### Changed

- the primary Aigent skill now treats visual examples as calibration rather than templates
- later pages and large revisions read the approved design direction before designing
- plain-language requests such as “make it wilder,” “calm the motion down,” and “show me more at once” map to creative controls
- one-command install now ships the visual exemplar library and remains idempotent
- README is shorter and explains the design-team workflow through one concrete example
- package version is now `1.4.0`

## 1.3.0 — Agent-native Aigent

### Changed

- retired the Desktop/Studio product direction and removed the Electron application, visual IDE, installer, provider-auth shell, and associated release pipeline
- centered Aigent on the coding agent the user already has: install into a repo, open Claude Code, and speak normally
- added a one-command `npx github:wrg32786/aigent-design-system install` path
- made the `aigent-design` skill the proactive router for design direction, specialist skills, production, Taste, Resolve, Vision, and publishing
- simplified the repository, product docs, landing page, CI, and README around the agent-native workflow

## 1.2.0 — AIgent Ship

### Added

- Studio Ship panel for local export, Netlify, Vercel, and Cloudflare Pages
- constrained dependency-traversing static exporter with private-file and credential guards
- pre-publish Git checkpoint and Canvas-journal gate
- optional preflight and live AIgent Resolve verification
- optional live AIgent Vision capture preparation
- local deployment history and exact-artifact redeploy
- Vercel domain aliasing plus Netlify and Cloudflare domain follow-up
- publish-site skill, provider catalog, CLI, self-check, and registry item

### Changed

- package and desktop version are now `1.2.0`
- complete Studio installs now include the Ship and Publish system

## 1.1.0 — AIgent Desktop

### Added

- native Electron desktop shell around the real localhost AIgent Studio
- custom five-step installation and first-run setup wizard
- separate workspace selection so application updates never remove projects
- Git, Node, npm, Git Bash, Claude Code, and Codex environment detection
- one-click official Claude Code and Codex installation plus visible terminal authentication
- one-click Studio launch and clean local-server process management
- launch-at-login, automatic update, diagnostics export, repair, logs, and app-data reset controls
- assisted Windows NSIS installer with selectable install directory, desktop and Start-menu shortcuts, and normal uninstall support
- architecture-matched macOS Apple Silicon and Intel DMG/ZIP packaging with custom artwork
- Windows signing and macOS signing/notarization hooks in the release workflow
- generated installer artwork and cross-platform desktop contract checks

### Changed

- package version is now `1.1.0`
- packaged child tooling uses the Electron runtime while preserving external Claude Code and Codex authentication
- validated releases now trigger native installer builds and attach them to GitHub Releases

## 1.0.0 — AIgent Canvas

### Added

- DOM-backed visual editing against the real website preview
- stable rendered element identity, hover bounds, click selection, and shift-click multi-selection
- synchronized semantic layers tree
- inline text editing and allowlisted content, layout, typography, appearance, position, and motion controls
- base, tablet, and mobile responsive overrides
- resize handles, sibling reordering, duplication, removal, and component insertion
- project component library and design-token browser
- structured Canvas patch journal with undo and redo
- element-bound comments, participant presence, and remote selection state
- local Git checkpoints, restore, and source diff
- selected-element and open-comment context for Claude Code and Codex
- agent-driven distillation of approved Canvas edits into production source
- Canvas schema, DOM bridge, Studio skill updates, and complete browser verification

### Changed

- package version is now `1.0.0`
- AIgent Studio is now the primary visual operating surface rather than only a brief, preview, and agent shell
- the real project remains the source of truth; Canvas edits are reversible operator intent until distilled
- the consolidated design skill now routes direct visual editing through the Canvas contract

## 0.6.0 — AIgent Studio

### Added

- local interactive website builder with live desktop, tablet, and mobile preview
- project brief, reference, starter, and agent controls in one UI
- authenticated Claude Code and Codex CLI integration with streamed activity and cancellation
- persistent Claude Code session per Studio project
- direct Design Intelligence planning, Inspiration forensics, Resolve, and Vision preparation
- isolated local project workspaces with bounded paths, request sizes, hidden-file protection, and localhost-only serving
- installable `aigent-studio` registry item and specialist operating skill

### Changed

- package version is now `0.6.0`
- `full-studio` now includes the interactive Studio UI

## 0.5.0 — AIgent Vision

### Added

- annotated desktop, tablet, mobile, and reduced-motion screenshots
- stable numbered `E###` element maps with selectors, bounds, labels, and computed visual roles
- twelve-dimension structured aesthetic critique
- proof that every required viewport was reviewed by a host agent, human, or explicit vision adapter
- visual P0-P3 findings with visible evidence, repairs, confidence, and preservation constraints
- combined mechanical and visual repair ranking
- before-and-after visual comparison
- final completion gate requiring no open P0/P1 visual finding
- `aigent-design vision prepare`, `vision check`, and `vision finalize`
- installable `vision-critic` registry item and `visual-design-critic` skill

### Changed

- primary workflow is now `Shape → Inspire → Synthesize → Produce → Build → Resolve → See`
- package version is now `0.5.0`
- Design Resolver now installs AIgent Vision
- a screenshot existing on disk no longer counts as visual review

## 0.4.0 — AIgent Resolve

### Added

- `aigent-design resolve` render, rank, repair, rerender, and review workflow
- desktop, tablet, mobile, 200% text-size, and reduced-motion evidence
- runtime, request, overflow, focus, hit-area, contrast, clipping, fixed-coverage, and image-dimension checks
- ranked repair contract with product, design, and inspiration preservation rules
- run-to-run comparison of resolved, introduced, and persistent findings
- configurable mechanical score gate with explicit human-review requirement
- installable `design-resolver` registry item and specialist skill
- branded AIgent Design System README banner
- CI proof for the static resolver check and rendered browser resolver

### Changed

- primary workflow is now `Shape → Inspire → Synthesize → Produce → Build → Resolve`
- package version is now `0.4.0`
- `full-studio` now includes AIgent Resolve
- the primary `aigent-design` skill now owns the final repair loop

## 0.3.0 — Inspiration Intelligence

### Added

- URL-first design forensics with Playwright and Chrome DevTools Protocol evidence
- multi-viewport screenshots, full-page captures, scroll traversal, and motion filmstrips
- normalized Design DNA for structure, typography, material, motion, interaction, media, and responsive behavior
- screenshot, video, structured-reference, Figma, and manual-analysis intake path
- local searchable inspiration store under `.aigent/inspiration`
- reference synthesis with six design dimensions and a two-dimensions-per-source limit
- required transformations, source exclusions, AIgent pattern mapping, and influence ledger
- originality heuristics for source dominance and copy overlap
- interactive Inspiration Lab
- Design Forensics, Reference Synthesis, and Inspiration Originality Audit agent skills
- InspirationBench briefs and rubric
- registry item and CLI commands for Inspiration Intelligence
- browser smoke coverage using a real responsive animated fixture

### Changed

- primary workflow is now `Shape → Inspire → Synthesize → Produce → Build → Verify`
- package version is now `0.3.0`
- the consolidated `aigent-design` skill now owns inspiration routing
- `full-studio` now includes Inspiration Intelligence

## 0.2.0 — Design Intelligence and Installable Systems

- GitHub-native shadcn registry and zero-dependency local CLI
- consolidated `aigent-design` skill
- deterministic design planner and complete page, deck, interface, and Three.js reference systems
- reusable interaction patterns, Design Vault, fixed evals, browser captures, and release infrastructure

## 0.1.0

- semantic tokens and theme presets
- dependency-free motion core
- cinematic, Spline, video-scrub, and gallery templates
- creative-production source catalog and asset pipelines
- specialist agent skills, provenance, design audit, and browser smoke tests
