# AIgent Ship and Publish

AIgent Ship is the final production stage for a Studio project:

```text
DISTILL → CHECKPOINT → EXPORT → PREFLIGHT → DEPLOY → VERIFY → RECORD
```

It turns the real project into a constrained static bundle, publishes it through an allowlisted provider adapter, verifies the live URL, and records enough information to redeploy an earlier approved build.

## Studio workflow

Open the **Ship** panel in AIgent Studio.

1. Distill or clear every active Canvas operation.
2. Choose Local export, Netlify, Vercel, or Cloudflare Pages.
3. Choose Preview or Production.
4. Set the provider project/site name.
5. Keep browser verification enabled for production.
6. Authenticate the provider through its official CLI when required.
7. Publish.
8. Open the live URL or redeploy an earlier recorded artifact.

Studio creates a Git checkpoint before deployment. The published artifact is built under:

```text
.aigent/publish/exports/<deployment-id>/
```

Deployment history is stored locally in:

```text
.aigent/publish/state.json
```

These files are local operational state and should not be committed.

## CLI

Export without contacting a host:

```bash
node scripts/publish-site.mjs export \
  --project-dir . \
  --entry /index.html
```

Authenticate a provider:

```bash
node scripts/publish-site.mjs auth --provider netlify
node scripts/publish-site.mjs auth --provider vercel
node scripts/publish-site.mjs auth --provider cloudflare
```

Create a preview deployment:

```bash
node scripts/publish-site.mjs deploy \
  --provider netlify \
  --mode preview \
  --project-dir . \
  --entry /index.html \
  --site my-site
```

Create a verified production deployment:

```bash
node scripts/publish-site.mjs deploy \
  --provider vercel \
  --mode production \
  --project-dir . \
  --entry /index.html \
  --site my-site \
  --domain www.example.com \
  --verify \
  --vision
```

Redeploy an earlier artifact:

```bash
node scripts/publish-site.mjs rollback \
  --project-dir . \
  --deployment <deployment-id>
```

The rollback command does not rewrite Git history. It creates a new provider deployment from the exact recorded export directory.

## Export boundary

The exporter follows local HTML, CSS, JavaScript, media, font, and manifest references from the configured preview entry. It blocks project-control and credential-bearing areas such as:

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
```

It also refuses credential-shaped content and private-key material. Product, design, agent, registry, and local Studio metadata are not deployed merely because they exist in the project.

For a nested starter entry, the exporter preserves the real directory structure and creates a root `index.html` with a relative `<base>` so the live domain opens at `/` without flattening the source.

## Provider behavior

| Provider | Preview | Production | Domain handling |
| --- | --- | --- | --- |
| Local export | clean bundle | clean bundle | external host owns it |
| Netlify | anonymous claimable preview | authenticated deploy | connect in Netlify dashboard |
| Vercel | linked preview | linked production | alias can be applied from AIgent |
| Cloudflare Pages | preview branch | production branch | connect in Cloudflare dashboard |

The repository uses `npx` to run the current official CLIs instead of adding three hosting SDKs to the application. Netlify anonymous previews must be claimed within the provider's active claim window or they expire; use authenticated production mode for a durable site.

## Verification

With `--verify`, Ship runs AIgent Resolve against the local Studio preview before deployment. A failing mechanical gate blocks the deploy. After the provider returns a live URL, Ship waits for the URL, runs Resolve again, and records the live report.

With `--vision`, Ship prepares AIgent Vision captures for the live URL. Vision still requires an image-capable agent or human review; preparing captures is not the same as passing the visual gate.

## Environment variables and secrets

Static AIgent projects normally deploy without build-time secrets. Provider login happens in the official CLI or browser flow. AIgent Studio does not collect provider tokens, API keys, or secret environment-variable values.

When a site later requires host-managed secrets, configure them in the provider dashboard. Keep only non-secret variable names and deployment notes in the project.

## Domains

Vercel domain aliasing is supported directly when a custom domain is supplied. Netlify and Cloudflare domain ownership and DNS verification remain in their dashboards because those flows vary by account, DNS provider, and existing zone ownership.

## Security

- Publish requests are same-origin JSON requests to the localhost Studio server.
- Provider names, modes, site names, domains, and deployment IDs are validated.
- The server exposes no arbitrary publish command endpoint.
- Canvas patches must be distilled or cleared before export or deploy.
- Every deploy starts from a Git checkpoint.
- Credentials remain in the provider CLI credential store.
- Deployment records do not include tokens or provider credential files.
