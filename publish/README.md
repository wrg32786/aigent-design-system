# Aigent Publish

Publishing is the final agent-run production stage:

```text
CHECKPOINT → EXPORT → PREFLIGHT → DEPLOY → VERIFY → RECORD
```

It turns the real project into a constrained static bundle, publishes it through an allowlisted provider route, verifies the live URL when requested, and records enough information to redeploy an earlier approved build.

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

Rollback creates a new provider deployment from an earlier recorded export. It does not rewrite Git history.

## Export boundary

The exporter follows local HTML, CSS, JavaScript, media, font, and manifest references from the configured entry. It blocks project-control and credential-bearing areas such as:

```text
.git
.aigent
.claude
.codex
node_modules
scripts
skills
docs
resolve
vision
```

It also refuses credential-shaped content and private-key material. Product, design, agent, registry, and local working metadata are not deployed merely because they exist in the project.

For a nested starter entry, the exporter preserves the real directory structure and creates a root `index.html` with a relative `<base>` when needed.

## Provider behavior

| Provider | Preview | Production | Domain handling |
| --- | --- | --- | --- |
| Local export | clean bundle | clean bundle | external host owns it |
| Netlify | preview deploy | authenticated deploy | connect in Netlify dashboard |
| Vercel | linked preview | linked production | alias can be applied from Aigent |
| Cloudflare Pages | preview branch | production branch | connect in Cloudflare dashboard |

The repository uses current official CLIs through `npx` instead of adding hosting SDKs to the project.

## Verification

With `--verify`, Aigent Resolve checks the local project before deployment and the live URL afterwards. A failing mechanical gate blocks a verified deploy.

With `--vision`, Aigent prepares Vision captures for the live URL. An image-capable agent or human still needs to inspect those captures; preparing them is not the same as passing visual review.

## Environment variables and secrets

Static Aigent projects normally deploy without build-time secrets. Provider login happens in the provider's official CLI or browser flow. Aigent does not collect provider tokens, API keys, private keys, or secret environment-variable values.

When a site needs host-managed secrets, configure them in the provider dashboard or approved secret-management path. Keep only non-secret variable names and deployment notes in the project.

## Domains

Vercel domain aliasing is supported directly when a custom domain is supplied. Netlify and Cloudflare ownership and DNS verification may remain in their dashboards because those flows vary by account, DNS provider, and existing zone ownership.

## Security

- Provider names, modes, site names, domains, and deployment IDs are validated.
- Every deploy should identify the exact source state being shipped.
- Credentials remain in the provider's official credential store.
- Deployment records do not include tokens or provider credential files.
