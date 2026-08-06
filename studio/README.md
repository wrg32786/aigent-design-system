# AIgent Studio 1.0

AIgent Studio is a local, DOM-backed visual website editor where the browser preview, source project, design system, coding agent, comments, and QA loop share one workspace.

```bash
npm install
npm run studio -- --open
```

Open `http://127.0.0.1:4180/studio/`.

Native desktop users can instead download AIgent Desktop and launch this same Studio without running terminal commands. The desktop app chooses the workspace, manages the local server, detects or installs the coding-agent CLI, and keeps the project model unchanged. See [`../desktop/README.md`](../desktop/README.md).

## Core model

The actual project remains the source of truth:

```text
Project source
  → real browser preview
  → injected editor bridge
  → selection, layers, inspector, comments
  → non-destructive Canvas journal
  → agent distillation into source
  → Resolve + Vision
```

Studio does not maintain a disconnected design scene graph. Every selectable layer is a real DOM element in the current site.

## Visual editing

Studio 1.0 includes:

- hover and click selection in the live preview
- shift-click multi-selection
- synchronized semantic layers tree
- inline text editing
- responsive base, tablet, and mobile overrides
- layout, typography, appearance, position, and motion properties
- resize handles
- sibling reordering, duplication, insertion, and deletion
- project design-token browser
- reusable project components
- patch history with undo and redo
- source diff and Git-backed checkpoints
- element-bound comments
- participant presence and remote selection state across Studio clients
- agent handoff with selected elements, open comments, and the active Canvas journal

## Canvas journal

Direct edits are stored under:

```text
.aigent/studio/canvas.json
```

The journal is intentionally non-destructive. It gives the operator instant visual editing, reliable undo, and transparent intent without rewriting production source on every pointer movement.

Use **Distill canvas edits into source** when a direction is approved. Claude Code or Codex reads the active operations, applies them to the smallest correct source files, and preserves responsive and accessibility behavior. Clear the journal only after comparing the distilled result.

## Collaboration

Studio uses server-sent events and the local project state to share:

- active participants
- selected elements
- viewport and mode
- comments and resolution state
- Canvas operations
- components and checkpoints

The default server remains bound to `127.0.0.1`. Multiple browser clients on the same machine can collaborate. Network hosting is deliberately not enabled by default.

## Agents

Authenticate at least one supported local agent:

```bash
npm install -g @anthropic-ai/claude-code
claude doctor
```

or:

```bash
npm install -g @openai/codex
codex login
```

Studio never requests an API key in the browser. Claude Code runs with bounded turns and explicit project tools. Codex runs in a workspace-write sandbox. Manual prompt mode remains available.

## Commands

```bash
npm run studio
npm run studio -- --port 4300 --open
npx github:wrg32786/aigent-design-system studio --open
npm run studio:check
npm run studio:check -- --browser
```

## Current product boundary

Studio 1.0 is optimized for website production rather than generic vector illustration. Static HTML, CSS, and JavaScript are first-class. The included starters may load Three.js, Spline, GSAP, video, and the other optional runtimes already supported by the design system.

The Canvas journal works against rendered DOM regardless of how the page was authored. Automatic framework-specific AST distillation remains an agent task: the agent sees the selected nodes and patch contract, then edits the project using its native component conventions.

## Security

- localhost-only by default
- constrained project root and identifiers
- hidden and private paths blocked from preview
- bounded JSON request bodies
- same-origin writes only
- no arbitrary shell endpoint
- sanitized reusable component HTML
- allowlisted Canvas properties and attributes
- agent processes scoped to the project directory
- local Git checkpoints; no remote push occurs without an explicit later integration

Use Studio only in a workspace you trust. The selected coding agent can edit project files and run the explicitly permitted local tooling.
