from pathlib import Path

path = Path("templates/modular-scroll-starter/index.html")
text = path.read_text()

replacements = [
    (
        '''    .hero-copy,
    .chapter-copy {
      max-width: 760px;
    }''',
        '''    .hero-copy,
    .chapter-copy {
      width: 100%;
      min-width: 0;
      max-width: 760px;
    }''',
    ),
    (
        '''    .code-block {
      max-width: 720px;
      margin-top: 44px;''',
        '''    .code-block {
      width: 100%;
      min-width: 0;
      max-width: 720px;
      margin-top: 44px;''',
    ),
    (
        '''    @media (max-width: 900px) {''',
        '''    @media (max-width: 1100px) {
      .topbar {
        align-items: flex-start;
      }

      .ds-theme-picker {
        min-width: 0;
        max-width: min(62vw, 620px);
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .ds-theme-button {
        min-width: 0;
        flex: 1 1 auto;
      }
    }

    @media (max-width: 900px) {''',
    ),
    (
        '''      .topbar {
        top: 10px;
        align-items: flex-start;
      }''',
        '''      .topbar {
        top: 10px;
        align-items: flex-start;
        flex-wrap: wrap;
      }''',
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f"Expected starter zoom contract not found: {old[:100]!r}")
    text = text.replace(old, new, 1)

path.write_text(text)
print("Fixed tablet controls and mobile grid text zoom.")
