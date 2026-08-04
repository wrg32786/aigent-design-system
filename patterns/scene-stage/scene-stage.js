const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function mountSceneStage({
  root = document.documentElement,
  chapters = "[data-scene-chapter]",
  propertyPrefix = "--scene-stage",
} = {}) {
  const nodes = typeof chapters === "string" ? [...document.querySelectorAll(chapters)] : [...chapters];
  let frame = 0;
  let active = -1;

  function update() {
    frame = 0;
    const max = Math.max(1, root.scrollHeight - innerHeight);
    const global = clamp(scrollY / max);
    root.style.setProperty(`${propertyPrefix}-progress`, global.toFixed(4));

    let next = 0;
    let local = 0;
    nodes.forEach((node, index) => {
      const rect = node.getBoundingClientRect();
      const start = innerHeight * 0.55;
      const span = Math.max(1, rect.height + innerHeight * 0.45);
      const progress = clamp((start - rect.top) / span);
      node.style.setProperty(`${propertyPrefix}-local`, progress.toFixed(4));
      if (rect.top <= start) {
        next = index;
        local = progress;
      }
    });

    root.style.setProperty(`${propertyPrefix}-chapter`, String(next));
    root.style.setProperty(`${propertyPrefix}-local`, local.toFixed(4));
    if (next !== active) {
      active = next;
      root.dispatchEvent(new CustomEvent("scene-stage:chapter", { detail: { index: active, node: nodes[active] } }));
    }
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", requestUpdate);
  update();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    removeEventListener("scroll", requestUpdate);
    removeEventListener("resize", requestUpdate);
  };
}
