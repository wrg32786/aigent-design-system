# Third-Party Notes

This repository is intended to remain safe to inspect, fork, and adapt. AIgent-authored code and documentation are MIT licensed. External code, media, models, fonts, services, and registry items remain governed by their own licenses and terms.

## Direct runtime references

Some example pages load optional runtimes from public CDNs:

- GSAP
- `@splinetool/viewer`
- Three.js

Production projects should pin versions, review the current license, apply an appropriate content-security policy, and self-host when their deployment requirements demand it.

## Impeccable

The context-first design workflow, surface modes, structural layout assessment, role-based typography, motion thesis, anti-reference discipline, and deterministic quality-floor thinking were informed by:

- Project: `pbakaus/impeccable`
- License: Apache License 2.0
- Source: `https://github.com/pbakaus/impeccable`

No Impeccable command implementation, detector code, decision-page system, source skill text, or project files are vendored. The AIgent planner, catalogs, references, checks, templates, and consolidated skill are original implementations specialized for cinematic websites, immersive decks, product UI, and creative-production workflows.

Users who want Impeccable's full command and detector system should install it from the original project.

## External component sources

`design-intelligence/component-sources.json` links to mature open-source libraries that agents may install into a target project. They are not copied into this repository.

Current source categories include:

- shadcn/ui — MIT
- Radix Primitives — MIT
- Base UI — MIT
- Ark UI — MIT
- Floating UI — MIT
- Motion Primitives — MIT
- Magic UI — MIT
- TanStack Virtual — MIT
- React Bits — external install only; its repository currently combines MIT terms with a Commons Clause restriction
- SmoothUI — verify the current repository license before use

The exact source repository and version installed into a project control. Review dependencies, licenses, registry payloads, and generated file changes before installation.

## GitHub registry

The root `registry.json` distributes only files authored or already included in this repository. It does not silently install external registry items. Users should still inspect any registry item before applying it to a project.

## Creative-production catalog

`creative-production/catalog.json` and the source guides link to third-party marketplaces, stock libraries, AI generation services, open models, editing tools, and production utilities. Catalog records are summaries, not legal advice.

Before using an external asset or service:

1. open the exact asset, model, plan, or license page
2. verify commercial use, attribution, redistribution, trademark, privacy, and model-release requirements
3. record the verification date in an asset manifest
4. preserve required attribution
5. keep private generation records, signed download URLs, and marketplace source packages outside Git

Pricing, availability, output rights, and model terms can change after a catalog record is checked.

## Demo media

Existing demo video assets under `assets/video/` are treated as AIgent-authored or generated demonstration media for this repository. Replace them when a client or commercial project requires different provenance, exclusivity, or a specific media warranty.

## Fonts

Example pages use Google Fonts or system fallbacks. Each font remains governed by its own license. Production teams may self-host the exact used subsets and weights.

## Spline scenes

Example templates use Spline's documented embed approach. Replace public example scene URLs with a scene you own or have permission to publish. A working `prod.spline.design` URL is not proof of redistribution rights.
