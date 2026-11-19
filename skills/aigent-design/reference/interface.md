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

A control is enabled only once it can do its job. A copy button stays disabled until its text has loaded, and it says "copied" only after the clipboard write succeeds. Enabled from the start, one copied an error message and reported success.

A script that sets a control fires the event the page's own handler listens for. One estimate listened for `input` while the links that picked an option fired `change`, so each link checked the right option and the price stayed at the default option's. Click each link and read the figure it leaves.

Errors sit under the field or group they belong to, with `aria-invalid` on the control and `aria-describedby` pointing at the message. A status line sits beside the control it reports on and is rendered, empty, from the first frame: a live region inserted or moved and then filled in the same task is often not announced, and `:empty { display: none }` drops it from the accessibility tree. Clear the status at the start of every submit. After a submit, or a step that replaces the control, move focus to a named target with a visible state, since focus moved by script after a mouse press shows no `:focus-visible` ring.

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

Routine product transitions are usually 120 to 250ms. Motion conveys state and continuity. No orchestrated page-load sequence before the task is usable.

## Forms on a fictional demo page

A form on a page for a business that does not exist has no real recipient, and it must not pretend to have one. A real portfolio or client form sends to its real destination, and none of this applies to it.

- Give the form `method="post"`, `enctype="text/plain"`, and a `mailto:` action on an address that cannot be real, such as one on a `.example` domain. A valid submit then opens a mail draft wherever a mail handler exists. Never post a visitor's details to a live endpoint from a demo.
- The status line says what the page did ("Opening your mail app"), then what to do if a draft opened. It never says a message was received, and it never claims a draft exists.
- The draft quotes the same numbers the page shows. Clamp a quantity once and use that value for both the estimate and the draft.
- Cap free text so the address stays short, and end the body's lines with CRLF.
- Name every field, so that with scripting off the same form posts its fields as a readable plain-text draft.
- Give each action that has its own field a form of its own: Enter submits through the form's default button, so a "Notify me" field inside a pre-order form opened a pre-order the visitor never chose. Controls that send nothing, such as a calculator beside the form, sit in a labelled `role="group"`, not in a second `<form>`.
- Set `noValidate` from the script, not `novalidate` in the markup, so the browser's own checks still stop an empty submit with scripting off. Test every path (empty, valid, Enter in each field, a double press) with a `navigate` listener that records and cancels each `mailto:` navigation (`intercept()` is not allowed there, so cancel with `preventDefault()`), so the run opens no mail app and counts exactly one draft per submit.
- Never print the stand-in address, a social handle, a phone number, or a register, licence, or policy number as visible text. Name the role instead ("Write to the studio"), keep the `.example` address in the form's action, and say once, in the footer, that the company is fictional.
- Form labels count toward the words on a screen. Give the form a screen of its own and let its live result, such as an estimate set large, be the mass beside it.
