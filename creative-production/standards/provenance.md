# Licensing and Provenance

Every externally sourced, commissioned, or generated production asset needs a manifest.

## Record

- asset ID and page role
- source type
- provider or creator
- source or item URL
- exact license or plan class
- commercial-use status
- attribution requirement and text
- date verified
- safe internal reference to a receipt or generation record
- production tools and edits
- every public output and variant
- budget override reason where needed

## Do not record publicly

- API keys
- access tokens
- signed download URLs
- private customer URLs
- personal billing information
- local absolute paths containing usernames
- prompts or source files that contain confidential data

Use a safe repository-relative or private-system reference instead.

## Status language

Use one of:

- `yes` — current terms clearly allow the intended commercial use
- `with-attribution` — commercial use is allowed with preserved credit
- `paid-plan` — rights depend on an eligible paid plan
- `no` — not suitable for commercial production
- `verify` — item, model, region, or plan terms must be checked

`verify` is not approval.

## Generated media

Record the plan active when the output was generated. Upgrading later does not always change the rights attached to an earlier free-plan generation.

## Marketplace media

The marketplace's general terms do not replace the exact item license. Preserve both when relevant.

## Final gate

Before publishing:

1. Manifest exists.
2. Commercial-use status is resolved.
3. Attribution is visible where required.
4. No source is being redistributed as a standalone competing asset.
5. The output does not imply an endorsement.
6. The public repository contains no secrets or private records.
