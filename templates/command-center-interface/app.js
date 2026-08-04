const tasks = [
      {
        id: "homepage-proof",
        title: "Approve homepage proof sequence",
        priority: "P0",
        status: "Ready",
        owner: "Pheme",
        age: "8m",
        summary: "The revised homepage now puts the product mechanism before the ecosystem explanation. Review the final evidence order and mobile crop.",
        decision: "Approve the sequence or request one specific change.",
        trace: [
          ["08:04", "Research and message hierarchy completed."],
          ["08:17", "Desktop sequence rendered with production copy."],
          ["08:26", "Mobile crop and reduced-motion state verified."]
        ]
      },
      {
        id: "deck-asset",
        title: "Choose the deck's opening media",
        priority: "P1",
        status: "Ready",
        owner: "DaVinci",
        age: "24m",
        summary: "Two viable directions remain: an authored Blender descent or a lighter encoded macro sequence. Both preserve the same slide timing.",
        decision: "Choose the media route. The page structure does not change.",
        trace: [
          ["07:42", "Asset brief completed."],
          ["07:58", "Licensing and production budget checked."],
          ["08:09", "Desktop and mobile storyboards attached."]
        ]
      },
      {
        id: "registry",
        title: "Publish the installable registry",
        priority: "P1",
        status: "Ready",
        owner: "Titus",
        age: "41m",
        summary: "The GitHub registry exposes the studio core, cinematic pages, sales deck, interface, Three.js stage, and quality suite.",
        decision: "Approve the public item names and default install path.",
        trace: [
          ["07:18", "Registry contract generated."],
          ["07:33", "Dependency graph checked."],
          ["07:49", "Dry-run conflict behavior verified."]
        ]
      },
      {
        id: "font-system",
        title: "Ratify the product type system",
        priority: "P2",
        status: "Ready",
        owner: "Metis",
        age: "1h",
        summary: "The Operate surface uses one stable UI family and a data face. The expressive display family remains limited to marketing and deck surfaces.",
        decision: "Confirm this as a durable design-system rule.",
        trace: [
          ["06:52", "Role inventory completed."],
          ["07:06", "Long labels and 200% zoom tested."],
          ["07:12", "Fallback metrics reviewed."]
        ]
      }
    ];

    const queueList = document.querySelector("#queue-list");
    const emptyState = document.querySelector("#empty-state");
    const workspace = document.querySelector("#workspace-body");
    const search = document.querySelector("#search");
    const rail = document.querySelector("#rail");
    const mobileNav = document.querySelector("#mobile-nav");
    const dialog = document.querySelector("#command-dialog");
    const commandSearch = document.querySelector("#command-search");
    const commandList = document.querySelector("#command-list");
    let selected = tasks[0].id;

    function filteredTasks() {
      const query = search.value.trim().toLowerCase();
      return tasks.filter((task) => `${task.title} ${task.owner} ${task.priority} ${task.status}`.toLowerCase().includes(query));
    }

    function renderQueue() {
      const visible = filteredTasks();
      queueList.replaceChildren();
      emptyState.hidden = visible.length > 0;
      document.querySelector("#review-count").value = String(visible.length);

      for (const task of visible) {
        const li = document.createElement("li");
        li.className = "queue-item";
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.id = task.id;
        button.setAttribute("aria-current", String(task.id === selected));
        button.innerHTML = `
          <span class="item-top"><span>${task.title}</span><span class="priority">${task.priority}</span></span>
          <span class="item-meta"><span class="status-ready">${task.status}</span><span>${task.owner}</span><span>${task.age}</span></span>
        `;
        button.addEventListener("click", () => selectTask(task.id));
        li.append(button);
        queueList.append(li);
      }

      if (!visible.some((task) => task.id === selected) && visible[0]) selectTask(visible[0].id, false);
    }

    function selectTask(id, focus = true) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;
      selected = id;
      for (const button of queueList.querySelectorAll("button[data-id]")) {
        button.setAttribute("aria-current", String(button.dataset.id === id));
      }
      workspace.innerHTML = `
        <header class="task-header">
          <div>
            <p class="ds-status">${task.priority} / ${task.status} / ${task.owner}</p>
            <h2>${task.title}</h2>
            <p>${task.summary}</p>
          </div>
          <div class="task-actions">
            <button type="button" data-primary="true" data-action="approve">Approve</button>
            <button type="button" data-action="changes">Request changes</button>
          </div>
        </header>
        <section class="section">
          <h3>Decision</h3>
          <p>${task.decision}</p>
        </section>
        <section class="section">
          <h3>Activity trace</h3>
          <ol class="trace">
            ${task.trace.map(([time, text]) => `<li><time>${time}</time><span>${text}</span></li>`).join("")}
          </ol>
        </section>
      `;
      workspace.querySelector('[data-action="approve"]').addEventListener("click", () => announce(`${task.title} approved.`));
      workspace.querySelector('[data-action="changes"]').addEventListener("click", () => announce(`Change request opened for ${task.title}.`));
      if (focus) document.querySelector("#workspace").focus({ preventScroll: true });
    }

    function announce(message) {
      const existing = document.querySelector("#announcement");
      existing?.remove();
      const node = document.createElement("p");
      node.id = "announcement";
      node.className = "ds-status";
      node.setAttribute("role", "status");
      node.textContent = message;
      workspace.prepend(node);
    }

    function toggleRail(force) {
      const open = force ?? rail.dataset.open !== "true";
      rail.dataset.open = String(open);
      mobileNav.setAttribute("aria-expanded", String(open));
    }

    function openPalette() {
      if (!dialog.open) dialog.showModal();
      commandSearch.value = "";
      filterCommands();
      requestAnimationFrame(() => commandSearch.focus());
    }

    function filterCommands() {
      const query = commandSearch.value.toLowerCase();
      for (const button of commandList.querySelectorAll("button")) {
        button.closest("li").hidden = !button.textContent.toLowerCase().includes(query);
      }
    }

    function runCommand(command) {
      dialog.close();
      if (command === "focus-search") search.focus();
      if (command === "approve") workspace.querySelector('[data-action="approve"]')?.click();
      if (command === "request") workspace.querySelector('[data-action="changes"]')?.click();
      if (command === "navigation") toggleRail();
    }

    search.addEventListener("input", renderQueue);
    mobileNav.addEventListener("click", () => toggleRail());
    document.querySelector("#open-palette").addEventListener("click", openPalette);
    commandSearch.addEventListener("input", filterCommands);
    commandList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-command]");
      if (button) runCommand(button.dataset.command);
    });
    window.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
      }
      if (event.key === "Escape" && rail.dataset.open === "true") toggleRail(false);
    });

    renderQueue();
    selectTask(selected, false);
