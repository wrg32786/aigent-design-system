const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function mountGuidedDeck(root, {
  slideSelector = "[data-deck-slide]",
  previousSelector = "[data-deck-previous]",
  nextSelector = "[data-deck-next]",
  chaptersSelector = "[data-deck-chapters]",
  labelSelector = "[data-deck-label]",
  updateHash = true,
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("mountGuidedDeck requires a root Element.");

  const slides = [...root.querySelectorAll(slideSelector)];
  if (!slides.length) return () => {};

  const previous = root.querySelector(previousSelector);
  const next = root.querySelector(nextSelector);
  const chapters = root.querySelector(chaptersSelector);
  const label = root.querySelector(labelSelector);
  const listeners = [];
  let active = 0;

  const fromHash = /^#slide-(\d+)$/.exec(location.hash)?.[1];
  if (fromHash) active = clamp(Number(fromHash) - 1, 0, slides.length - 1);

  const dots = slides.map((slide, index) => {
    const heading = slide.querySelector("h1, h2, h3");
    if (heading && !heading.hasAttribute("tabindex")) heading.tabIndex = -1;

    if (!chapters) return null;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "deck-chapter";
    button.setAttribute("aria-label", `Go to slide ${index + 1}`);
    const handler = () => show(index, { focus: true });
    button.addEventListener("click", handler);
    listeners.push(() => button.removeEventListener("click", handler));
    chapters.append(button);
    return button;
  });

  function sync({ focus = false } = {}) {
    root.style.setProperty("--deck-progress", String(slides.length > 1 ? active / (slides.length - 1) : 1));
    root.dataset.deckIndex = String(active);

    slides.forEach((slide, index) => {
      const current = index === active;
      slide.dataset.active = String(current);
      slide.setAttribute("aria-hidden", String(!current));
      slide.inert = !current;
      if (current && focus) slide.querySelector("h1, h2, h3")?.focus({ preventScroll: true });
    });

    if (previous) previous.disabled = active === 0;
    if (next) {
      next.disabled = active === slides.length - 1;
      next.dataset.complete = String(active === slides.length - 1);
    }
    if (label) label.textContent = `Slide ${active + 1} of ${slides.length}`;
    dots.forEach((dot, index) => {
      if (!dot) return;
      if (index === active) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });

    if (updateHash) history.replaceState(null, "", `#slide-${active + 1}`);
    root.dispatchEvent(new CustomEvent("deck:change", { detail: { index: active, count: slides.length } }));
  }

  function show(index, options) {
    const target = clamp(index, 0, slides.length - 1);
    if (target === active) return;
    root.dataset.direction = target > active ? "forward" : "backward";
    active = target;
    sync(options);
  }

  function bind(node, event, handler) {
    if (!node) return;
    node.addEventListener(event, handler);
    listeners.push(() => node.removeEventListener(event, handler));
  }

  bind(previous, "click", () => show(active - 1, { focus: true }));
  bind(next, "click", () => show(active + 1, { focus: true }));

  const keyHandler = (event) => {
    if (event.defaultPrevented || /input|textarea|select/i.test(event.target?.tagName || "")) return;
    if (["ArrowRight", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      show(active + 1, { focus: true });
    } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      show(active - 1, { focus: true });
    } else if (event.key === "Home") {
      event.preventDefault();
      show(0, { focus: true });
    } else if (event.key === "End") {
      event.preventDefault();
      show(slides.length - 1, { focus: true });
    }
  };
  bind(root, "keydown", keyHandler);

  root.classList.add("is-deck-ready");
  sync();

  return () => {
    listeners.forEach((remove) => remove());
    dots.forEach((dot) => dot?.remove());
    root.classList.remove("is-deck-ready");
    slides.forEach((slide) => {
      slide.inert = false;
      slide.removeAttribute("aria-hidden");
      delete slide.dataset.active;
    });
  };
}
