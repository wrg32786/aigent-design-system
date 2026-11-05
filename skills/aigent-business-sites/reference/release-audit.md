# Release audit

Use for critique, audit-only requests, and deciding whether a business site can ship. Taste, Resolve, and Vision in `aigent-design` are the mechanical and visual floor. This adds the business and anti-generic layer on top. Adapted from Ultra Web Design, see `../NOTICE.md`.

Design critique and technical audit are different jobs. Do both. In audit-only mode, do not edit files and do not report unobserved behavior as verified.

## Design jury

Score the rendered page 0 to 10 through six lenses:

| Lens | Question | Weight |
| --- | --- | ---: |
| brief / product | does it solve the audience and business job truthfully? | 25% |
| designer | composition, hierarchy, pacing, craft | 15% |
| brand / distinctiveness | does it express the chosen world and avoid category sameness? | 20% |
| copy / content | clear, specific, credible, action-oriented? | 10% |
| accessibility / usability | can people perceive, navigate, understand, recover? | 15% |
| engineering / performance | responsive, resilient, fast, maintainable? | 15% |

For each lens: strongest success, up to three must-fix findings with location, exact correction, and the risk if unchanged.

Ultra's release bar: weighted composite of at least 8.2, with brief, accessibility, and engineering each at least 8.0, and no P0 or P1. Max three rounds. If it keeps failing because the brief or direction is wrong, go back to shape or direction instead of polishing symptoms.

## Technical audit

Score 0 to 4 each: accessibility, performance, responsive and context, tokens and design-system integrity, implementation integrity and truth, SEO plus analytics plus security plus launch ops. Out of 24: 22+ excellent, 18 to 21 good, 14 to 17 acceptable, 8 to 13 poor, under 8 critical.

## Severity

- **P0** task failure, data loss, security exposure, dangerous deception, inaccessible critical path
- **P1** WCAG AA failure, severe perf or responsive defect, misleading claim, broken conversion, systemic drift
- **P2** real friction with a workaround
- **P3** polish

Not everything is P0. Too many P3s is noise.

## Finding format

```text
[P?] title
location:
evidence:
impact:
root cause:
correction:
smallest regression check:
```

After individual findings, list repeated causes (hard-coded colors, card reflex, missing states everywhere, duplicate analytics events) and fix them at the shared root. Also record what works and should be kept.

## Anti-generic checks

- **interchangeability** swap the brand name, logo, and accent for an unrelated company in the same category. If it still looks plausible, the concept is too generic. If only copy makes it specific, the visual world is underbuilt. If only a decorative motif does, the idea is attached rather than structural.
- **squint, grayscale, image-off, text-only** hierarchy, emphasis, and meaning should survive each.
- **soul test** at least one detail only someone who knows the product would add: a real shortcut, operator vocabulary, a real sample output, a comparison that matches the buyer's actual decision.
- **category rut** before directions, list the ten most predictable choices for the category and the obvious costume-opposite. Avoid both unless evidence supports them.
- **uniqueness ledger** for composition, type, color and material, imagery, evidence display, component geometry, motion, voice, first viewport: what you chose and what default you refused. At least four should differ from the category default without hurting clarity.
- **similarity ceiling** no more than two conspicuous signature traits from any single branded reference.

### Common generated-design tells

Challenge these when they show up without a reason: version or beta labels and section-number eyebrows added for flavor, decorative status dots, faux provenance captions, fake product screenshots from empty rectangles, fake terminals or timestamps, an eyebrow on every heading, a pill around every label, a card around every idea, filler bento cells, several CTA labels for one intent, wrapped desktop CTA text, and unmotivated mid-page theme flips.

Classify each as `ABSOLUTE` (truth, accessibility, security, broken behavior, unknown rights), `PROJECT BAN` (recorded in the project's direction), `MECHANICAL TELL` (habit, reduce or vary), or `ALLOWED` (intentional and useful). Explain the harm every time.

Do not fail a site just for Inter, Lucide, a centered hero, a beige palette, or a scroll cue. Fail it when the choice is unearned, repeated, inaccessible, misleading, or indistinguishable from the default. And do not excuse a repeated tell because each instance is defensible alone. Judge the whole page.

## Definition of done (business layer)

Only the boxes that apply. Resolve and Vision cover the mechanical rendering checks.

- [ ] audience, objective, offer, mechanism, proof, CTA, objections, and metric are explicit
- [ ] every major claim has a truth status and a source; no fake proof, fake UI, or fake precision
- [ ] primary and secondary actions do not compete; CTA copy names the next step
- [ ] pricing, terms, availability, geography, and next steps are accurate
- [ ] real copy and assets replace placeholders; proof sits near claims
- [ ] alt text, captions, credits, disclosures, and sponsor labels are complete
- [ ] forms keep input, validate accessibly, block double submit, and recover from server errors
- [ ] titles, descriptions, canonicals, social metadata, and status codes are correct; structured data matches visible content
- [ ] data collection and third parties are inventoried; consent matches real integrations
- [ ] required legal, refund, shipping, accessibility, and sponsorship policies are present
- [ ] analytics events are defined, deduplicated, and validated; no unneeded personal data
- [ ] preservation inventory items are verified unchanged or have owner approval
- [ ] requested routes, sections, and states all exist; no `TODO` or `same as above` left behind
- [ ] no P0 or P1 remains, and the jury and technical audit thresholds pass, or the report says plainly why not

Use [`../templates/QA-REPORT.md`](../templates/QA-REPORT.md) for the write-up.
