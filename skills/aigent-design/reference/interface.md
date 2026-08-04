# Interface

Use for dashboards, tools, editors, command centers, settings, authenticated products, docs systems, and resource vaults.

## Product slop test

Familiarity is often a feature. Category-fluent users should trust the interface immediately.

Reject strangeness without purpose:

- decorative buttons
- mismatched controls
- display type in labels
- invented affordances for standard tasks
- routine transitions that delay work
- inconsistent state vocabulary

## Complete state model

Interactive components need the states their task can enter:

- default
- hover
- focus
- active or selected
- disabled
- loading
- empty
- error
- success
- permission or blocked, when relevant

Use skeletons or progressive content for layout-bearing loading. Empty states teach the next action.

## Structure

Use `interface-systems.json` and the layout catalog.

- command center for monitor, prioritize, approve, investigate
- split workspace for master-detail creation and review
- data observatory for a defined analytic question
- resource vault for find, filter, save, and open
- progressive workflow for complex tasks with recovery

Responsive behavior is structural. Collapse, route, or recompose; do not simply shrink panels.

## Ready components

Use `component-sources.json`.

- Prefer headless accessible primitives for behavior.
- Use animated libraries for isolated effects, not the page grammar.
- Review exact licenses and generated dependencies.
- Restyle every installed component into the selected type, spacing, material, state, and icon system.
- Do not re-add a component already present in the codebase.

## Motion

Routine product transitions are usually 120–250ms. Motion conveys state and continuity. No orchestrated page-load sequence before the task is usable.
