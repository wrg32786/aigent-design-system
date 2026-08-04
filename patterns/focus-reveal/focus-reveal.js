export function mountFocusReveal(selector = "[data-focus-reveal]", {
  rootMargin = "0px 0px -12% 0px",
  threshold = 0.12,
} = {}) {
  const nodes = [...document.querySelectorAll(selector)];
  if (!nodes.length) return () => {};

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.dataset.visible = "true");
    return () => {};
  }

  document.documentElement.classList.add("is-focus-reveal-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.dataset.visible = "true";
      observer.unobserve(entry.target);
    });
  }, { rootMargin, threshold });

  nodes.forEach((node) => observer.observe(node));
  return () => observer.disconnect();
}
