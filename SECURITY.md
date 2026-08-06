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

## AIgent Studio

Studio binds to `127.0.0.1` and must not be exposed directly to a public network. It uses the operator's authenticated local Claude Code or Codex CLI; credentials are never requested by or returned to the browser. Project IDs, filesystem boundaries, hidden files, request sizes, JSON content types, and cross-origin writes are constrained. The selected agent can edit project files and run the explicitly configured local tools, so use Studio only in a trusted workspace.

## AIgent Studio 1.0 Canvas boundary

AIgent Studio remains bound to localhost by default. Canvas writes accept only allowlisted operation kinds, CSS properties, and attributes. Request bodies, identifiers, HTML component payloads, and values are bounded; reusable component HTML is stripped of scripts, embedded documents, and inline event handlers. Hidden/private project paths remain unavailable through preview routes.

Participant presence and comments use local server-sent events. They do not create an internet-facing collaboration service. Git checkpoints are local and Studio does not push project history to a remote repository without a separate explicit integration.
