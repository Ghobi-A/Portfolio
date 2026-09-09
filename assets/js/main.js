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
