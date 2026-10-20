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
      const heading = item.querySelector("strong").textContent.trim();
      const description = (item.querySelector("small, p") || item.querySelector("span:not(.eyebrow)"))?.textContent.trim() || "";
      output.textContent = `${heading}. ${description}`;
      if (notify) rail.dispatchEvent(new CustomEvent("evidenceinspect", { bubbles: true, detail: { target: item } }));
    };
    const buttons = items.map((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.dataset.inspectLabel || item.querySelector("strong").textContent;
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
