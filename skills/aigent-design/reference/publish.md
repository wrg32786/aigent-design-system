# Publish

Publishing is the final production stage, not a separate hosting afterthought.

## Read

- `publish/README.md`
- `.aigent/studio/canvas.json`
- `.aigent/publish/state.json` when present
- the current project entry and latest checkpoint

## Hard gates

Do not publish while Canvas operations remain active. Distill the approved intent into source or deliberately clear the journal first.

Do not publish a whole workspace. Build a constrained public artifact from the real page entry and its referenced dependencies. Block project context, agent state, QA state, credentials, keys, environment files, and private working records.

## Route

Use the first provider that fits:

1. local export for handoff or an external host;
2. Netlify for the fastest claimable preview or simple static production deploy;
3. Vercel for linked preview/production projects and direct domain aliases;
4. Cloudflare Pages for Cloudflare-hosted static delivery and preview branches.

Authenticate through the official provider CLI or browser flow. Never request hosting tokens in a Studio form or write them into project context.

## Completion loop

```text
DISTILL → CHECKPOINT → EXPORT → PREFLIGHT → DEPLOY → VERIFY → RECORD
```

Production should keep Resolve verification enabled before and after deployment. Prepare Vision captures when the operator needs a final rendered judgment of the public URL.

A successful publish records:

- provider and preview/production mode;
- live URL or explicit local artifact path;
- source checkpoint SHA;
- exported artifact directory;
- local and live Resolve result;
- Vision task when prepared;
- custom-domain status;
- exact artifact needed for forward redeploy.

## Commands

```bash
node scripts/publish-site.mjs export --project-dir . --entry /index.html
node scripts/publish-site.mjs auth --provider netlify
node scripts/publish-site.mjs deploy --provider netlify --mode preview --site example --project-dir . --entry /index.html
node scripts/publish-site.mjs deploy --provider vercel --mode production --site example --domain www.example.com --project-dir . --entry /index.html --verify --vision
node scripts/publish-site.mjs rollback --project-dir . --deployment <id> --verify
```

## Domains

Vercel aliases can be applied from the publish flow. Netlify and Cloudflare domain ownership and DNS verification remain in their dashboards. Never modify DNS without explicit operator authority.

## Rollback

Rollback is a new deploy from an earlier immutable export artifact. Do not rewrite Git history or replace current source merely to restore the public site.
