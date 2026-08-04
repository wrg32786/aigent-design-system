# 3D Asset Sources

Use `creative-production/catalog.json` as the machine-readable source of record. This guide explains how to choose.

## Lowest-friction free sources

### Poly Haven

Use first for photoreal HDRIs, materials, and general-purpose models. Assets are published under CC0. They are production-safe starting points, but not automatically web-optimized.

### ambientCG

Use for PBR materials, HDRIs, and supporting models. Assets are CC0. Download only the resolution the final camera needs.

### Kenney

Use for stylized and low-poly worlds. Asset packs generally state CC0 and are often closer to browser-ready than photoreal marketplace models.

### Mixamo

Use for free biped character rigging and motion. Characters and animations can be used royalty-free in personal, commercial, and nonprofit projects under Adobe's current FAQ. The output still needs mesh, material, and animation optimization.

## Broad catalogs

Sketchfab, Fab, and BlenderKit are valuable because they cover unusual subjects and production-ready art. They are not single-license libraries.

For every asset:

1. Open the exact item page.
2. Record the item URL.
3. Record its exact license.
4. Preserve required attribution.
5. Check whether editorial-only restrictions apply.
6. Inspect polygon count, texture count, and texture resolution.
7. Run the model through Blender and glTF optimization before shipping.

## Generated 3D

Hosted tools such as Meshy, Tripo, Sloyd, and Rodin are useful for custom hero objects and rapid concepts. Treat the generated output as a draft:

- inspect silhouette and scale
- remove hidden geometry
- repair normals
- simplify topology
- consolidate materials
- reduce texture count
- create a clean pivot
- export GLB
- optimize and compare visually

Free generation plans often use public outputs, attribution licenses, or noncommercial restrictions. Check the plan active at the time of generation.

## Local generation

TRELLIS and Hunyuan3D can be run locally with suitable hardware. Local does not mean unrestricted. Review the code, checkpoint, model-card, and submodule licenses independently.

Hunyuan3D's current community license contains geographic and scale restrictions. Do not make it a default commercial recommendation without legal review.

## Browser readiness

A model is web-ready only when:

- the first-view download fits the page budget
- materials render correctly in the selected runtime
- texture dimensions match the actual camera distance
- animation clips have been trimmed
- the model has a deliberate mobile fallback
- the page remains usable while the model loads
- the source and license are recorded in a manifest

Start with `model-viewer`. Escalate to Three.js only when the interaction requires it.
