from pathlib import Path

path = Path("templates/modular-scroll-starter/index.html")
text = path.read_text()
old = '''      .ds-theme-picker {
        width: 100%;
        max-width: calc(100vw - 32px);
      }

      .actions .ds-button {'''
new = '''      .ds-theme-picker {
        width: 100%;
        max-width: calc(100vw - 32px);
        flex-wrap: wrap;
        overflow: visible;
      }

      .ds-theme-button {
        flex: 1 1 calc(50% - 0.2rem);
        min-width: 0;
      }

      .actions .ds-button {'''
if old not in text:
    raise SystemExit("Expected mobile theme-picker contract not found")
path.write_text(text.replace(old, new, 1))
print("Recomposed the mobile theme picker for text zoom.")
