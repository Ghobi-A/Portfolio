/* Optional GSAP choreography. Content is always visible in CSS; nothing here is
 * required to read, navigate or inspect the portfolio.
 *
 * Principles (see docs/MOTION-AUDIT-2026-11-03.md):
 *  - Entrances use a strong ease-out; on-screen movement uses ease-in-out.
 *  - Interaction feedback is <= 220ms; reveals ~600ms; the hero field ~2.6s, once.
 *  - Each target animates once. No replay on reverse scroll, no perpetual loops.
 *  - Reduced motion, focus, page hiding and page exit settle everything at once.
 */
(() => {
  "use strict";
  const root = document.documentElement;
  const releaseIntro = () => root.classList.remove("motion-intro");
  const { gsap, ScrollTrigger, SplitText, CustomEase } = window;
  if (!gsap || !ScrollTrigger || !SplitText || !CustomEase) { releaseIntro(); return; }

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("portfolio-out", "0.23, 1, 0.32, 1");
  CustomEase.create("portfolio-in-out", "0.77, 0, 0.175, 1");
  gsap.defaults({ ease: "portfolio-out", duration: 0.6 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const timing = { feedback: 0.22, reveal: 0.6, line: 0.9, chart: 0.8, stagger: 0.085 };
  const log = [];
  window.portfolioMotion = { log, timing };

  // ---- Bookkeeping: everything finite, everything interruptible ---------------
  const running = new Set();
  const splits = new Set();
  const track = (tween, label) => {
    running.add(tween);
    if (label) log.push({ target: label, delay: Math.round(tween.delay() * 1000) });
    tween.then(() => running.delete(tween));
    return tween;
  };
  const settleAll = () => {
    running.forEach((tween) => tween.progress(1));
    running.clear();
    splits.forEach((split) => split.revert());
    splits.clear();
    releaseIntro();
  };
  const describe = (element) => element.id || [...element.classList].join(" ") || element.tagName.toLowerCase();
  const allowed = () => !reduced.matches && !document.hidden;

  // A split is presentation only: revert it the moment its animation ends.
  const split = (element, type) => {
    const instance = SplitText.create(element, { type, mask: type.includes("lines") ? "lines" : undefined, linesClass: "split-line", charsClass: "split-char", aria: "auto" });
    splits.add(instance);
    const revert = () => { instance.revert(); splits.delete(instance); };
    return { instance, revert };
  };

  // ---- Opening ----------------------------------------------------------------
  const playIntro = !location.hash && scrollY < 100
    && performance.getEntriesByType("navigation")[0]?.type !== "back_forward"
    && allowed();
  const hero = document.querySelector(".hero");
  const intro = document.querySelector(".recruiter-intro");

  const runIntro = () => {
    if (!allowed()) { releaseIntro(); return; }
    const role = hero.querySelector(".recruiter-role");
    const name = hero.querySelector("#identity .headline-line");
    const summary = hero.querySelector(".recruiter-summary");
    const description = hero.querySelector(".recruiter-description");
    const actions = hero.querySelector(".intro-actions");
    const practice = hero.querySelector(".intro-practice");
    const index = hero.querySelector(".collection-index");
    const nameSplit = split(name, "lines,chars");
    const summarySplit = split(summary, "lines");
    releaseIntro();

    const tl = gsap.timeline({
      defaults: { ease: "portfolio-out", duration: timing.reveal },
      onComplete: () => { nameSplit.revert(); summarySplit.revert(); gsap.set([role, description, actions.children, practice, index.children, ...practice.querySelectorAll(".practice-signal span, .recruiter-evidence, .intro-routes a"), ...document.querySelectorAll(".header .brand, #primary-nav")], { clearProps: "transform,opacity,filter" }); },
    });
    const step = timing.stagger;
    // Five ordered beats at 85ms intervals: role, name, summary, description, actions.
    tl.from(role, { y: 12, opacity: 0, filter: "blur(4px)", clearProps: "filter" }, 0);
    tl.from(nameSplit.instance.chars, { yPercent: 105, duration: timing.line, stagger: 0.018 }, step);
    tl.from(summarySplit.instance.lines, { yPercent: 105, duration: timing.line, stagger: 0.09 }, step * 2);
    tl.from(description, { y: 14, opacity: 0 }, step * 3);
    tl.from(actions.children, { y: 10, opacity: 0, stagger: 0.05 }, step * 4);
    tl.from(practice, { opacity: 0, duration: 0.8 }, 0.18);
    tl.from(practice.querySelectorAll(".practice-signal span"), { scaleY: 0.12, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.055 }, 0.24);
    tl.from(practice.querySelectorAll(".recruiter-evidence, .intro-routes a"), { y: 8, opacity: 0, stagger: 0.05 }, 0.32);
    tl.from(index.children, { y: 10, opacity: 0, stagger: 0.035 }, 0.42);
    tl.from(".header .brand, #primary-nav", { y: -8, opacity: 0, stagger: 0.06, duration: 0.5 }, 0);
    track(tl);
    // Record when each of the five beats actually starts on the timeline (read by the browser regression).
    const beats = [[role, "recruiter-role"], [nameSplit.instance.chars[0], "headline-line"], [summarySplit.instance.lines[0], "recruiter-summary"], [description, "recruiter-description"], [actions.children[0], "actions intro-actions"]];
    beats.forEach(([element, target]) => {
      const tween = tl.getChildren(false, true, false).find((child) => child.targets().includes(element));
      if (tween) log.push({ target, delay: Math.round(tween.startTime() * 1000) });
    });
  };

  if (playIntro && hero) {
    // Lines and characters must be split with the real face, not the fallback.
    const fonts = document.fonts?.ready || Promise.resolve();
    Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 450))]).then(runIntro);
  } else releaseIntro();

  // ---- Hero field (Three.js), desktop only and loaded lazily ------------------
  const fieldScript = document.currentScript && new URL("signal-field.js?v=20261103", document.currentScript.src).href;
  const wantsField = () => intro && fieldScript
    && matchMedia("(min-width: 1024px)").matches
    && !navigator.connection?.saveData
    && (navigator.deviceMemory ?? 8) >= 4
    && (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } })();
  const loadField = () => {
    if (!wantsField()) return;
    const host = document.createElement("div");
    host.className = "signal-field";
    host.setAttribute("aria-hidden", "true");
    intro.prepend(host);
    import(fieldScript)
      .then(({ mountSignalField }) => {
        const field = mountSignalField(host, { gsap, ScrollTrigger, reduced, intro: playIntro, surface: hero });
        if (!field) host.remove();
        window.portfolioMotion.field = field;
      })
      .catch(() => host.remove());
  };
  const idle = window.requestIdleCallback || ((callback) => setTimeout(callback, 200));
  if (document.readyState === "complete") idle(loadField, { timeout: 1200 });
  else window.addEventListener("load", () => idle(loadField, { timeout: 1200 }), { once: true });

  // ---- Scroll reveals: once, at the moment of entry ---------------------------
  const revealed = new WeakSet();
  const reveal = (element, order = 0, offset = 0) => {
    if (revealed.has(element)) return;
    revealed.add(element);
    if (!allowed()) return;
    const label = describe(element);
    const delay = offset + Math.min(order * 0.06, 0.24);

    if (element.matches(".partition-chart, .frontier")) {
      element.querySelectorAll(".draw-line, .privacy-fit").forEach((line) => {
        const length = line.hasAttribute("pathLength") ? Number(line.getAttribute("pathLength")) : line.getTotalLength();
        track(gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: timing.chart, ease: "portfolio-in-out", delay: delay + 0.1, clearProps: "strokeDasharray,strokeDashoffset" }), label);
      });
      const envelope = element.querySelectorAll(".privacy-bloom, .privacy-whisker, .intervals");
      if (envelope.length) track(gsap.from(envelope, { opacity: 0, duration: 0.5, delay: delay + 0.35, clearProps: "opacity" }));
      return;
    }
    if (element.matches(".signal-system, .token-flow, .method-rail, .semantic-chain, .simulation-branches, .order-flow")) {
      const items = element.matches(".signal-system") ? element.querySelectorAll(".system-node") : element.children;
      const stages = [...items].filter((item) => !item.matches(".evidence-inspector"));
      track(gsap.from(stages, { y: 12, opacity: 0, stagger: { each: timing.stagger, amount: Math.min(stages.length * timing.stagger, 0.34) }, delay, clearProps: "transform,opacity" }), label);
      return;
    }
    if (element.matches(".project-copy > h3, .section-heading h2, .semantic-lab h2, .contact h2")) {
      const { instance, revert } = split(element, "lines");
      track(gsap.from(instance.lines, { yPercent: 105, duration: timing.line, stagger: 0.08, delay, onComplete: revert }), label);
      return;
    }
    if (element.matches(".gameplay-shot")) {
      track(gsap.from(element, { clipPath: "inset(8% 6% 8% 6%)", duration: 1, ease: "portfolio-in-out", delay, clearProps: "clipPath" }), label);
      return;
    }
    const distance = element.matches(".project-copy > .tags") ? 10 : element.matches(".evidence-panel, .semantic-design") ? 14 : 16;
    const extra = element.matches(".project-copy > .tags") ? 0.12 : element.matches(".project-copy > p:not(.problem)") ? 0.07 : 0;
    track(gsap.from(element, { y: distance, opacity: 0, delay: delay + extra, clearProps: "transform,opacity" }), label);
  };

  const targets = [...document.querySelectorAll([
    ".project-copy > h3", ".project-copy > .problem", ".project-copy > .metrics", ".project-copy > .tags",
    ".project-copy > p:not(.problem):not(.evidence-note):not(.study-context)", ".project-grid > .evidence-panel",
    ".section-heading h2", ".section-heading > p", ".audio-lab > div > h3", ".semantic-lab h2", ".semantic-design",
    ".contact h2", ".contact-invitation", ".gameplay-shot",
    ".partition-chart", ".signal-system", ".token-flow", ".method-rail", ".semantic-chain", ".simulation-branches", ".order-flow",
  ].join(","))].filter((element) => !element.closest(".hero"));

  // Anything already above the fold on a restored or deep-linked view stays put.
  // On a fresh visit they join the opening, just after the hero's five beats.
  const inView = (element) => element.getBoundingClientRect().top < innerHeight - 36;
  const start = () => {
    targets.filter(inView).forEach((element, order) => {
      if (playIntro) reveal(element, order, 0.45);
      else revealed.add(element);
    });
    ScrollTrigger.batch(targets.filter((element) => !revealed.has(element)), {
      start: "top bottom-=36", once: true, interval: 0.08,
      onEnter: (batch) => batch.forEach((element, order) => reveal(element, order)),
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  // ---- Scroll-linked depth: one image, scrubbed, never on reduced motion ------
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (min-width: 761px)", () => {
    document.querySelectorAll(".gameplay-shot img").forEach((image) => {
      gsap.fromTo(image, { yPercent: -3, scale: 1.08 }, {
        yPercent: 3, scale: 1.08, ease: "none",
        scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: 0.5 },
      });
    });
  });

  // ---- Interaction feedback (<= 220ms) ----------------------------------------
  document.addEventListener("privacyselect", (event) => {
    if (!allowed()) return;
    const chart = event.target;
    const guide = chart.querySelector(".privacy-selection-guide");
    if (guide) track(gsap.fromTo(guide, { x: event.detail?.offsetX || 0 }, { x: 0, duration: timing.feedback, ease: "portfolio-in-out", clearProps: "transform" }));
    const dot = chart.querySelector(".is-selected .privacy-dot");
    if (dot) track(gsap.fromTo(dot, { strokeWidth: 6 }, { strokeWidth: 2, duration: timing.feedback, clearProps: "strokeWidth" }));
    const panel = chart.querySelector(".privacy-selection");
    if (panel) track(gsap.fromTo(panel, { backgroundColor: "#fbd4e7" }, { backgroundColor: "#fff0f6", duration: timing.feedback, clearProps: "backgroundColor" }));
  });
  document.addEventListener("evidenceinspect", (event) => {
    if (!allowed() || !event.detail?.target) return;
    track(gsap.fromTo(event.detail.target, { y: 4, opacity: 0.55 }, { y: 0, opacity: 1, duration: timing.feedback, clearProps: "transform,opacity" }));
  });
  // Origin-aware: the menu grows from the button that opened it. Closing is instant.
  document.addEventListener("portfolio:menu", (event) => {
    const nav = document.querySelector("#primary-nav");
    gsap.killTweensOf(nav);
    if (event.detail.open && allowed()) {
      track(gsap.fromTo(nav, { opacity: 0, y: -6, scale: 0.97, transformOrigin: "100% 0%" },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, clearProps: "all" }));
    } else gsap.set(nav, { clearProps: "all" });
  });

  // ---- Settling -----------------------------------------------------------------
  // A focused control and its ancestors must stop moving immediately.
  document.addEventListener("focusin", (event) => {
    for (let element = event.target; element && element !== document.body; element = element.parentElement) {
      gsap.getTweensOf(element).forEach((tween) => tween.progress(1));
    }
  });
  reduced.addEventListener("change", () => { if (reduced.matches) settleAll(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) settleAll(); });
  window.addEventListener("pagehide", settleAll);
  // Restored from the back/forward cache: layout may have changed while away.
  window.addEventListener("pageshow", (event) => { if (event.persisted) ScrollTrigger.refresh(); });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  // Disclosures change the page height; re-measure once their 240ms height animation ends.
  let refreshTimer = 0;
  document.addEventListener("toggle", () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300); }, true);
})();
