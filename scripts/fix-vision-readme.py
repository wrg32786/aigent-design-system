from pathlib import Path

path = Path("README.md")
text = path.read_text()
start = text.index("### AIgent Vision\n")
end = text.index("## Inspiration Intelligence\n", start)
vision = text[start:end]
text = text[:start] + "### Inspiration Intelligence\n\n" + text[end + len("## Inspiration Intelligence\n\n"):]
vision = vision.replace("### AIgent Vision", "## AIgent Vision", 1)
vision = vision.replace(
    "npx github:wrg32786/aigent-design-system vision check   --target .   --review .aigent/resolve/latest.visual-review.json\n\nnpx github:wrg32786/aigent-design-system vision finalize   --target .   --review .aigent/resolve/latest.visual-review.json",
    "npx github:wrg32786/aigent-design-system vision check \\\n  --target . \\\n  --review .aigent/resolve/latest.visual-review.json\n\nnpx github:wrg32786/aigent-design-system vision finalize \\\n  --target . \\\n  --review .aigent/resolve/latest.visual-review.json",
)
insert = text.index("## Inspiration Intelligence\n", text.index("## AIgent Resolve\n"))
text = text[:insert] + vision + text[insert:]
path.write_text(text)
print("Recomposed the README install list and Vision section.")
