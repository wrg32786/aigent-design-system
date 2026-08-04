import json
from pathlib import Path

registry_file = Path("registry.json")
registry = json.loads(registry_file.read_text())
repository = "wrg32786/aigent-design-system/"

def entry(path, target=None):
    return {"path": path, "type": "registry:file", "target": target or f"~/{path}"}

def skill(path):
    return entry(path, f"~/.claude/{path}")

def by_name(name):
    return next(item for item in registry["items"] if item["name"] == name)

skill_item = by_name("aigent-design-skill")
skill_item["description"] = "Install the consolidated Claude design-director skill for inspiration, immersive websites, sales decks, product interfaces, critique, polish, and verification."
inspiration_reference = skill("skills/aigent-design/reference/inspiration.md")
if not any(item["path"] == inspiration_reference["path"] for item in skill_item["files"]):
    skill_item["files"].insert(4, inspiration_reference)

design_vault = by_name("design-vault")
design_vault["description"] = "Install the searchable catalog for browsing pages, interfaces, inspiration, patterns, design intelligence, production systems, and install commands."

paths = [
    "inspiration/README.md",
    "inspiration/adapters/chrome-devtools.md",
    "inspiration/adapters/screenshot-and-motion.md",
    "inspiration/adapters/figma-and-penpot.md",
    "inspiration/adapters/embeddings.md",
    "inspiration/schemas/source.schema.json",
    "inspiration/schemas/design-dna.schema.json",
    "inspiration/schemas/motion-dna.schema.json",
    "inspiration/schemas/reference-matrix.schema.json",
    "inspiration/schemas/influence-ledger.schema.json",
    "inspiration/lib/common.mjs",
    "inspiration/lib/store.mjs",
    "inspiration/lib/design-dna.mjs",
    "inspiration/lib/url-forensics.mjs",
    "inspiration/lib/file-forensics.mjs",
    "inspiration/lib/synthesis.mjs",
    "inspiration/lib/originality.mjs",
    "inspiration/lib/report.mjs",
    "inspiration/examples/editorial-reference.json",
    "inspiration/examples/immersive-reference.json",
    "inspiration/examples/interface-reference.json",
    "inspiration/evals/README.md",
    "inspiration/evals/rubric.json",
    "inspiration/evals/briefs/immersive-product-launch.json",
    "inspiration/evals/briefs/operator-workspace.json",
    "inspiration/evals/briefs/editorial-dossier.json",
    "inspiration/lab/index.html",
    "inspiration/lab/app.js",
    "inspiration/fixtures/site/index.html",
    "scripts/inspire.mjs",
    "scripts/check-inspiration.mjs",
    "scripts/inspiration-smoke.mjs",
]
files = [entry(path) for path in paths]
files.extend([
    skill("skills/design-forensics/SKILL.md"),
    skill("skills/reference-synthesis/SKILL.md"),
    skill("skills/inspiration-originality-audit/SKILL.md"),
])

inspiration = {
    "name": "inspiration-intelligence",
    "type": "registry:item",
    "title": "Inspiration Intelligence",
    "description": "Install URL and file design forensics, Design DNA, multi-source reference synthesis, influence ledgers, originality review, skills, evals, and the Inspiration Lab.",
    "files": files,
}
registry["items"] = [item for item in registry["items"] if item["name"] != inspiration["name"]]
full_index = next(index for index, item in enumerate(registry["items"]) if item["name"] == "full-studio")
registry["items"].insert(full_index, inspiration)

full = by_name("full-studio")
full["description"] = "Install the complete flagship system: inspiration intelligence, design planning, Claude skill, patterns, reference pages, creative production, QA, Design Vault, and case studies."
dependency = f"{repository}inspiration-intelligence"
if dependency not in full["registryDependencies"]:
    full["registryDependencies"].insert(1, dependency)

registry_file.write_text(json.dumps(registry, indent=2) + "\n")
print(f"Prepared {len(registry['items'])} registry items.")
