# Publish

Publishing is the final production stage, not a separate product surface.

## Authority

Read the current project entry, existing deployment configuration, `.aigent/design-direction.md` when present, and `.aigent/publish/state.json` when present. Do not read or require retired Studio or Canvas state.

## Hard gates

- Publish only source the user intends to make public.
- Never export project context, agent state, QA state, credentials, environment files, private captures, or working records.
- Use the provider's official authentication flow. Never ask the user to paste hosting tokens into project files.
- Verify the actual public artifact or URL after deployment.

## Route

Use the first provider that fits the user's request:

1. local export for handoff or external hosting;
2. Netlify for a simple static preview or production deploy;
3. Vercel for linked preview/production projects and domain aliases;
4. Cloudflare Pages for Cloudflare-hosted static delivery.

Do not introduce a hosting provider when the project already has one unless the user asks to change it.

## Completion loop

```text
CHECKPOINT → EXPORT → PREFLIGHT → DEPLOY → VERIFY → RECORD
```

Use Resolve before and after deployment when the scope warrants it. Prepare Vision captures when final rendered judgment is required.

## Commands

```bash
npx github:wrg32786/aigent-design-system publish export --project-dir . --entry /index.html
npx github:wrg32786/aigent-design-system publish auth --provider netlify
npx github:wrg32786/aigent-design-system publish deploy --provider netlify --mode preview --site example --project-dir . --entry /index.html
npx github:wrg32786/aigent-design-system publish deploy --provider vercel --mode production --site example --domain www.example.com --project-dir . --entry /index.html --verify --vision
npx github:wrg32786/aigent-design-system publish rollback --project-dir . --deployment <id> --verify
```

## Domains

Only change domains or DNS with explicit operator authority. Provider-specific verification remains in the provider's official tooling or dashboard.

## Rollback

Rollback is a new deploy from an earlier immutable export artifact. Do not rewrite Git history or replace current source merely to restore the public site.
