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

## Forms on a demo page

A demo or portfolio form has nowhere real to send, and it must not pretend otherwise.

- Give the form a `mailto:` action on an address that cannot be real, and let a valid submit open a mail draft. Never post a visitor's details to a live endpoint from a demo.
- The status line says what the page did ("Opening your mail app"), then what to do if a draft opened. It never says a message was received, and it never claims a draft exists.
- The draft quotes the same numbers the page shows. Clamp a quantity once and use that value for both the estimate and the draft.
- Cap free text so the address stays short, end the body's lines with CRLF, and clear the last status when a later submit fails validation.
- Name every field so the form still works as a plain mailto post with scripting off.
- Form labels count toward the words on a screen. Give the form a screen of its own and let its live result, such as an estimate set large, be the mass beside it.
