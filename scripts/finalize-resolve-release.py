import re
from pathlib import Path

path = Path("README.md")
text = path.read_text()
feature_heading = "## Inspiration Intelligence\n\nInspiration Intelligence gives"
pattern = re.compile(r"## AIgent Resolve\n\nResolve is the final production loop:.*?(?=\n## )", re.S)
sections = pattern.findall(text)

if not sections:
    raise SystemExit("Could not find the AIgent Resolve README section")

resolve_section = sections[0].strip() + "\n\n"
text = pattern.sub("", text)
text = text.replace("#### Inspiration Intelligence", "### Inspiration Intelligence", 1)
text = text.replace("##\n## Inspiration Intelligence", "### Inspiration Intelligence", 1)
feature_start = text.find(feature_heading)
if feature_start < 0:
    raise SystemExit("Could not find the Inspiration Intelligence feature section")

text = text[:feature_start] + resolve_section + text[feature_start:]
text = re.sub(r"\n{3,}", "\n\n", text)
path.write_text(text)

print("Finalized the branded README hierarchy.")
