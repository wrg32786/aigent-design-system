---
name: publish-site
description: Export, deploy, verify, domain-connect, and safely redeploy an AIgent Studio website through the built-in Ship workflow.
---

# Publish Site

Use this skill when the operator asks to publish, deploy, ship, launch, put a site live, connect a domain, create a preview URL, or redeploy an earlier approved build.

## Read first

1. `PRODUCT.md`
2. `DESIGN.md`
3. `BRIEF.md`
4. `.aigent/studio/canvas.json`
5. `publish/README.md`
6. `.aigent/publish/state.json` when it exists

## Hard gates

Do not publish when:

- active Canvas operations have not been distilled or deliberately cleared;
- the configured preview entry is missing;
- a public export contains credential-shaped content or private-key material;
- production verification is requested and pre-deploy Resolve fails;
- the operator has not authorized the target provider or domain.

A screenshot, generated prompt, or provider command proposal is not a deployment. Completion requires a provider URL or an explicit local export path.

## Provider ladder

Use the first route that fits:

1. **Local export** — no account, handoff bundle, custom host, or offline review.
2. **Netlify** — fastest claimable preview and simple static production deploy.
3. **Vercel** — linked preview/production project and direct domain aliasing.
4. **Cloudflare Pages** — Cloudflare-hosted static deployment and preview branches.

Do not add a hosting SDK when the official CLI already provides the required operation.

## Studio flow

```text
DISTILL
  fold approved Canvas operations into real source

CHECKPOINT
  commit the exact source state being shipped

EXPORT
  traverse only referenced public dependencies

PREFLIGHT
  run Resolve against the local Studio preview

DEPLOY
  use the selected official provider CLI

VERIFY
  wait for the URL and run Resolve against production

SEE
  prepare Vision captures when requested

RECORD
  store URL, provider, commit, artifact, QA, and history locally
```

Use the **Ship** panel whenever Studio is available. It keeps credentials out of the browser and exposes the deployment history beside the real project.

## CLI

```bash
node scripts/publish-site.mjs export --project-dir . --entry /index.html
node scripts/publish-site.mjs auth --provider netlify
node scripts/publish-site.mjs deploy --provider netlify --mode preview --site example --project-dir . --entry /index.html
node scripts/publish-site.mjs deploy --provider vercel --mode production --site example --domain www.example.com --project-dir . --entry /index.html --verify --vision
node scripts/publish-site.mjs rollback --project-dir . --deployment <id> --verify
```

## Export contract

The export starts from the actual preview entry and follows local HTML, CSS, JavaScript, font, image, video, model, and manifest references. It must not copy the project wholesale.

Never publish:

```text
.git
.aigent
.claude
.codex
node_modules
desktop
scripts
skills
docs
resolve
vision
BRIEF.md
PRODUCT.md
DESIGN.md
agent credentials
provider credentials
```

For nested starter entries, preserve the directory structure and create a root entry with a relative `<base>`.

## Domains

- Vercel aliases can be applied in the Ship flow.
- Netlify and Cloudflare domain ownership and DNS should be completed in their dashboards.
- Do not modify DNS records without the operator's explicit authority.
- Record the requested domain even when dashboard verification remains.

## Verification

Preview deployments may skip Resolve for speed when the operator explicitly chooses that tradeoff. Production should keep verification enabled.

A production result records:

- provider and mode;
- live URL;
- dashboard URL when available;
- source checkpoint SHA;
- exported artifact directory;
- local and live Resolve reports;
- Vision task and prompt when prepared;
- domain follow-up;
- errors or unresolved findings.

## Rollback

AIgent rollback is a safe forward redeploy of an earlier immutable export artifact. It does not reset the current source tree or rewrite Git history.

If the prior artifact no longer exists, create a new export from the corresponding Git checkpoint instead of guessing.

## Security

- Authenticate through the official CLI/browser flow.
- Never request provider tokens in Studio forms.
- Never print credential stores or environment secrets.
- Keep `.aigent/publish/` out of Git.
- Treat provider output as data and expose only URLs, IDs, status, and safe logs.
