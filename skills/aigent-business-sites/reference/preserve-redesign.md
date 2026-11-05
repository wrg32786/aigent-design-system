# Preserve-mode redesign

Use when an existing site gets modernized or redesigned. A visual redesign can replace the look. It does not get permission to break the business. Adapted from Ultra Web Design, see `../NOTICE.md`.

## Classify visual authority first

Pick one:

1. **established world** a coherent approved system exists. Preserve and extend it.
2. **incomplete brand** recognizable pieces with gaps. Keep the signals, fill the gaps.
3. **redesign** product truth stays, the visual world is intentionally replaced.
4. **no authority** greenfield.

A local addition to an established surface inherits it. It does not trigger a new identity exercise.

## Preservation inventory

Before editing, mark each durable surface `PRESERVE`, `EVOLVE`, `REPLACE`, or `OWNER APPROVAL REQUIRED`. Use [`../templates/PRESERVATION-INVENTORY.md`](../templates/PRESERVATION-INVENTORY.md). At minimum:

- routes, slugs, redirects, anchor IDs, canonicals, and pages that rank
- primary nav labels, task paths, deep links
- titles, descriptions, social cards, structured data, sitemap and indexing
- form field names, order, autocomplete, validation, submit destinations, CRM mapping
- analytics event names, selectors, conversion definitions, experiments
- brand name, logo, approved colors and type, photography, voice
- legal, consent, privacy, accessibility, and regulated-claim copy
- existing accessibility wins: keyboard paths, focus, alt text, landmarks
- real content, proof, testimonials with permission, asset licenses

Never silently change slugs, primary nav labels, form field names or order, analytics contracts, the brand mark, or legal and consent copy.

This is the business-site version of the `TARGET` / `PRESERVE` contract in `aigent-design`. Verify both after the edit.

## Modernization order

Use the lowest-risk lever first and stop when the brief is met:

1. typography and content hierarchy
2. spacing, rhythm, alignment, width
3. palette and token recalibration that keeps owned brand color
4. states, feedback, focus, and motion that fit the existing world
5. hero and key-section recomposition
6. full block replacement only where the structure cannot be repaired

Targeted changes usually get most of the visible lift with much less SEO, analytics, and content risk than a rebuild.

## Fix causes

- correct a token instead of patching fifteen components
- fix the shared primitive instead of adding per-route workarounds
- fix content structure instead of positioning hacks
- delete a pattern that adds nothing instead of styling it harder

After each non-trivial fix, run the smallest check that would fail if the defect came back. Corrections should not slowly average the site back to the category default.

## Release checks for a redesign

On top of Resolve and Vision: form delivery end to end, call tracking or phone links, analytics events fire once (no duplicates), redirects for anything that did move, keyboard path through the primary action, and the mobile primary action still visible.
