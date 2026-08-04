# Release Checklist

Before merging a public release:

- [ ] `PRODUCT.md` and `DESIGN.md` match the intended product and visual authority.
- [ ] New work uses semantic `ds-*` roles unless it is intentionally AIgent-branded.
- [ ] Outside references are recorded in `docs/source-stack-intake.md` and license obligations are reflected in `THIRD_PARTY.md`.
- [ ] Placeholder scenes, media, tracking IDs, private URLs, and customer data are removed.
- [ ] `npm run check` passes.
- [ ] `npm run audit -- <changed paths> --strict` passes.
- [ ] `npm run smoke` passes at desktop and mobile sizes.
- [ ] Keyboard focus, reduced motion, contrast, links, and touch targets are verified.
- [ ] The first viewport makes the surface's job and primary action clear.
- [ ] The design still belongs to the product after the decorative media is hidden.

For video scrubbing, also verify byte-range support, seek behavior, poster loading, and mobile fitting using `docs/cinematic-scroll-deck-playbook.md`.

A merge makes the repository source live. Production sites deploy separately unless their own repositories or deployment pipelines consume this package.
