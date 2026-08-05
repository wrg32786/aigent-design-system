# Optional Embedding Retrieval

Do not add a vector database until the local library is large enough that tags and deterministic features are insufficient.

A later adapter may store:

- a semantic text-image embedding for brief-to-reference search
- a visual embedding for composition and form similarity
- deterministic layout, material and motion features from Design DNA

Use a local file and cosine search first. Hosted infrastructure is justified only when library size, collaboration or latency requires it.

Retrieval must be diversity-aware. The top results should not all share one source, palette or category, and no single result should determine the whole design.
