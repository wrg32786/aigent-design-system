# AIgent Design Evals

The evals answer one narrow question: does the system help an agent produce a more specific, usable, performant design from the same product brief?

Each run uses:

1. one fixed brief from `evals/briefs/`
2. one target produced without the system
3. one target produced with `aigent-design`, the planner, and the relevant registry items
4. the deterministic source score
5. an explicit human review using `evals/rubric.json`
6. desktop and mobile captures

The scripts never invent a taste score. Mechanical evidence is automated; composition, product specificity, and craft are recorded by a reviewer.

```bash
node scripts/plan-design.mjs evals/briefs/developer-tool-launch.json
node scripts/score-design.mjs --brief evals/briefs/developer-tool-launch.json --target path/to/site
node scripts/score-design.mjs --brief evals/briefs/developer-tool-launch.json --target path/to/site --review evals/reviews/example.json --out evals/results/run.json
```

Compare like with like: same model, same source content, same time budget, same browser widths, and the same asset allowance.
