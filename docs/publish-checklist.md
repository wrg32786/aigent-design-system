# Publish checklist

## Product truth

- `PRODUCT.md` and `DESIGN.md` match the shipped system.
- The README's install commands resolve to current registry items.
- Claims are supported by live products, runnable references, or clearly labeled examples.

## Registry and CLI

- `npm run registry` passes.
- Every item has a useful title, description, explicit files, and project-root targets.
- `aigent-design list`, `doctor`, `plan`, and a dry-run install work.
- Official shadcn GitHub registry validation passes on the release ref.
- Install commands use a tag or full commit SHA in formal release notes when reproducibility matters.

## Design intelligence and skills

- `npm run intelligence` and `npm run eval` pass.
- The consolidated skill remains the public entry point.
- Specialist skills own distinct production jobs.
- New layout, type, motion, or interface records have a use/avoid contract and mobile behavior.

## Browser proof

- `npm run smoke` passes in Chromium.
- `npm run capture` produces desktop, mobile, and reduced-motion proof.
- One `h1`, no horizontal overflow, visible focus, keyboard access, and functional reduced motion are verified.
- Live 3D, video, Spline, and dialog surfaces preserve complete fallbacks.

## Assets and rights

- `npm run catalogs` and `npm run assets` pass.
- Every public production asset has a manifest.
- Source, commercial use, attribution, and verification date are resolved.
- Raw source packages, marketplace downloads, private prompts, generation records, and signed URLs are absent.
- Spline scenes, fonts, models, footage, audio, and generated assets are owned or cleared.

## Repository safety

- Commit and PR titles describe the shipped change plainly.
- No local paths, agent names, internal tickets, account details, API keys, or private operational notes appear in files or history.
- `THIRD_PARTY.md`, `CHANGELOG.md`, and version metadata are current.
- Contribution and security instructions remain accurate.
