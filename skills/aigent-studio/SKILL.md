---
name: aigent-studio
description: Operate AIgent Studio's DOM-backed visual canvas, live project preview, patch journal, components, comments, checkpoints, agent handoff, Resolve, and Vision workflow.
---

# AIgent Studio

Use this skill when the operator is building or revising a website through the AIgent Studio UI.

## Authority order

1. `BRIEF.md`, `PRODUCT.md`, and `DESIGN.md`
2. explicit operator instructions and element comments
3. `.aigent/studio/canvas.json`
4. `.aigent/design-plan.json` and `.aigent/inspiration-plan.json`
5. existing project patterns and code conventions
6. general design guidance

## The Canvas journal is operator intent

The DOM-backed Canvas stores approved direct edits as structured operations. Treat active operations as requirements, not disposable suggestions.

When asked to **distill**:

1. read every active operation;
2. locate the shared source owner;
3. apply the result to the smallest correct source files;
4. consolidate repeated edits into tokens, layout primitives, or components;
5. preserve base, tablet, and mobile behavior;
6. preserve accessibility and reduced motion;
7. run the smallest relevant checks;
8. inspect the actual rendered result;
9. do not clear the journal—the operator clears it after comparison.

## Selected elements and comments

Studio may attach rendered element records containing IDs, tags, labels, computed styles, and source hints. Use them to find the correct source owner. Do not patch only the visible instance when a shared primitive owns the problem.

Open comments are unresolved operator authority. Address each comment or explain the conflict before stopping.

## Build loop

```text
SHAPE
→ inspect brief and product truth

INSPIRE
→ inspect supplied references and Design DNA

CANVAS
→ respect direct edits, selected elements, components, and comments

BUILD
→ edit the actual project source

RESOLVE
→ run mechanical browser evidence

SEE
→ inspect original and annotated captures

CHECKPOINT
→ leave the project in a reversible, reviewable state
```

## Constraints

- Reuse installed tokens, patterns, components, and dependencies before adding code.
- Keep the real preview entry as the build target.
- Do not create a disconnected alternative demo.
- Mobile is recomposed, not shrunk.
- One visual world must carry the entire surface.
- Do not convert a direct edit into arbitrary inline styles when a shared rule or token owns it.
- Preserve local Git history and do not push remotely unless explicitly requested.
