# Contributing

Contributions should make the system more useful without lowering its design, accessibility, performance, or licensing standards.

## Good contributions

- a pattern proven in at least two real surfaces
- a complete reference page with desktop, mobile, and reduced-motion behavior
- a corrected resource, license, or pricing record with an official source
- an accessibility, performance, registry, or provenance improvement
- a fixed eval brief or reproducible benchmark result
- a specialist skill that owns a distinct production job not already covered

## Required evidence

A new visual system or pattern must include:

1. the product or interaction job
2. `use when` and `avoid when`
3. complete HTML or implementation code, not only a prompt
4. keyboard and reduced-motion behavior
5. mobile composition
6. dependency and license notes
7. a registry item when it is intended for reuse
8. repository checks
9. desktop and mobile captures

## Development

```bash
npm install
npm run check
npm run smoke
npm run capture
```

For a registry change:

```bash
npm run registry
pnpm dlx shadcn@latest registry validate wrg32786/aigent-design-system#your-branch
```

## Design discipline

- preserve an established visual world unless the task is explicitly a redesign
- do not use identical cards as the default page scaffold
- do not add dependencies for effects the platform or current stack can express
- do not make a marketing composition the default for product UI
- do not vendor external code, media, prompts, or skills without clear redistribution rights
- do not submit generated placeholder claims as product truth

## Commit and pull-request titles

Use plain descriptions of the shipped change:

```text
Add guided deck pattern
Improve mobile scene loading
Correct asset license record
```

Do not include local paths, agent names, internal ticket language, generated session labels, or private operational details.
