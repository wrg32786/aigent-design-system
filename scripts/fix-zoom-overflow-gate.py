from pathlib import Path

path = Path("scripts/resolve-design.mjs")
text = path.read_text()
old = '''      const result = {
        horizontalOverflow: offenders.length > 0,
        documentWidth: document.documentElement.scrollWidth,
        offenders,
      };'''
new = '''      const documentWidth = document.documentElement.scrollWidth;
      const result = {
        horizontalOverflow: documentWidth > innerWidth + 2 && offenders.length > 0,
        documentWidth,
        offenders,
      };'''
if old not in text:
    raise SystemExit("Expected zoom overflow gate not found")
path.write_text(text.replace(old, new, 1))
print("Required actual document overflow plus a meaningful offender.")
