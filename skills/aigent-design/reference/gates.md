# Gates

Load before final review of a substantial page. `craft-floor.md` is the short must-pass list; this file adds review tiers, a pre-build critique, a wider set of concrete generated-design tells, and two fresh-context reviews.

Adapted from `nutlope/hallmark` (MIT), with copy and layout tells from `leonxlnx/taste-skill` (MIT). See `../NOTICE.md`.

## 1. Tiers

Not every rule binds the same way. Classify each finding:

- **Floor**: correctness, access, honesty. Never waived. Ship nothing with an open Floor finding.
- **Reflex**: a default a model falls into. Fix it, or waive it on the record with evidence specific to this page.
- **Finish**: craft detail invisible at arm's length. Answer it; it never blocks.

A waiver has three parts: the rule, the evidence that the exception holds, and a reason that names something on this page. Boilerplate reasons do not count. The same rule waived on three builds in a row is a house style and belongs in `DESIGN.md` or `.aigent/design-direction.md`, not in waivers.

Product truth and an approved direction still outrank this file. A Reflex rule the brand deliberately breaks is a waiver, not a defect.

## 2. Pre-build critique

Before the build sweep, score the planned page 1 to 5 on six axes. Anything under 3 is revised first.

| Axis | 3 | 5 |
| --- | --- | --- |
| Philosophy | has a tone | has an argument a reader could disagree with |
| Hierarchy | needs a second look | survives the squint test |
| Execution | two or three loose details | would pass the gates first time |
| Specificity | fits the category | could belong to no other product |
| Restraint | keeps one decoration too many | lost something you liked |
| Variety | differs from recent builds on three of six structural axes | shares almost nothing with them |

Name the weakest axis and the fix taken. Never invent a weakness to fill the field, and straight fives should name what was cut to earn them.

**Mirror test**: would a neighbouring prompt in the same category get this exact combination of structure, hero, nav, and close? If yes, change one decision and say which.

## 3. Floor tells

- colour and font literals scattered past the token block; every colour and family goes through a token
- a component custom property with a name a system token can shadow. A gauge read its fill from `--g` and inherited a grid's `--g: 24px` gap. `scaleX(24px)` is invalid, so `transform` fell back to `none`, and a score of zero painted a full bar. Prefix component properties with their component (`--gauge-fill`).
- fluid and component tokens left unregistered. Register them with `@property`: a `syntax`, an absolute `initial-value` such as `0px` (a `clamp()` there invalidates the whole rule, silently), and `inherits: false` only for a value the component sets on itself. A registered token falls back to a known value instead of an inherited one, and checkers read a computed length instead of a raw `clamp()` string. Compare computed styles before and after registering; nothing on the page should change.
- `transition: all`, or animating `width`, `height`, `top`, `left`
- hero sized in `vh` instead of `svh` or `dvh`
- horizontal scroll at any width from 320 to 1920; use `overflow-x: clip` on `html` and `body`, never `100vw` widths
- image-bearing grid tracks on bare `1fr`; use `minmax(0, 1fr)`, and give display heads `overflow-wrap: break-word; min-width: 0`
- at 1920 the container is uncapped or grids gain columns; cap and centre, let gutters grow
- the hero's headline, one support line, primary action, and focal visual are not all visible at 1280 x 800
- two `position: sticky; top: 0` elements fighting under the nav
- content hidden at rest that depends on JavaScript to appear; hide only under a `.js` class or animate from visible
- a focus ring that fades in; focus is instant and at least 3:1 against what it is drawn on
- tooltip focus delay equal to hover delay; focus shows immediately
- auto-rotating content with no pause on hover and focus, or moving past 5 seconds with no pause control
- autoplay video without `muted`; `loading="lazy"` on the largest contentful element
- an input whose border width shifts between states, a focus ring built from `border`, or disabled shown by opacity alone
- a button label or primary nav link that wraps at any width
- a decorative `svg` or `canvas` with neither `aria-hidden` nor a label
- an emoji standing in for an icon
- a hand-drawn browser bar or OS window frame around fake content
- the fake send: a form that prints "Sent" or "You're on the list" with no request behind it
- invented metrics, testimonials, logo walls, or case-study counts

## 4. Reflex tells

Layout and chrome:

- the AI template: hero, three features, call to action, four-column footer
- the default nav (wordmark left, links, button right, hairline under) and footer (link columns, social row, copyright) used without being decided
- every section separated the same way with the same gap
- section heads crowded nearer what precedes them than what they head
- a thin section: a narrow column with nothing that has mass beside it
- a dead band of empty space between the hero's content and the fold
- more than about 80 words in any one screen at 1440, or a hero with more than two text blocks before its actions
- the stock anatomy: hero beside a picture, a figure row, three steps, a split, a showcase, an email band, in the same order as every other site. Compare against what real sites in the category are built around (the menu, the lineup, the issues, the record).

Type:

- one italic or accent-coloured word inside an otherwise plain heading
- uppercase display heads that can wrap with line-height under 1.0
- monospace as costume on labels, captions, and meta rows when the content is not code or measurement
- running prose wider than about 75 characters
- more than three font families

Colour and surface:

- framework default palettes (indigo-500, violet-600, slate-900) used as the brand
- zero-chroma greys on a page that has an anchor hue
- an accent covering more than a small share of any viewport without a declared reason
- aurora blobs, blurred orbs, chromatic halos, or zero-offset coloured glow behind text
- the named look on an unthemed build: cream paper, high-contrast serif display, terracotta accent

Chrome and copy:

- template punctuation: meta strings joined with middle dots, arrows glued to link text, decorative status dots
- tracked small caps or all-caps labels above headings
- decoration text: scroll cues, `01 / 06` counters, version pills in the hero, rotated vertical text
- the echo: one fact printed in four or more sections, or a section's last line restating its heading
- more than five empty media slots on a page; set the set in type instead
- a drawn illustration or an empty coloured box where a photograph or the real product should be
- a built mock of a product that already exists; capture the real screens instead

Motion:

- the same hover lift on every card, or more than one hover effect on an element
- bounce or overshoot easing on UI state
- more than one scroll-linked pattern on a page (see `scroll.md`)
- parallax or scroll motion on body text

## 5. Fresh-context reviews

The thread that built a page is its weakest reviewer. When a subagent or second reviewer is available, run two reviews with no inherited transcript. Pass only the listed inputs; do not explain intent.

**Hero review**, after the first screen is built and before sections below it exist. Inputs: desktop and mobile first-screen captures, the approved direction's one-line idea, the material inventory (what is real, what is a stand-in, what is absent). Questions:

- Does the headline say something only this product could say, in about seven words?
- Is the real material (the product, the place, the photograph) on this screen and large enough to matter? Remove it mentally: if the screen says the same thing, it is too weak.
- Does anything read as a template: a centred stack, a pill above the headline, a gradient blob, an empty box where a picture should be, two filled buttons side by side?
- Is the content placed deliberately in its screen, or does it stop early over empty space?

First line of the answer: `ship` or `fix`, then at most five findings, worst first.

**Finish review**, after Resolve has produced captures. Inputs: the Resolve captures at each viewport, the page source, the approved direction, the hero review's findings and how each was settled. Process: scroll the full-page desktop capture one screen at a time first. A screen with nothing big enough to be its reason outranks every detail finding. Then read every heading and name any that would pass unchanged on a competitor's page.

First line: `recapture` (a capture is missing, blank, or wrong; list what and stop), `rebuild` (the first screen fails the direction wholesale), `fix`, or `ship`. Then at most eight findings, ranked by cost to the page. Close with one line naming what must not be diluted while fixing. On a redesign, add: what did the old page do better?

After fixing, recapture the same views and score each finding yourself as resolved, partial, or unresolved. Record the outcome in the Vision review. When no second reviewer exists, re-read the captures cold against these prompts and say the review was in-thread.

A reviewer's `ship` clears that review and nothing more. Until the owner has looked at the page, report it as "reviewer passed"; only the owner's own look approves it.

## 6. Budget and honesty

Verification is budgeted: one batched inspection, one fix batch, at most one confirming round per review. A fabricated pass is itself generated slop. Report open findings, waivers with reasons, and anything that could not be checked.
