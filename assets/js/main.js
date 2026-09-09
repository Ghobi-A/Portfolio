/* Behaviour is independent of the animation library. */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 760px)");
  const menu = document.querySelector(".menu-button");
  const nav = document.querySelector("#primary-nav");
  const header = document.querySelector(".header");
  const setMenu = (open) => {
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    menu.querySelector("span").textContent = open ? "−" : "+";
  };
  menu.hidden = false;
  document.documentElement.classList.add("nav-enhanced");
  menu.addEventListener("click", () =>
    setMenu(menu.getAttribute("aria-expanded") !== "true"),
  );
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false);
      menu.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  mobile.addEventListener("change", () => setMenu(false));
  // Do not leave an expanded mobile menu behind when keyboard focus leaves it.
  header.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
  });

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
  // Native content is the source for each inspector; enhancement never fetches data.
  document.querySelectorAll('.method-rail, .audit-grid').forEach((rail, index) => {
    const items = [...rail.children];
    const controls = document.createElement('div');
    controls.className = 'stage-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Inspect diagram stages');
    const output = document.createElement('p');
    output.className = 'inspection-note';
    output.id = `stage-inspection-${index}`;
    output.setAttribute('aria-live', 'polite');
    const buttons = items.map((item, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.querySelector('strong').textContent;
      button.setAttribute('aria-controls', output.id);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => select(i));
      controls.append(button);
      return button;
    });
    function select(index) {
      items.forEach((item, i) => item.classList.toggle('is-inspected', i === index));
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      output.textContent = items[index].querySelector('span, p').textContent;
    }
    rail.after(controls, output);
    select(0);
  });

  // Inspect the measured partition chart using the already-visible source table.
  const chart = document.querySelector('.partition-chart');
  if (chart) {
    const rows = [...chart.querySelectorAll('tbody tr')];
    const controls = document.createElement('div');
    controls.className = 'stage-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Inspect partition benchmark');
    const output = document.createElement('p');
    output.className = 'inspection-note';
    output.setAttribute('aria-live', 'polite');
    const points = [...chart.querySelectorAll('.signal-point circle')];
    const buttons = rows.map((row, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${row.cells[0].textContent} partitions`;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
        rows.forEach((r, i) => r.classList.toggle('is-inspected', i === index));
        points.forEach((p, i) => p.classList.toggle('is-inspected', i === index));
        output.textContent = `Local: ${row.cells[1].textContent}; Spark: ${row.cells[2].textContent} images/s. Five runs on one runner.`;
      });
      controls.append(button);
      return button;
    });
    chart.querySelector('svg').after(controls, output);
    buttons[0].click();
  }

  const progress = document.createElement('div');
  progress.className = 'dossier-progress';
  progress.setAttribute('aria-hidden', 'true');
  header.append(progress);
  const investigationLinks = [...document.querySelectorAll('.hero-index a')];
  const investigations = investigationLinks.map(link => document.querySelector(link.hash));
  let frame = 0;
  function updateReadingPosition() {
    frame = 0;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0})`;
    let current = null;
    investigations.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * .4) current = i;
    });
    investigationLinks.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleReadingPosition() {
    if (!frame) frame = requestAnimationFrame(updateReadingPosition);
  }
  window.addEventListener('scroll', scheduleReadingPosition, {passive:true});
  window.addEventListener('resize', scheduleReadingPosition, {passive:true});
  cases.forEach(details => details.addEventListener('toggle', scheduleReadingPosition));
  document.fonts?.ready.then(scheduleReadingPosition);
  scheduleReadingPosition();
  const cancelLayoutAnimations = () => {
    [...animations].forEach(([details, animation]) =>
      finish(details, animation.targetOpen),
    );
  };
  window.addEventListener("resize", cancelLayoutAnimations, { passive: true });
  reduced.addEventListener("change", cancelLayoutAnimations);

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
