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
- do not capture authenticated, private, paywalled, personal, or confidential pages without explicit authority
- do not use URL forensics to bypass access controls or collect data beyond the design task
- external registry items must be reviewed before installation
- browser demos must not depend on private endpoints
- public fixtures and examples must use generic, non-sensitive data

`scripts/check-assets.mjs` checks common credential and signed-URL patterns, but it is not a replacement for secret scanning, privacy review, or authorization checks.
