# Security

## Reporting

Do not open a public issue for a credential leak, private URL, signed asset URL, private customer data, or exploitable code path. Use GitHub's private vulnerability reporting for this repository when available.

Include:

- affected file or feature
- impact
- reproduction steps
- the smallest safe evidence needed to verify it

Do not include live credentials or personal data in the report.

## Repository rules

- secrets belong in environment variables, never manifests or examples
- asset manifests must not contain signed download URLs or private generation records
- raw marketplace downloads and source renders stay outside Git
- external registry items must be reviewed before installation
- browser demos must not depend on private endpoints

`scripts/check-assets.mjs` checks common credential and signed-URL patterns, but it is not a replacement for secret scanning or review.
