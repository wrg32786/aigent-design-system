from pathlib import Path

path = Path("README.md")
text = path.read_text()

resolve_start = text.find("## AIgent Resolve\n")
first_inspiration = text.find("## Inspiration Intelligence\n", resolve_start)
feature_heading = "## Inspiration Intelligence\n\nInspiration Intelligence gives"
feature_start = text.find(feature_heading, first_inspiration + 1)

if resolve_start < 0 or first_inspiration < 0 or feature_start < 0:
    raise SystemExit("Could not find the generated README section boundaries")

resolve_section = text[resolve_start:first_inspiration]
text = text[:resolve_start] + "### Inspiration Intelligence\n" + text[first_inspiration + len("## Inspiration Intelligence\n"):]

feature_start = text.find(feature_heading)
text = text[:feature_start] + resolve_section + text[feature_start:]
path.write_text(text)

print("Finalized the branded README hierarchy.")
