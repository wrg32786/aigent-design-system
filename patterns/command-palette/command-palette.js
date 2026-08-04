export function mountCommandPalette(dialog, {
  trigger,
  input = dialog?.querySelector("input[type='search'], input"),
  list = dialog?.querySelector("[data-command-list]"),
  shortcut = "k",
} = {}) {
  if (!(dialog instanceof HTMLDialogElement)) throw new TypeError("mountCommandPalette requires a dialog element.");

  const buttons = () => [...(list?.querySelectorAll("button[data-command]") || [])];
  const cleanups = [];

  function filter() {
    const query = input?.value.trim().toLowerCase() || "";
    for (const button of buttons()) {
      const visible = button.textContent.toLowerCase().includes(query);
      const row = button.closest("li") || button;
      row.hidden = !visible;
    }
  }

  function open() {
    if (!dialog.open) dialog.showModal();
    if (input) {
      input.value = "";
      filter();
      requestAnimationFrame(() => input.focus());
    }
  }

  function run(button) {
    const command = button?.dataset.command;
    if (!command) return;
    dialog.close();
    dialog.dispatchEvent(new CustomEvent("command:run", { bubbles: true, detail: { command } }));
  }

  function bind(node, event, handler) {
    if (!node) return;
    node.addEventListener(event, handler);
    cleanups.push(() => node.removeEventListener(event, handler));
  }

  bind(trigger, "click", open);
  bind(input, "input", filter);
  bind(list, "click", (event) => run(event.target.closest("button[data-command]")));
  bind(list, "keydown", (event) => {
    const available = buttons().filter((button) => !button.closest("li")?.hidden);
    const index = available.indexOf(document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      available[(index + 1 + available.length) % available.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      available[(index - 1 + available.length) % available.length]?.focus();
    }
  });

  const keyboard = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === shortcut.toLowerCase()) {
      event.preventDefault();
      open();
    }
  };
  bind(window, "keydown", keyboard);

  return () => cleanups.forEach((cleanup) => cleanup());
}
