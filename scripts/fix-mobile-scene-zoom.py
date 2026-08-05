from pathlib import Path

path = Path("templates/modular-scroll-starter/index.html")
text = path.read_text()
old = '''      .scene {
        inset: 10vh -70vw 8vh 25vw;
        opacity: 0.56;
      }

      .scene-core {
        width: 130vw;
      }'''
new = '''      .scene {
        inset: 0;
        padding-left: 90vw;
        overflow: clip;
        opacity: 0.56;
      }

      .scene-core {
        width: min(130vw, 650px);
      }'''
if old not in text:
    raise SystemExit("Expected mobile scene contract not found")
path.write_text(text.replace(old, new, 1))
print("Constrained the decorative mobile scene for text zoom.")
