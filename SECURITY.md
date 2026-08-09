# Security

## Reporting

Do not open a public issue for a credential leak, private URL, signed asset URL, private customer data, unauthorized inspiration capture, or exploitable code path. Use GitHub's private vulnerability reporting for this repository when available.

Include the affected feature, impact, reproduction steps, and the smallest safe evidence needed to verify it. Do not include live credentials, private screenshots, or personal data.

## Repository rules

- secrets belong in environment variables, never manifests or examples
- asset manifests must not contain signed download URLs or private generation records
- raw marketplace downloads and source renders stay outside Git
- private inspiration captures and generated browser evidence stay under ignored `.aigent` runtime directories
- shared project authority such as `.aigent/project-context.md` and `.aigent/design-direction.md` is intentionally separate from private capture output
- normalized Design DNA stores hashed copy fingerprints rather than publishing source page bodies
- do not capture authenticated, private, paywalled, personal, or confidential pages without explicit authority
- do not use URL forensics to bypass access controls or collect data beyond the design task
- external registry items must be reviewed before installation
- browser demos must not depend on private endpoints
- public fixtures and examples must use generic, non-sensitive data

`scripts/check-assets.mjs` checks common credential and signed-URL patterns, but it is not a replacement for secret scanning, privacy review, or authorization checks.

## Install ownership

The normal `aigent-design install` path writes vendor-owned skill files under `.claude/skills/aigent-design/` and records their hashes in `.aigent/install.json`.

It must not install Aigent's own `PRODUCT.md`, `DESIGN.md`, tokens, runtime scripts, or other root-level product authority into the consumer repository. Existing product and brand documentation remains authoritative.

On update, files whose current hash differs from the recorded installed hash are treated as user-modified and are not silently overwritten. `--force` is an explicit destructive override. `uninstall` removes only unchanged vendor-owned files and preserves modified installed files.

`init` creates `.aigent/project-context.md`; it does not replace root project documentation.

## Inspiration and browser tooling

Inspiration URL capture denies obvious loopback, private-network, link-local, and common metadata targets by default. `--allow-private` is an explicit operator override for a local/private target the user is authorized to inspect.

This guard does not make arbitrary browsing risk-free. DNS, redirects, authentication state, and browser extensions can change the effective trust boundary. Do not use Aigent to probe internal services, cloud metadata, private applications, or authenticated pages without explicit authorization.

Browser-backed features use Aigent's Playwright dependency and an explicitly installed Chromium runtime. The host project should not need copied Aigent runtime scripts or Aigent-owned Node dependencies.

Captured references are working evidence, not public assets. Keep private screenshots, source captures, and customer material out of public commits unless the user explicitly owns and intends to publish them.

## Agent boundary

Aigent does not own Claude Code, hosting, or other provider credentials. Authentication stays in the official coding-agent or provider CLI the user chose.

Coding agents can edit project files and run local tools with the authority granted by the user's environment. Install and use Aigent only in repositories and development environments the user trusts.

## Publishing and hosting credentials

Aigent should use official provider CLI/browser authentication flows. Do not ask users to paste deployment tokens, API keys, private keys, certificates, or secret environment-variable values into prompts or committed files.

The static exporter blocks project-control directories, credential files, private keys, and credential-shaped public content. Local deployment records may contain URLs, IDs, commits, output paths, and QA status, but not provider credentials.
