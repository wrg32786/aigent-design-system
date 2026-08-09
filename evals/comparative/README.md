# Comparative product evaluation

This suite exists to answer one question the repository previously implied without proving:

> Does installing Aigent materially improve the finished design compared with the same coding agent without Aigent and with a strong competing design skill?

Do not publish a winner until the runs exist.

## Conditions

Run each brief under the same model, repository fixture, starting code, tool permissions, time budget, and asset budget.

For every brief collect at least three independent runs for:

1. **Baseline** — Claude Code with no design skill.
2. **Impeccable** — Claude Code with the current documented Impeccable workflow.
3. **Aigent** — Claude Code with the public Aigent install/init/browser setup workflow.

Do not tune prompts after seeing one condition's result unless the same change is applied to every condition.

## Fixed briefs

- `bright-consumer.json` — warm, bright consumer product; tests whether Aigent escapes its own dark command-center house style.
- `dense-operations.json` — dense product UI; tests hierarchy, task clarity, responsive behavior, states, and restraint.
- `cinematic-launch.json` — expressive launch surface; tests media direction, motion coherence, proof, and performance discipline.

## Evidence to retain

For each run preserve:

- exact initial fixture commit
- exact prompt and follow-up turns
- model and tool versions
- elapsed operator time and agent turns
- final source commit
- desktop and mobile rendered captures
- reduced-motion capture when motion exists
- Resolve report when available
- final visual-review record
- failures, retries, and manual interventions

## Blind review

Randomize the final captures so reviewers do not know the condition. Use at least three reviewers when publishing comparative claims.

Score 1–5 on:

- product clarity
- hierarchy
- composition
- typography
- product specificity
- visual coherence
- interaction/state quality
- responsive quality
- accessibility/usability
- finish

Also ask one forced-choice question: **Which result would you ship?**

Mechanical Resolve scores must be reported separately from visual preference. Do not combine them into a fabricated universal design score.

## Reporting

Publish the complete sample, not only the best run. Report mean, median, range, failures, and operator interventions. Include source and captures so others can disagree with the review.

Aigent should only claim an advantage when the result is repeatable across briefs and runs.
