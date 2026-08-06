# AIgent Studio

AIgent Studio is the local interactive UI for building and revising websites with an authenticated Claude Code or Codex CLI agent that works inside an AIgent-equipped project.

From this repository:

```bash
npm run studio -- --open
```

After installing the `aigent-studio` registry item into another project:

```bash
node scripts/studio-server.mjs --open
```

Open `http://127.0.0.1:4180/studio/`.

## What it does

- creates isolated projects under `.aigent/studio/projects/`
- installs a proven AIgent starter and its dependencies
- writes `BRIEF.md`, `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, and the consolidated AIgent skill into the project
- previews the real project in desktop, tablet, and mobile frames
- streams Claude Code or Codex activity into the UI
- preserves Claude Code session continuity per project
- runs Design Intelligence planning, reference forensics, Resolve, and Vision preparation
- keeps credentials in the authenticated local CLI rather than the browser

## Agent setup

Install and authenticate at least one local agent:

```bash
npm install -g @anthropic-ai/claude-code
claude doctor
```

or:

```bash
npm install -g @openai/codex
codex login
```

Claude runs in non-interactive print mode with streamed JSON, edit permission, bounded turns, and a limited set of read/write and Node/npm/npx tools. Codex runs non-interactively in a workspace-write sandbox with approvals disabled for the local project turn.

## Security boundary

Studio binds to `127.0.0.1` only. It does not expose arbitrary shell commands through HTTP. Projects are constrained to the configured Studio root, request bodies are bounded, project identifiers are validated, and agent processes run with the project directory as their working directory.

Use Studio only on a machine and workspace you trust. The agent can edit project files and run the explicitly allowed local tooling.

## Commands

```bash
npm run studio
npm run studio -- --port 4300 --open
npx github:wrg32786/aigent-design-system studio --open
npm run studio:check
```

Set `AIGENT_STUDIO_ROOT` to move project storage. Set `AIGENT_STUDIO_CLAUDE_BIN` or `AIGENT_STUDIO_CODEX_BIN` when the executable is not on the default PATH.

## Current scope

The first release intentionally targets static HTML, CSS, and JavaScript surfaces because the AIgent reference systems and browser QA are already optimized for that path. Existing starters remain free to load Three.js, Spline, GSAP, video, or other browser runtimes. Custom framework dev-server orchestration can be added after a real project proves it is needed.
