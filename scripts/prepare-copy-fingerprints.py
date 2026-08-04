# One-time branch preparation; removed before merge.
import json
from pathlib import Path


def replace(file, old, new):
    path = Path(file)
    text = path.read_text()
    if old not in text:
        raise SystemExit(f"Expected contract not found in {file}: {old[:80]}")
    path.write_text(text.replace(old, new, 1))


replace(
    "inspiration/lib/design-dna.mjs",
    '  shortHash,\n  tokenize,\n  unique,',
    '  shortHash,\n  shingles,\n  tokenize,\n  unique,',
)
replace(
    "inspiration/lib/design-dna.mjs",
    '''    copyFingerprint: {
      headingTokens: unique(tokenize(headings.map((heading) => heading.text).join(" "))).slice(0, 120),
      sampleHash: shortHash(copySample, 16),
      sample: copySample,
    },''',
    '''    copyFingerprint: {
      headingTokens: unique(tokenize(headings.map((heading) => heading.text).join(" "))).slice(0, 120),
      sampleHash: shortHash(copySample, 16),
      shingleHashes: [...shingles(copySample)].map((value) => shortHash(value, 16)).slice(0, 1200),
      wordCount: tokenize(copySample).length,
      sampleLength: copySample.length,
    },''',
)
replace(
    "inspiration/lib/design-dna.mjs",
    '    copyFingerprint: { headingTokens: [], sampleHash: null, sample: "" },',
    '    copyFingerprint: { headingTokens: [], sampleHash: null, shingleHashes: [], wordCount: 0, sampleLength: 0 },',
)

replace(
    "inspiration/lib/originality.mjs",
    '''  const targetCopy = target?.copyFingerprint?.sample || (target?.copyFingerprint?.headingTokens || []).join(" ");
  const sourceCopy = source?.copyFingerprint?.sample || (source?.copyFingerprint?.headingTokens || []).join(" ");
  const copy = targetCopy && sourceCopy ? jaccard(shingles(targetCopy), shingles(sourceCopy)) : 0;''',
    '''  const targetHashes = new Set(target?.copyFingerprint?.shingleHashes || []);
  const sourceHashes = new Set(source?.copyFingerprint?.shingleHashes || []);
  let copy = targetHashes.size && sourceHashes.size ? jaccard(targetHashes, sourceHashes) : 0;
  if (!targetHashes.size || !sourceHashes.size) {
    const targetCopy = target?.copyFingerprint?.sample || (target?.copyFingerprint?.headingTokens || []).join(" ");
    const sourceCopy = source?.copyFingerprint?.sample || (source?.copyFingerprint?.headingTokens || []).join(" ");
    copy = targetCopy && sourceCopy ? jaccard(shingles(targetCopy), shingles(sourceCopy)) : 0;
  }''',
)

schema_file = Path("inspiration/schemas/design-dna.schema.json")
schema = json.loads(schema_file.read_text())
schema["properties"]["copyFingerprint"] = {
    "type": "object",
    "required": ["headingTokens", "sampleHash", "shingleHashes", "wordCount", "sampleLength"],
    "properties": {
        "headingTokens": {"type": "array", "items": {"type": "string"}},
        "sampleHash": {"type": ["string", "null"]},
        "shingleHashes": {"type": "array", "items": {"type": "string"}},
        "wordCount": {"type": "integer", "minimum": 0},
        "sampleLength": {"type": "integer", "minimum": 0},
    },
    "additionalProperties": False,
}
schema_file.write_text(json.dumps(schema, indent=2) + "\n")

replace(
    "scripts/inspiration-smoke.mjs",
    '''assert.ok(fixture.designDna.motion.animationCount > 0);
assert.ok(fs.existsSync(path.join(fixture.directory, "report.html")));''',
    '''assert.ok(fixture.designDna.motion.animationCount > 0);
assert.equal("sample" in fixture.designDna.copyFingerprint, false);
assert.ok(fixture.designDna.copyFingerprint.shingleHashes.length > 0);
assert.ok(fs.existsSync(path.join(fixture.directory, "report.html")));''',
)

replace(
    "SECURITY.md",
    "- inspiration captures and extracted page evidence stay under `.aigent/inspiration`, which is ignored by Git\n",
    "- inspiration captures and extracted page evidence stay under `.aigent/inspiration`, which is ignored by Git\n- normalized Design DNA stores hashed copy shingles and counts, not raw body-copy samples\n",
)

print("Prepared hashed copy fingerprints.")
