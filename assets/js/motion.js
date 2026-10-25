/* Optional, one-shot editorial choreography. Content is always visible in CSS. */
(() => {
  "use strict";
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const timing = { feedback: 220, reveal: 560, chart: 700, stagger: 85 };
  const running = new Set();
  const byElement = new WeakMap();
  const play = (element, frames, options = {}) => {
    if (preference.matches || document.hidden || !element?.animate) return;
    byElement.get(element)?.cancel();
    const animation = element.animate(frames, {
      duration: timing.reveal, easing: "cubic-bezier(.16,1,.3,1)",
      fill: "backwards", ...options,
    });
    byElement.set(element, animation);
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => {
      running.delete(animation);
      if (byElement.get(element) === animation) byElement.delete(element);
    });
  };
  const stop = () => { running.forEach(animation => animation.cancel()); running.clear(); };
  const lift = (element, delay = 0, distance = 18) => play(element, [
    { opacity: .15, transform: `translateY(${distance}px)` },
    { opacity: 1, transform: "translateY(0)" },
  ], { delay });
  preference.addEventListener("change", stop);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });

  // Never replay the opening over a bookmark or a restored reading position.
  if (!location.hash && scrollY < 100 && performance.getEntriesByType("navigation")[0]?.type !== "back_forward") {
    lift(document.querySelector(".brand"), 0, 12);
    lift(document.querySelector("#primary-nav"), 60, 12);
    document.querySelectorAll(".recruiter-role, #identity .headline-line, .recruiter-summary, .recruiter-description, .intro-actions").forEach((item, index) => lift(item, index * timing.stagger));
    lift(document.querySelector(".intro-practice"), 180, 12);
    document.querySelectorAll(".practice-signal span").forEach((item, index) =>
      play(item, [{ transform: "scaleY(.15)" }, { transform: "scaleY(1)" }], { delay: 220 + index * 55, duration: 650 }));
    lift(document.querySelector(".collection-index"), 320, 12);
  }

  document.addEventListener("privacyselect", event => {
    play(event.target.querySelector(".privacy-selection-guide"), [
      { transform: `translateX(${event.detail?.offsetX || 0}px)` }, { transform: "translateX(0)" },
    ], { duration: timing.feedback });
    play(event.target.querySelector(".is-selected .privacy-dot"), [{ strokeWidth: 6 }, { strokeWidth: 2 }], { duration: timing.feedback });
    play(event.target.querySelector(".privacy-selection"), [{ backgroundColor: "#fbd4e7" }, { backgroundColor: "#fff0f6" }], { duration: timing.feedback });
  });
  document.addEventListener("evidenceinspect", event => {
    play(event.detail.target, [{ opacity: .55, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: timing.feedback });
  });
  // Opening is immediate for keyboard users; closing retains native display semantics.
  document.addEventListener("portfolio:menu", event => {
    const nav = document.querySelector("#primary-nav");
    if (event.detail.open) lift(nav, 0, -12);
    else byElement.get(nav)?.cancel();
  });

  // A focused control and its ancestors must stop moving immediately.
  document.addEventListener("focusin", event => {
    for (let element = event.target; element; element = element.parentElement) byElement.get(element)?.cancel();
  });
  const pending = new Set();
  const reveal = element => {
    if (element.matches(".partition-chart, .frontier")) {
      element.querySelectorAll(".draw-line, .privacy-fit").forEach(line => {
        const length = line.hasAttribute("pathLength") ? Number(line.getAttribute("pathLength")) : line.getTotalLength();
        play(line, [{ strokeDasharray: String(length), strokeDashoffset: length }, { strokeDasharray: String(length), strokeDashoffset: 0 }], { duration: timing.chart });
      });
      return;
    }
    if (element.matches(".signal-system, .token-flow, .method-rail, .semantic-chain, .simulation-branches, .order-flow")) {
      const items = element.matches(".signal-system") ? element.querySelectorAll(".system-node") : element.children;
      [...items].filter(item => !item.matches(".evidence-inspector")).forEach((item, index) => lift(item, Math.min(index * timing.stagger, 340), 12));
      return;
    }
    if (element.matches(".project-copy > .tags")) { lift(element, 120, 10); return; }
    if (element.matches(".project-copy > p:not(.problem)")) { lift(element, 70, 12); return; }
    const distance = element.matches(".evidence-panel, .semantic-design") ? 12 : 20;
    lift(element, 0, distance);
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      pending.delete(entry.target);
      reveal(entry.target);
    }), { threshold: 0, rootMargin: "0px 0px -36px 0px" });
    document.querySelectorAll(".project-copy > h3, .project-copy > .problem, .project-copy > .metrics, .project-copy > .tags, .project-copy > p:not(.problem):not(.evidence-note):not(.study-context), .project-grid > .evidence-panel, .section-heading, .audio-lab > div > h3, .semantic-design, .contact h2, .partition-chart, .signal-system, .token-flow, .method-rail, .semantic-chain, .simulation-branches, .order-flow").forEach(element => {
      pending.add(element);
      observer.observe(element);
    });
    window.addEventListener("pagehide", () => { stop(); observer.disconnect(); });
    window.addEventListener("pageshow", event => { if (event.persisted) pending.forEach(element => observer.observe(element)); });
  } else window.addEventListener("pagehide", stop);
})();
