export function mountObjectStage(root, {
  trigger = root?.querySelector("[data-object-enable]"),
  status = root?.querySelector("[data-object-status]"),
  load,
  idle = true,
  desktopMin = 960,
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("mountObjectStage requires a root Element.");
  if (typeof load !== "function") throw new TypeError("mountObjectStage requires a load function.");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = navigator.connection?.saveData === true;
  let loading = false;
  let cleanup = null;

  async function enable() {
    if (loading || cleanup) return;
    loading = true;
    root.dataset.objectState = "loading";
    if (trigger) trigger.disabled = true;
    if (status) status.textContent = "Loading interactive scene…";

    try {
      cleanup = await load({ root, reducedMotion: reduced.matches });
      root.dataset.objectState = "ready";
      if (status) status.textContent = "Interactive scene active";
      if (trigger) trigger.textContent = "Interactive scene enabled";
      root.dispatchEvent(new CustomEvent("object-stage:ready"));
    } catch (error) {
      console.error(error);
      root.dataset.objectState = "fallback";
      if (status) status.textContent = "Interactive scene unavailable — fallback preserved";
      if (trigger) {
        trigger.disabled = false;
        trigger.textContent = "Retry interactive scene";
      }
      root.dispatchEvent(new CustomEvent("object-stage:error", { detail: { error } }));
    } finally {
      loading = false;
    }
  }

  trigger?.addEventListener("click", enable);

  if (idle && !reduced.matches && !saveData && innerWidth >= desktopMin) {
    (globalThis.requestIdleCallback || ((callback) => setTimeout(callback, 900)))(enable, { timeout: 2400 });
  }

  return () => {
    trigger?.removeEventListener("click", enable);
    cleanup?.();
  };
}
