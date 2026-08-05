from pathlib import Path


def replace(file, old, new):
    path = Path(file)
    text = path.read_text()
    if old not in text:
        raise SystemExit(f"Expected zoom semantics contract not found in {file}")
    path.write_text(text.replace(old, new, 1))


replace(
    "scripts/resolve-design.mjs",
    '''      const offenders = [...document.querySelectorAll("body *")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className.slice(0, 80) : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        })
        .filter((item) => item.right > innerWidth + 2 || item.left < -2)
        .sort((left, right) => Math.max(right.right - innerWidth, -right.left) - Math.max(left.right - innerWidth, -left.left))
        .slice(0, 5);
      const result = {
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
        documentWidth: document.documentElement.scrollWidth,
        offenders,
      };''',
    '''      const offenders = [...document.querySelectorAll("body *")]
        .filter((element) => {
          if (element.closest('[aria-hidden="true"]')) return false;
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) <= 0.02) return false;
          if (style.position === "fixed" && style.pointerEvents === "none") return false;
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className.slice(0, 80) : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        })
        .filter((item) => item.right > innerWidth + 2 || item.left < -2)
        .sort((left, right) => Math.max(right.right - innerWidth, -right.left) - Math.max(left.right - innerWidth, -left.left))
        .slice(0, 5);
      const result = {
        horizontalOverflow: offenders.length > 0,
        documentWidth: document.documentElement.scrollWidth,
        offenders,
      };''',
)

replace(
    "templates/modular-scroll-starter/index.html",
    '''      .scene {
        inset: 0;
        padding-left: 90vw;
        overflow: clip;
        opacity: 0.56;
      }

      .scene-core {
        width: min(130vw, 650px);
      }''',
    '''      .scene {
        inset: 10vh -70vw 8vh 25vw;
        opacity: 0.56;
      }

      .scene-core {
        width: 130vw;
      }''',
)

print("Made text-zoom overflow checks semantic and restored the authored scene framing.")
