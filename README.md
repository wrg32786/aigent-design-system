# Aigent

**Design direction and browser QA for Claude Code.**

Aigent installs a focused design skill into an existing repo while Claude Code remains the interface. It helps shape visual direction, study references, choose layout/type/motion/media, inspect the rendered browser, and run structured design review without replacing the project's own product or brand authority.

Aigent is in active beta. The strongest shipped pieces today are the core design skill, Inspiration Intelligence, Resolve, and the structured Vision review protocol.

## Install

From the repo you want to design:

```bash
npx github:wrg32786/aigent-design-system install
npx github:wrg32786/aigent-design-system init
npx github:wrg32786/aigent-design-system setup-browser
npx github:wrg32786/aigent-design-system doctor
claude
```

Then say:

```text
Use Aigent to help me redesign this site.
```

`install` writes vendor-owned skill files under `.claude/skills/aigent-design/` and records their hashes in `.aigent/install.json`. It does **not** replace root `PRODUCT.md`, `DESIGN.md`, brand docs, application source, or package configuration.

`init` creates `.aigent/project-context.md` only when you want an Aigent-specific project brief. Existing project authority remains authoritative.

`setup-browser` installs Chromium for browser-backed capture and QA.

## What it does

Aigent can:

- inspect the existing repo before proposing a redesign
- help shape a vague brief without turning the process into a questionnaire
- develop multiple visual directions before a large greenfield commitment
- persist an approved direction in `.aigent/design-direction.md`
- preserve unrelated approved work during scoped revisions
- study public references and convert evidence into Design DNA
- synthesize multiple references instead of cloning one source
- choose layout, typography, color, motion, media, and interface direction
- flag common generated-design smells with Aigent Taste
- run browser-measured responsive, focus, contrast, clipping, reduced-motion, and runtime checks with Resolve
- prepare a structured rendered-review task with Vision
- export and deploy static work through constrained publishing tooling

Aigent does **not** contain a magical visual model of its own. Vision is a review protocol for a capable image-reviewing agent or human. Taste is a source-level smell linter. Design Intelligence is a deterministic planner. Those boundaries are deliberate.

## Normal workflow

```text
SHAPE → DIRECT → BUILD → TASTE → RESOLVE → SEE → POLISH
```

References add an optional inspiration loop before direction is locked.

Aigent keeps three lightweight controls behind the scenes:

```text
VARIANCE  familiar ↔ unconventional
MOTION    static ↔ motion-led
DENSITY   sparse ↔ information-dense
```

Once you approve a direction, later work reads that authority instead of improvising a new visual world on every page.

## Browser-backed commands

```bash
npx github:wrg32786/aigent-design-system taste .

npx github:wrg32786/aigent-design-system inspire add https://example.com

npx github:wrg32786/aigent-design-system resolve --init --target .
npx github:wrg32786/aigent-design-system resolve --target . --url http://127.0.0.1:3000

npx github:wrg32786/aigent-design-system vision prepare --target . --url http://127.0.0.1:3000
```

Private, loopback, local-network, and common metadata URLs are denied by Inspiration Intelligence unless `--allow-private` is explicitly supplied.

## Update and uninstall

Run the install command again to update vendor-owned files:

```bash
npx github:wrg32786/aigent-design-system install
```

Aigent tracks installed file hashes. Files you modified are preserved rather than overwritten silently. Obsolete untouched vendor files can be removed during update.

To remove Aigent-owned skill files:

```bash
npx github:wrg32786/aigent-design-system uninstall
```

Modified installed files are preserved and reported.

## Examples

The repository includes canonical examples for:

- modular editorial/product pages
- guided sales decks
- command-center interfaces
- progressive Three.js product stages
- inspiration analysis and synthesis

These are implementation examples, not evidence that Aigent automatically outperforms every baseline or competing skill. Comparative no-skill/Impeccable/Aigent evaluations and broader before/after case studies remain part of the validation roadmap.

## For contributors

```bash
npm install
npm run check
npm run taste:check
npm run registry
npm run intelligence
npm run inspiration
npm run resolve:check
npm run vision:check
npm run publish:check
npm run eval
```

The public install path should also be exercised in a clean consumer fixture before release.

## License

MIT for Aigent-authored code and documentation. Third-party tools and assets retain their own licenses; see [`THIRD_PARTY.md`](THIRD_PARTY.md).
