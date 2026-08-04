const slides = [...document.querySelectorAll(".deck-slide")];
    const previous = document.querySelector("#previous");
    const next = document.querySelector("#next");
    const chapters = document.querySelector("#chapters");
    const label = document.querySelector("#slide-label");
    let active = 0;
    let leavingTimer = 0;

    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", String(index !== 0));
      if (index !== 0) slide.inert = true;
      const button = document.createElement("button");
      button.className = "chapter-dot";
      button.type = "button";
      button.setAttribute("aria-label", `Go to slide ${index + 1}`);
      button.addEventListener("click", () => show(index));
      chapters.append(button);
    });

    const dots = [...chapters.children];

    function show(index) {
      const target = Math.max(0, Math.min(slides.length - 1, index));
      if (target === active) return;

      clearTimeout(leavingTimer);
      const outgoing = slides[active];
      outgoing.dataset.leaving = "true";
      outgoing.dataset.active = "false";
      outgoing.setAttribute("aria-hidden", "true");
      outgoing.inert = true;

      active = target;
      const incoming = slides[active];
      incoming.dataset.active = "true";
      incoming.removeAttribute("data-leaving");
      incoming.setAttribute("aria-hidden", "false");
      incoming.inert = false;

      leavingTimer = window.setTimeout(() => outgoing.removeAttribute("data-leaving"), 760);
      sync();
      incoming.querySelector("h1, h2")?.focus({ preventScroll: true });
    }

    function sync() {
      document.documentElement.style.setProperty("--deck-progress", String(active / (slides.length - 1)));
      label.textContent = `Slide ${active + 1} of ${slides.length}`;
      previous.disabled = active === 0;
      next.disabled = active === slides.length - 1;
      next.textContent = active === slides.length - 1 ? "Complete" : "Next";
      dots.forEach((dot, index) => {
        if (index === active) dot.setAttribute("aria-current", "step");
        else dot.removeAttribute("aria-current");
      });
      history.replaceState(null, "", `#slide-${active + 1}`);
    }

    previous.addEventListener("click", () => show(active - 1));
    next.addEventListener("click", () => show(active + 1));
    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") show(active + 1);
      if (event.key === "ArrowLeft" || event.key === "PageUp") show(active - 1);
      if (event.key === "Home") show(0);
      if (event.key === "End") show(slides.length - 1);
    });

    const requested = Number(location.hash.replace("#slide-", "")) - 1;
    if (Number.isInteger(requested) && requested >= 0) {
      active = requested;
      slides.forEach((slide, index) => {
        slide.dataset.active = String(index === active);
        slide.setAttribute("aria-hidden", String(index !== active));
        slide.inert = index !== active;
      });
    }
    sync();
