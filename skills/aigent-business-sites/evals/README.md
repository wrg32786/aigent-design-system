# Business-site evals

Adapted from Ultra Web Design's evaluation protocol (Apache-2.0, see `../NOTICE.md`).

- `evals.json` six output cases: tiny state fix, route in an established brand, preserve-mode redesign, greenfield SaaS with no proof yet, editorial membership, and audit without edits. Each has observable assertions.
- `trigger-queries.json` ten requests that should pull in this skill and ten near misses that should not.

These are not wired into `npm run eval` yet. That script checks the deterministic planner briefs in the repo root `evals/briefs/`. These cases need an agent run.

## How to run

For each case, from a clean context, run twice: once with `aigent-design` plus `aigent-business-sites`, once with `aigent-design` alone. Grade each assertion pass or fail with evidence, and record tokens and elapsed time. Keep results outside the skill folder (for example `benchmarks/iteration-N/<case-id>/with-skill/` and `.../baseline/`).

What to look at:

1. trigger precision: fires on business-site work, stays out of the near misses
2. path selection: tiny fixes stay tiny, redesigns get the preservation inventory
3. output quality: truth, continuity, distinctiveness, accessibility, completion
4. cost versus baseline
5. consistency across repeat runs

Structural checks passing is not the same as the skill helping. Only claim improvement from a with and without comparison.
