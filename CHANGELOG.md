# Changelog

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
