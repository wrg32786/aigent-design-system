const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function prefersReducedMotion() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function mountScrollScene({
  root = document.documentElement,
  progressMultiplier = 1.75,
  scale = 1.35,
  rotation = -72,
  brightness = [0.78, 1],
} = {}) {
  let frame = 0;

  function update() {
    frame = 0;
    const max = Math.max(1, root.scrollHeight - globalThis.innerHeight);
    const progress = clamp(globalThis.scrollY / max);
    const sceneProgress = prefersReducedMotion()
      ? 0
      : clamp(progress * progressMultiplier);

    root.style.setProperty("--ds-scroll", progress.toFixed(4));
    root.style.setProperty("--ds-scene-scale", (1 + sceneProgress * scale).toFixed(3));
    root.style.setProperty("--ds-scene-rotate", `${(sceneProgress * rotation).toFixed(2)}deg`);
    root.style.setProperty(
      "--ds-scene-brightness",
      (brightness[0] + sceneProgress * (brightness[1] - brightness[0])).toFixed(2),
    );
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  globalThis.addEventListener("scroll", requestUpdate, { passive: true });
  globalThis.addEventListener("resize", requestUpdate);
  update();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    globalThis.removeEventListener("scroll", requestUpdate);
    globalThis.removeEventListener("resize", requestUpdate);
  };
}

export function mountReveals(
  selector = "[data-reveal]",
  { rootMargin = "0px 0px -12% 0px", threshold = 0.08 } = {},
) {
  const nodes = [...document.querySelectorAll(selector)];
  if (!nodes.length) return () => {};

  if (prefersReducedMotion() || !("IntersectionObserver" in globalThis)) {
    for (const node of nodes) node.classList.add("is-visible");
    return () => {};
  }

  document.documentElement.classList.add("is-reveal-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin, threshold },
  );

  for (const node of nodes) observer.observe(node);
  return () => observer.disconnect();
}

export function mountThemePicker(
  selector = "[data-set-theme]",
  { target = document.documentElement } = {},
) {
  const buttons = [...document.querySelectorAll(selector)];
  if (!buttons.length) return () => {};

  function setTheme(theme) {
    target.dataset.theme = theme;
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.setTheme === theme));
    }
  }

  const listeners = buttons.map((button) => {
    const onClick = () => setTheme(button.dataset.setTheme);
    button.addEventListener("click", onClick);
    return [button, onClick];
  });

  setTheme(target.dataset.theme || buttons[0].dataset.setTheme);
  return () => {
    for (const [button, onClick] of listeners) {
      button.removeEventListener("click", onClick);
    }
  };
}
