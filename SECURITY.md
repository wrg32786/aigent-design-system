# Security

## Reporting

Do not open a public issue for a credential leak, private URL, signed asset URL, private customer data, unauthorized inspiration capture, or exploitable code path. Use GitHub's private vulnerability reporting for this repository when available.

Include:

- affected file or feature
- impact
- reproduction steps
- the smallest safe evidence needed to verify it

Do not include live credentials, private screenshots, or personal data in the report.

## Repository rules

- secrets belong in environment variables, never manifests or examples
- asset manifests must not contain signed download URLs or private generation records
- raw marketplace downloads and source renders stay outside Git
- inspiration captures and extracted page evidence stay under `.aigent/inspiration`, which is ignored by Git
- normalized Design DNA stores hashed copy shingles and counts, not raw body-copy samples
- do not capture authenticated, private, paywalled, personal, or confidential pages without explicit authority
- do not use URL forensics to bypass access controls or collect data beyond the design task
- external registry items must be reviewed before installation
- browser demos must not depend on private endpoints
- public fixtures and examples must use generic, non-sensitive data

`scripts/check-assets.mjs` checks common credential and signed-URL patterns, but it is not a replacement for secret scanning, privacy review, or authorization checks.

## Agent-native boundary

Aigent installs design knowledge and supporting tooling into a user's existing repository. It does not own Claude, Codex, hosting, or other provider credentials. Authentication stays in the official coding-agent or provider CLI the user already chose.

The Aigent installer must not silently overwrite conflicting project files. Reinstallation may keep identical installed files; replacing conflicting files requires an explicit `--force` action.

Coding agents can edit project files and run local tools with the authority granted by the user's environment. Install and use Aigent only in repositories and development environments the user trusts.

## Inspiration and browser tooling

Browser and inspiration tooling must respect project filesystem boundaries and normal network access controls. Do not use design forensics to bypass authentication, paywalls, signed URLs, robots/access controls, or private application boundaries.

Captured references are working evidence, not public assets. Keep private screenshots, source captures, and customer material out of public commits unless the user explicitly owns and intends to publish them.

## Publishing and hosting credentials

Aigent should use official provider CLI/browser authentication flows. Do not ask users to paste deployment tokens, API keys, private keys, certificates, or secret environment-variable values into prompts or committed files.

The static exporter blocks project-control directories, credential files, private keys, and credential-shaped public content. Local deployment records may contain URLs, IDs, commits, output paths, and QA status, but not provider credentials.
