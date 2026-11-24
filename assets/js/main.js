/* Behaviour is independent of the animation library. */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const nav = document.querySelector("#primary-nav");
  const header = document.querySelector(".header");
  // Navigation is bootstrapped immediately after the header to avoid layout shift.

  const cases = [...document.querySelectorAll(".case-study")];
  const animations = new Map();
  const finish = (details, open) => {
    animations.get(details)?.cancel();
    animations.delete(details);
    details.open = open;
    details.style.height = "";
    details.style.overflow = "";
    details
      .querySelector("summary")
      .setAttribute("aria-expanded", String(open));
  };
  cases.forEach((details) => {
    const summary = details.querySelector("summary");
    summary.setAttribute("aria-expanded", String(details.open));
    // Native toggle remains the fallback; only a user-triggered disclosure measures layout.
    summary.addEventListener("click", (event) => {
      if (reduced.matches || !details.animate) return;
      event.preventDefault();
      const target = animations.has(details)
        ? !animations.get(details).targetOpen
        : !details.open;
      const start = details.getBoundingClientRect().height;
      animations.get(details)?.cancel();
      details.open = true;
      const end = target
        ? details.scrollHeight
        : summary.getBoundingClientRect().height + 2;
      summary.setAttribute("aria-expanded", String(target));
      details.style.overflow = "hidden";
      const animation = details.animate(
        [{ height: `${start}px` }, { height: `${end}px` }],
        { duration: 240, easing: "cubic-bezier(.2,.65,.3,1)" },
      );
      animation.targetOpen = target;
      animations.set(details, animation);
      animation.onfinish = () => finish(details, target);
    });
    details.addEventListener("toggle", () => {
      if (!animations.has(details))
        summary.setAttribute("aria-expanded", String(details.open));
    });
  });
  // Stable legacy case IDs still support bookmarks and the evidence links below.
  const openHash = () => {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (target?.matches("details")) {
      finish(target, true);
      requestAnimationFrame(() =>
        target.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    }
  };
  window.addEventListener("hashchange", openHash);
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link && link.hash === location.hash) openHash();
  });
  openHash();

  // Adapted from PR #5: inspect the authored evidence, not a second metric store.
  let inspectorCount = 0;
  const wireArrowKeys = (buttons, select) => buttons.forEach((button, index) => {
    button.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length;
      select(next);
      buttons[next].focus({ preventScroll: true });
    });
  });
  const inspectStages = (rail, items, label) => {
    if (!items.length || rail.dataset.inspectorReady) return;
    rail.dataset.inspectorReady = "true";
    const inspector = document.createElement("fieldset");
    inspector.className = "evidence-inspector";
    const legend = document.createElement("legend");
    legend.textContent = label;
    const controls = document.createElement("div");
    controls.className = "stage-controls";
    const output = document.createElement("p");
    output.className = "inspection-note";
    output.id = `stage-inspection-${inspectorCount++}`;
    output.setAttribute("role", "status");
    output.setAttribute("aria-atomic", "true");
    const select = (selected, notify = true) => {
      items.forEach((item, index) => item.classList.toggle("is-inspected", index === selected));
      buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === selected)));
      const item = items[selected];
      const heading = (item.querySelector("strong") || item).textContent.trim();
      const description = item.dataset.inspectNote || (item.querySelector("small, p") || item.querySelector("span:not(.eyebrow)"))?.textContent.trim() || "";
      output.textContent = `${heading}. ${description}`;
      if (notify) rail.dispatchEvent(new CustomEvent("evidenceinspect", { bubbles: true, detail: { target: item } }));
    };
    const buttons = items.map((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.dataset.inspectLabel || (item.querySelector("strong") || item).textContent;
      button.setAttribute("aria-controls", output.id);
      button.addEventListener("click", () => select(index));
      controls.append(button);
      return button;
    });
    wireArrowKeys(buttons, select);
    inspector.append(legend, controls, output);
    const caption = rail.querySelector(":scope > figcaption");
    if (caption) caption.before(inspector);
    else rail.after(inspector);
    select(0, false);
  };
  document.querySelectorAll(".method-rail, .audit-grid").forEach((rail) =>
    inspectStages(rail, [...rail.children], "Inspect the method"));
  const classifier = document.querySelector(".signal-system");
  if (classifier) inspectStages(classifier, [...classifier.querySelectorAll(".system-node")], "Explore the classification pipeline");
  const lifecycle = document.querySelector(".order-flow");
  if (lifecycle) inspectStages(lifecycle, [...lifecycle.children], "Inspect the order lifecycle");

  document.querySelectorAll(".simulation-branches, .token-flow").forEach(rail =>
    inspectStages(rail, [...rail.children], rail.matches(".token-flow") ? "Explore the MIDI pipeline" : "Explore the shared combat model"));

  const benchmark = document.querySelector(".partition-chart");
  if (benchmark) {
    const svg = benchmark.querySelector("svg");
    const rows = [...benchmark.querySelectorAll("tbody tr")];
    const points = [...svg.querySelectorAll(".signal-point > circle")];
    const ns = "http://www.w3.org/2000/svg";
    const make = (tag, attributes) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
      return node;
    };
    const inspector = document.createElement("fieldset");
    inspector.className = "evidence-inspector benchmark-inspector";
    const legend = document.createElement("legend");
    legend.textContent = "Compare measured partition settings";
    const controls = document.createElement("div");
    controls.className = "stage-controls";
    const output = document.createElement("p");
    output.id = "partition-readout";
    output.className = "inspection-note";
    output.setAttribute("role", "status");
    output.setAttribute("aria-atomic", "true");
    const marks = [];
    svg.setAttribute("role", "group");
    const select = (selected, notify = true) => {
      rows.forEach((row, index) => row.classList.toggle("is-inspected", index === selected));
      marks.forEach((mark, index) => {
        mark.classList.toggle("is-inspected", index === selected);
        mark.setAttribute("aria-pressed", String(index === selected));
      });
      buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === selected)));
      const cells = rows[selected].cells;
      output.textContent = `${cells[0].textContent} ${selected === 0 ? "partition" : "partitions"}: Local ${cells[1].textContent}; Spark ${cells[2].textContent} images/s. Five runs per setting, one runner—not a multi-worker comparison.`;
      if (notify) benchmark.dispatchEvent(new CustomEvent("evidenceinspect", { bubbles: true, detail: { target: output } }));
    };
    const buttons = rows.map((row, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${row.cells[0].textContent} ${index === 0 ? "partition" : "partitions"}`;
      button.setAttribute("aria-controls", output.id);
      button.addEventListener("click", () => select(index));
      controls.append(button);
      const point = points[index];
      const x = Number(point.getAttribute("cx"));
      const localY = 195 - Number(row.cells[1].textContent.replace(/,/g, "")) / 1200 * 165;
      const mark = make("g", { class: "partition-marker", role: "button", tabindex: "0", "aria-label": `${button.textContent}: Local ${row.cells[1].textContent}, Spark ${row.cells[2].textContent} images per second` });
      point.before(mark);
      const range = make("line", { x1: x, x2: x, y1: localY, y2: point.getAttribute("cy"), class: "partition-comparison" });
      const hit = make("circle", { cx: x, cy: point.getAttribute("cy"), r: 18, class: "partition-hit" });
      const local = make("circle", { cx: x, cy: localY, r: 4, class: "partition-local-point" });
      mark.append(range, hit, point, local);
      marks.push(mark);
      mark.addEventListener("click", () => select(index));
      mark.addEventListener("keydown", (event) => {
        if (["Enter", " ", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1
            : event.key === "ArrowRight" ? (index + 1) % rows.length
            : event.key === "ArrowLeft" ? (index + rows.length - 1) % rows.length : index;
          select(next);
          buttons[next].focus({ preventScroll: true });
        }
      });
      return button;
    });
    wireArrowKeys(buttons, select);
    inspector.append(legend, controls, output);
    svg.after(inspector);
    select(0, false);
  }

  // ---- The bench: three measured experiments beside the sculpture ------------
  // State lives on the stage's data attributes so the optional sculpture can
  // pick it up whenever it finishes loading; every change also fires "labchange".
  const lab = document.querySelector("[data-lab]");
  if (lab) {
    const allowMotion = () => !reduced.matches && !document.hidden;
    const announce = (kind, detail = {}) =>
      lab.dispatchEvent(new CustomEvent("labchange", { bubbles: true, detail: { kind, ...detail } }));
    const tween = (element, attributes) => {
      if (window.gsap && allowMotion()) window.gsap.to(element, { attr: attributes, duration: 0.6, ease: "power3.out", overwrite: true });
      else Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    };
    lab.classList.add("lab-enhanced");

    // Modes: an ARIA tab set with automatic activation.
    const tablist = lab.querySelector('[role="tablist"]');
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
    const count = lab.querySelector("[data-lab-count]");
    panels.forEach((panel, index) => {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabs[index].id);
    });
    let modeIndex = 0;
    const firstVisit = new Set();
    const selectMode = (index, notify = true) => {
      modeIndex = index;
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach((panel, i) => { panel.hidden = i !== index; });
      const mode = tabs[index].dataset.mode;
      lab.dataset.mode = mode;
      if (count) count.textContent = String(index + 1).padStart(2, "0");
      if (notify) announce("mode", { mode, panel: panels[index] });
      if (notify && !firstVisit.has(mode)) {
        firstVisit.add(mode);
        if (mode === "applications") demoQueue();
      }
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectMode(index));
      tab.addEventListener("keydown", (event) => {
        const keys = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" };
        if (!(event.key in keys)) return;
        event.preventDefault();
        const step = keys[event.key];
        const next = step === "first" ? 0 : step === "last" ? tabs.length - 1 : (modeIndex + step + tabs.length) % tabs.length;
        selectMode(next);
        tabs[next].focus();
      });
    });
    tablist.hidden = false;

    // Research: the three measured privacy budgets.
    const budgets = [
      { epsilon: "0.49", auc: 0.933, low: 0.909, high: 0.957, noise: 1 },
      { epsilon: "2", auc: 0.944, low: 0.927, high: 0.960, noise: 0.42 },
      { epsilon: "6", auc: 0.945, low: 0.928, high: 0.961, noise: 0.16 },
    ];
    const strip = (value) => 10 + (value - 0.9) / 0.07 * 300;
    const three = (value) => value.toFixed(3).replace(/^0/, "");
    const epsButtons = [...lab.querySelectorAll("[data-lab-epsilon]")];
    const field = (name) => lab.querySelector(`[data-lab-${name}]`);
    const selectBudget = (index, notify = true) => {
      const budget = budgets[index];
      epsButtons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
      field("auc").textContent = three(budget.auc);
      field("eps").textContent = budget.epsilon;
      field("interval").textContent = `${three(budget.low)}–${three(budget.high)}`;
      field("gap").textContent = three(0.953 - budget.auc);
      tween(field("band"), { x: strip(budget.low).toFixed(1), width: (strip(budget.high) - strip(budget.low)).toFixed(1) });
      tween(field("dot"), { cx: strip(budget.auc).toFixed(1) });
      lab.dataset.noise = String(budget.noise);
      if (notify) {
        field("status").textContent = `ε ${budget.epsilon}: mean ROC-AUC ${three(budget.auc)}, 95% t interval ${three(budget.low)} to ${three(budget.high)}, ${three(0.953 - budget.auc)} below the non-private reference.`;
        announce("epsilon", { noise: budget.noise });
      }
    };
    epsButtons.forEach((button, index) => button.addEventListener("click", () => selectBudget(index)));
    wireArrowKeys(epsButtons, selectBudget);
    epsButtons[0].parentElement.hidden = false;
    selectBudget(0, false);

    // Applications: the first 20 of a 200-comment review queue.
    // Expected counts: random order finds prevalence 0.30 x 20 = 6 actionable;
    // the model's top decile finds 0.30 x Lift@10% 2.5 x 20 = 15.
    const cells = [...lab.querySelectorAll("[data-lab-queue] i")];
    const hits = {
      random: [1, 4, 8, 11, 15, 18],
      ranked: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 15, 17, 19],
    };
    const copy = {
      random: ["≈6 of 20", "actionable when the first 10% of a 200-comment queue is read in random order."],
      ranked: ["≈15 of 20", "actionable in the first 10% of a 200-comment queue, ranked by the model."],
    };
    const orderButtons = [...lab.querySelectorAll("[data-lab-order]")];
    let orderTouched = false;
    const selectOrder = (index, notify = true) => {
      const order = orderButtons[index].dataset.labOrder;
      orderButtons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
      cells.forEach((cell, i) => {
        cell.style.transitionDelay = allowMotion() ? `${i * 22}ms` : "";
        cell.classList.toggle("is-hit", hits[order].includes(i));
      });
      field("queue-count").textContent = copy[order][0];
      field("queue-text").textContent = copy[order][1];
      lab.dataset.order = order;
      if (notify) announce("order", { ranked: order === "ranked" });
    };
    orderButtons.forEach((button, index) => button.addEventListener("click", () => { orderTouched = true; selectOrder(index); }));
    wireArrowKeys(orderButtons, (index) => { orderTouched = true; selectOrder(index); });
    orderButtons[0].parentElement.hidden = false;
    selectOrder(1, false);
    // On a first visit, show the change once: random order, then the ranking.
    function demoQueue() {
      if (!allowMotion() || orderTouched) return;
      selectOrder(0);
      setTimeout(() => { if (!orderTouched && lab.dataset.mode === "applications") selectOrder(1); }, 1100);
    }

    // Systems: four lifecycle steps.
    const steps = [...lab.querySelectorAll("[data-lab-step]")];
    const stepButtons = steps.map((step) => step.querySelector("button"));
    const selectStep = (index, notify = true) => {
      steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
      stepButtons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
      lab.dataset.step = String(index);
      if (notify) announce("step", { step: index, target: steps[index].querySelector("p") });
    };
    stepButtons.forEach((button, index) => button.addEventListener("click", () => selectStep(index)));
    wireArrowKeys(stepButtons, selectStep);
    selectStep(0, false);

    selectMode(0, false);
    firstVisit.add("research");
  }

  // ---- Featured index: each title drives a live preview of that project ----
  // Hover or keyboard focus previews; on touch the first tap previews and the
  // second opens the project. motion.js animates "featuredchange" when allowed.
  const featured = document.querySelector("[data-featured]");
  if (featured) {
    const links = [...featured.querySelectorAll("[data-preview]")];
    const panels = new Map([...featured.querySelectorAll("[data-preview-panel]")].map((panel) => [panel.dataset.previewPanel, panel]));
    const counter = featured.querySelector("[data-preview-index]");
    let current = null;
    const show = (link, notify = true) => {
      if (!link || link === current) return;
      const previous = current && panels.get(current.dataset.preview);
      current = link;
      const panel = panels.get(link.dataset.preview);
      links.forEach((item) => item.classList.toggle("is-current", item === link));
      panels.forEach((item) => item.classList.remove("is-leaving"));
      if (previous && previous !== panel) previous.classList.add("is-leaving");
      panels.forEach((item) => item.classList.toggle("is-active", item === panel));
      if (counter) counter.textContent = String(links.indexOf(link) + 1).padStart(2, "0");
      const detail = { panel, previous, handled: false };
      if (notify) featured.dispatchEvent(new CustomEvent("featuredchange", { bubbles: true, detail }));
      if (!detail.handled) previous?.classList.remove("is-leaving");
    };
    links.forEach((link) => {
      link.addEventListener("pointerenter", (event) => { if (event.pointerType !== "touch") show(link); });
      let touched = false;
      link.addEventListener("pointerdown", (event) => { touched = event.pointerType === "touch"; });
      // A tap focuses the link before its click; leave touch to the click handler.
      link.addEventListener("focus", () => { if (!touched) show(link); });
      link.addEventListener("click", (event) => {
        if (touched && link !== current) { event.preventDefault(); show(link); }
        touched = false;
      });
    });
    show(links[0], false);
  }

  const collectionLinks = [...document.querySelectorAll(".collection-index a")];
  const selectCollection = (id) => collectionLinks.forEach((link) => {
    if (link.hash === "#" + id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  collectionLinks.forEach((link) => link.addEventListener("click", () => selectCollection(link.hash.slice(1))));
  // PR #5's reading progress, adapted to the current collection index.
  const progress = document.createElement("div");
  progress.className = "dossier-progress";
  progress.setAttribute("aria-hidden", "true");
  header.append(progress);
  const investigations = collectionLinks.map((link) => document.querySelector(link.hash));
  let readingFrame = 0;
  const updateReadingPosition = () => {
    readingFrame = 0;
    if (document.hidden) return;
    const height = document.documentElement.scrollHeight - innerHeight;
    let current = 0;
    investigations.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= innerHeight * .38) current = index;
    });
    progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0})`;
    if (collectionLinks[current]) selectCollection(collectionLinks[current].hash.slice(1));
  };
  const scheduleReadingPosition = () => {
    if (!readingFrame) readingFrame = requestAnimationFrame(updateReadingPosition);
  };
  window.addEventListener("scroll", scheduleReadingPosition, { passive: true });
  window.addEventListener("resize", scheduleReadingPosition, { passive: true });
  document.addEventListener("visibilitychange", scheduleReadingPosition);
  cases.forEach((details) => details.addEventListener("toggle", scheduleReadingPosition));
  document.fonts?.ready.then(scheduleReadingPosition);
  if ("ResizeObserver" in window) new ResizeObserver(scheduleReadingPosition).observe(document.body);
  scheduleReadingPosition();
  const cancelLayoutAnimations = () => {
    [...animations].forEach(([details, animation]) =>
      finish(details, animation.targetOpen),
    );
  };
  window.addEventListener("resize", cancelLayoutAnimations, { passive: true });
  reduced.addEventListener("change", cancelLayoutAnimations);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelLayoutAnimations();
  });

  if ("IntersectionObserver" in window) {
    const hero = document.querySelector(".hero");
    new IntersectionObserver(
      ([entry]) => header.classList.toggle("compact", !entry.isIntersecting),
      { rootMargin: "-85px 0px 0px 0px" },
    ).observe(hero);
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = links.map((link) => document.querySelector(link.hash));
    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          visible.set(entry.target.id, entry.isIntersecting),
        );
        const selected = sections.find((section) => visible.get(section.id));
        links.forEach((link) =>
          selected && link.hash === `#${selected.id}`
            ? link.setAttribute("aria-current", "location")
            : link.removeAttribute("aria-current"),
        );
      },
      { rootMargin: "-15% 0px -35% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
  }
})();
