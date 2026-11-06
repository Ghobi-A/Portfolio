/* Optional GSAP entrances and feedback. Only the decorative hero field loops. */
(() => {
  "use strict";
  const root = document.documentElement;
  const { gsap, ScrollTrigger, SplitText, CustomEase } = window;
  if (!gsap || !ScrollTrigger || !SplitText || !CustomEase) {
    root.classList.remove("has-field");
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("portfolio-out", "0.23, 1, 0.32, 1");
  CustomEase.create("portfolio-in-out", "0.77, 0, 0.175, 1");
  gsap.defaults({ ease: "portfolio-out", duration: 0.5 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const timing = { feedback: 0.22, reveal: 0.5, line: 0.65, chart: 0.8, stagger: 0.085 };
  const log = [];
  window.portfolioMotion = { log, timing };

  // ---- Bookkeeping: everything finite, everything interruptible ---------------
  const running = new Set();
  const splits = new Set();
  const track = (tween, label) => {
    running.add(tween);
    if (label) log.push({ target: label, delay: Math.round(tween.delay() * 1000) });
    tween.then(() => running.delete(tween));
  };
  const settleAll = () => {
    running.forEach((tween) => tween.progress(1));
    running.clear();
    splits.forEach((split) => split.revert());
    splits.clear();
  };
  const scanScene = (element, delay) => {
    track(gsap.fromTo(element, { "--scene-scan": "-35%" }, {
      "--scene-scan": "132%",
      duration: 0.9,
      delay,
      ease: "portfolio-in-out",
      onComplete: () => element.style.removeProperty("--scene-scan"),
    }));
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

  const runIntro = () => {
    const role = hero.querySelector(".recruiter-role");
    const name = hero.querySelector("#identity .headline-line");
    const summary = hero.querySelector(".recruiter-summary");
    const description = hero.querySelector(".recruiter-description");
    const actions = hero.querySelector(".intro-actions");
    const practice = hero.querySelector(".intro-practice");
    const index = hero.querySelector(".collection-index");
    const nameSplit = split(name, "lines,chars");
    const summarySplit = split(summary, "lines");
    const bars = practice.querySelectorAll(".practice-signal span");

    const tl = gsap.timeline({
      defaults: { ease: "portfolio-out", duration: timing.reveal },
      onComplete: () => { nameSplit.revert(); summarySplit.revert(); },
    });
    const step = timing.stagger;
    const lift = { y: 10, opacity: 0.8, clearProps: "transform,opacity" };
    tl.from(role, lift, 0);
    tl.from(nameSplit.instance.chars, { yPercent: 58, opacity: 0.72, duration: timing.line, stagger: 0.016 }, step);
    tl.from(summarySplit.instance.lines, { yPercent: 45, opacity: 0.78, duration: timing.line, stagger: 0.08 }, step * 2);
    tl.from(description, lift, step * 3);
    tl.from(actions.children, { ...lift, stagger: 0.04 }, step * 4);
    tl.from(practice, { opacity: 0.8, clearProps: "opacity" }, 0.18);
    tl.from(bars, { scaleY: 0.35, duration: 0.65, stagger: 0.05, clearProps: "transform" }, 0.24);
    tl.from(index.children, { opacity: 0.75, stagger: 0.03, clearProps: "opacity" }, 0.36);
    track(tl);
    // Record when each of the five beats actually starts on the timeline (read by the browser regression).
    const beats = [[role, "recruiter-role"], [nameSplit.instance.chars[0], "headline-line"], [summarySplit.instance.lines[0], "recruiter-summary"], [description, "recruiter-description"], [actions.children[0], "actions intro-actions"]];
    beats.forEach(([element, target]) => {
      const tween = tl.getChildren(false, true, false).find((child) => child.targets().includes(element));
      if (tween) log.push({ target, delay: Math.round(tween.startTime() * 1000) });
    });
  };

  if (playIntro && hero) runIntro();

  // Preview the native project links in the decorative field frame.
  const bindSceneSelector = (frame, signal) => {
    const caption = frame.querySelector(".signal-frame-caption");
    const defaultCaption = caption.textContent;
    let hovered = null;
    let focused = null;
    let transition;
    const preview = () => {
      const label = (hovered || focused)?.textContent.trim() || defaultCaption;
      if (caption.textContent === label) return;
      transition?.progress(1);
      caption.textContent = label;
      if (!allowed()) return;
      transition = gsap.fromTo(caption, { y: 5, opacity: 0.6 }, {
        y: 0, opacity: 1, duration: timing.feedback, clearProps: "transform,opacity",
      });
      track(transition);
    };
    hero.querySelectorAll(".collection-index a").forEach((link) => {
      link.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        hovered = link;
        preview();
      }, { signal });
      link.addEventListener("pointerleave", () => {
        if (hovered !== link) return;
        hovered = null;
        preview();
      }, { signal });
      link.addEventListener("focus", () => { focused = link; preview(); }, { signal });
      link.addEventListener("blur", () => { focused = null; preview(); }, { signal });
    });
  };

  // ---- Hero field (Three.js), loaded lazily ----------------------------------
  // The host is authored in the page; the head script adds .has-field only when
  // WebGL2 is available and Save-Data is off, so its space is reserved before paint.
  const fieldScript = document.currentScript && new URL("signal-field.js?v=20261105", document.currentScript.src).href;
  const fieldHost = document.querySelector(".signal-field");
  const loadField = () => {
    if (!fieldHost || !fieldScript || !root.classList.contains("has-field")) return;
    const selectorEvents = new AbortController();
    const hideField = () => {
      selectorEvents.abort();
      root.classList.remove("has-field");
      fieldHost.remove();
      ScrollTrigger.refresh();
    };
    fieldHost.addEventListener("webglcontextlost", hideField, { capture: true, once: true });
    import(fieldScript)
      .then(({ mountSignalField }) => {
        const field = mountSignalField(fieldHost, {
          gsap, ScrollTrigger, reduced, intro: playIntro && scrollY < 100,
          surface: hero, compact: innerWidth < 1200,
        });
        window.portfolioMotion.field = field;
        if (!field) { hideField(); return; }
        const frame = fieldHost.querySelector(".signal-frame");
        bindSceneSelector(frame, selectorEvents.signal);
        if (playIntro && scrollY < 100 && allowed()) scanScene(frame, 0.2);
      })
      .catch(hideField);
  };
  const idle = window.requestIdleCallback || ((callback) => setTimeout(callback, 200));
  if (document.readyState === "complete") idle(loadField, { timeout: 800 });
  else window.addEventListener("load", () => idle(loadField, { timeout: 800 }), { once: true });

  // ---- Scroll reveals: once, at the moment of entry ---------------------------
  const revealed = new WeakSet();
  const reveal = (element, order = 0, offset = 0) => {
    if (revealed.has(element)) return;
    revealed.add(element);
    if (!allowed()) return;
    const label = describe(element);
    const delay = offset + Math.min(order * 0.06, 0.24);

    if (element.matches(".project-grid > .evidence-panel")) {
      scanScene(element, delay);
      if (!element.matches(".frontier")) return;
    }
    if (element.matches(".project-copy > h3, .audio-lab > div > h3, .semantic-lab h2")) {
      const { instance, revert } = split(element, "lines");
      track(gsap.from(instance.lines, {
        yPercent: 58, opacity: 0.74, delay, duration: timing.line, stagger: 0.07, onComplete: revert,
      }), label);
      return;
    }
    if (element.matches(".partition-chart, .frontier")) {
      element.querySelectorAll(".draw-line, .privacy-fit").forEach((line) => {
        const length = line.hasAttribute("pathLength") ? Number(line.getAttribute("pathLength")) : line.getTotalLength();
        track(gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: timing.chart, ease: "portfolio-in-out", delay: delay + 0.1, clearProps: "strokeDasharray,strokeDashoffset" }), label);
      });
      return;
    }
    if (element.matches(".signal-system, .token-flow, .method-rail, .semantic-chain, .simulation-branches, .order-flow")) {
      const items = element.matches(".signal-system") ? element.querySelectorAll(".system-node") : element.children;
      const stages = [...items].filter((item) => !item.matches(".evidence-inspector"));
      track(gsap.from(stages, { y: 8, opacity: 0.78, stagger: { amount: 0.26 }, delay, clearProps: "transform,opacity" }), label);
      return;
    }
    track(gsap.from(element, { y: 8, opacity: 0.8, delay, clearProps: "transform,opacity" }), label);
  };

  const targets = [...document.querySelectorAll([
    ".project-copy > h3", ".project-copy > .problem", ".project-copy > .metrics", ".project-copy > .tags",
    ".project-copy > p:not(.problem):not(.evidence-note):not(.study-context)",
    ".section-heading h2", ".section-heading > p", ".audio-lab > div > h3", ".semantic-lab h2", ".semantic-design",
    ".contact h2", ".contact-invitation",
    ".project-grid > .evidence-panel", ".partition-chart", ".signal-system", ".token-flow", ".method-rail", ".semantic-chain", ".simulation-branches", ".order-flow",
  ].join(","))].filter((element) => !element.closest(".hero"));

  // Anything already above the fold on a restored or deep-linked view stays put.
  // On a fresh visit they join the opening, just after the hero's five beats.
  const inView = (element) => {
    const { top, bottom } = element.getBoundingClientRect();
    return bottom > 0 && top < innerHeight - 36;
  };
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

  // ---- Pointer spotlight on evidence panels (fine pointers only) --------------
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let spotFrame = 0;
    let spotEvent = null;
    document.addEventListener("pointermove", (event) => {
      if (!allowed()) return;
      spotEvent = event;
      if (spotFrame) return;
      spotFrame = requestAnimationFrame(() => {
        spotFrame = 0;
        const panel = spotEvent.target.closest?.(".evidence-panel");
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        panel.style.setProperty("--spot-x", `${spotEvent.clientX - rect.left}px`);
        panel.style.setProperty("--spot-y", `${spotEvent.clientY - rect.top}px`);
      });
    }, { passive: true });
  }

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
      gsap.getTweensOf(element).forEach((tween) => { if (!tween.scrollTrigger && !tween.vars.repeat) tween.progress(1); });
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
