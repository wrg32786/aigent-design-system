---
name: aigent-studio
description: Operate the local AIgent Studio UI to create projects, use the installed design intelligence and reference systems, build through Claude Code or Codex, and complete Resolve plus Vision review.
---

# AIgent Studio

Use this skill when the user wants to build or revise a website through the interactive AIgent Studio UI rather than operating the repository only from the terminal.

## Start

```bash
npm run studio -- --open
```

Studio opens at `http://127.0.0.1:4180/studio/` and stores isolated projects under `.aigent/studio/projects/`.

## Project contract

A Studio project contains:

- `studio.project.json` — project identity, preview entry, agent, references, and run state
- `design-brief.json` and `BRIEF.md` — product-specific direction
- `PRODUCT.md` and `DESIGN.md` — durable product and visual authority
- `AGENTS.md` and `CLAUDE.md` — local operating instructions
- `.claude/skills/aigent-design/` — the consolidated design skill
- `.aigent/design-plan.json` — Design Intelligence output when planned
- `.aigent/inspiration/` and `.aigent/inspiration-plan.json` — reference evidence and synthesis when used
- `.aigent/resolve/` — mechanical and visual review evidence

## Operating loop

1. **Shape:** fill the brief and save it before asking for a whole surface.
2. **Start:** select the smallest proven starter that carries the surface job.
3. **Inspire:** add public URLs only when the reference is useful; run Analyze before asking the agent to synthesize it.
4. **Plan:** run the deterministic planner and inspect the selected layout, type, motion, media, and fallback direction.
5. **Build:** send one coherent request to the local agent. It edits the actual preview entry, not a disconnected demo.
6. **Inspect:** use desktop, tablet, and mobile preview frames while the project is being built.
7. **Resolve:** run mechanical browser evidence and repair the highest shared cause.
8. **See:** prepare annotated captures, inspect every required image, write structured critique, and complete Vision outside the UI when a real reviewer is required.

## Agent routing

Studio detects locally authenticated `claude` and `codex` executables. It never requests API keys in the browser.

- Prefer Claude Code when the project should continue the same design conversation across turns.
- Prefer Codex when a fresh stateless implementation or repair pass is useful.
- Use Manual prompt when no local agent is installed; Studio copies the complete AIgent-aware prompt.

## Non-negotiable rules

- Work in the project directory and the configured preview entry.
- Read `BRIEF.md`, `PRODUCT.md`, `DESIGN.md`, and the installed `aigent-design` skill before editing.
- Reuse the current starter, tokens, patterns, and native browser features before adding a dependency.
- Do not turn references into clone specifications.
- Do not claim completion from a green mechanical report without rendered visual review.
- Keep Studio local; do not expose it directly to a public network.
