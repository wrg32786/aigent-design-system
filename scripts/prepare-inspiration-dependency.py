import json
from pathlib import Path

file = Path("registry.json")
registry = json.loads(file.read_text())
item = next(entry for entry in registry["items"] if entry["name"] == "inspiration-intelligence")
item["devDependencies"] = ["playwright@^1.61.1"]
item["docs"] = (
    "Run `npx playwright install chromium` before capturing live URLs. "
    "FFmpeg and ffprobe are optional and only needed to extract filmstrips from local video references."
)
file.write_text(json.dumps(registry, indent=2) + "\n")
print("Prepared Inspiration Intelligence dependencies.")
