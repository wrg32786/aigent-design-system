const root = document.documentElement;
const slides = [...document.querySelectorAll(".deck-slide")];
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const chapters = document.querySelector("#chapters");
const label = document.querySelector("#slide-label");

if (!slides.length || !previous || !next || !chapters || !label) {
  throw new Error("Immersive deck controls are incomplete.");
}

const requested = Number(location.hash.replace("#slide-", "")) - 1;
let active = Number.isInteger(requested) && requested >= 0 && requested < slides.length
  ? requested
  : 0;
let leavingTimer = 0;

for (const [index] of slides.entries()) {
  const button = document.createElement("button");
  button.className = "chapter-dot";
  button.type = "button";
  button.setAttribute("aria-label", `Go to slide ${index + 1}`);
  button.addEventListener("click", () => goTo(index));
  chapters.append(button);
}

const dots = [...chapters.querySelectorAll(".chapter-dot")];

function render({ focus = false, updateUrl = true } = {}) {
  for (const [index, slide] of slides.entries()) {
    const isActive = index === active;
    slide.dataset.active = String(isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
    slide.inert = !isActive;
    if (isActive) slide.removeAttribute("data-leaving");
  }

  const progress = slides.length > 1 ? active / (slides.length - 1) : 1;
  root.style.setProperty("--deck-progress", String(progress));
  root.dataset.activeSlide = String(active + 1);
  label.textContent = `Slide ${active + 1} of ${slides.length}`;
  previous.disabled = active === 0;
  next.disabled = active === slides.length - 1;
  next.textContent = active === slides.length - 1 ? "Complete" : "Next";

  for (const [index, dot] of dots.entries()) {
    if (index === active) dot.setAttribute("aria-current", "step");
    else dot.removeAttribute("aria-current");
  }

  const hash = `#slide-${active + 1}`;
  if (updateUrl && location.hash !== hash) history.replaceState(null, "", hash);
  if (focus) slides[active].querySelector("h1, h2")?.focus({ preventScroll: true });
}

function goTo(index) {
  const target = Math.max(0, Math.min(slides.length - 1, index));
  if (target === active) return;

  clearTimeout(leavingTimer);
  const outgoing = slides[active];
  outgoing.dataset.leaving = "true";
  outgoing.dataset.active = "false";
  outgoing.setAttribute("aria-hidden", "true");
  outgoing.inert = true;

  active = target;
  render({ focus: true });
  leavingTimer = window.setTimeout(() => outgoing.removeAttribute("data-leaving"), 760);
}

previous.addEventListener("click", () => goTo(active - 1));
next.addEventListener("click", () => goTo(active + 1));
window.addEventListener("keydown", (event) => {
  if (event.defaultPrevented) return;
  if (event.key === "ArrowRight" || event.key === "PageDown") goTo(active + 1);
  if (event.key === "ArrowLeft" || event.key === "PageUp") goTo(active - 1);
  if (event.key === "Home") goTo(0);
  if (event.key === "End") goTo(slides.length - 1);
});

render({ updateUrl: false });
root.dataset.deckReady = "true";
