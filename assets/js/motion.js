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

  // ---- Hero field (Three.js), loaded lazily ----------------------------------
  // The host is authored in the page; the head script adds .has-field only when
  // WebGL2 is available and Save-Data is off, so its space is reserved before paint.
  const fieldScript = document.currentScript && new URL("signal-field.js?v=20261105", document.currentScript.src).href;
  const fieldHost = document.querySelector(".signal-field");
  const loadField = () => {
    if (!fieldHost || !fieldScript || !root.classList.contains("has-field")) return;
    import(fieldScript)
      .then(({ mountSignalField }) => {
        const field = mountSignalField(fieldHost, { gsap, ScrollTrigger, reduced, intro: playIntro, surface: hero, compact: innerWidth < 1024 });
        if (!field) { fieldHost.remove(); root.classList.remove("has-field"); }
        window.portfolioMotion.field = field;
      })
      .catch(() => { fieldHost.remove(); root.classList.remove("has-field"); });
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

    if (element.matches(".partition-chart, .frontier")) {
      element.querySelectorAll(".draw-line, .privacy-fit").forEach((line) => {
        const length = line.hasAttribute("pathLength") ? Number(line.getAttribute("pathLength")) : line.getTotalLength();
        track(gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: timing.chart, ease: "portfolio-in-out", delay: delay + 0.1, clearProps: "strokeDasharray,strokeDashoffset" }), label);
      });
      const envelope = element.querySelectorAll(".privacy-bloom, .intervals");
      if (envelope.length) track(gsap.from(envelope, { opacity: 0, duration: 0.6, delay: delay + 0.35, clearProps: "opacity" }));
      // Measured points arrive in order once their guide has passed them. Positions never change.
      const marks = element.querySelectorAll(".privacy-measure, .partition-marker, .signal-point > circle");
      if (marks.length) track(gsap.from(marks, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%", duration: 0.55, ease: "back.out(2)", stagger: 0.14, delay: delay + 0.3, clearProps: "opacity,transform" }));
      const whiskers = element.querySelectorAll(".privacy-whisker, .privacy-interval-wash");
      if (whiskers.length) track(gsap.from(whiskers, { scaleY: 0, transformOrigin: "50% 50%", duration: 0.6, stagger: 0.07, delay: delay + 0.45, clearProps: "transform" }));
      return;
    }
    if (element.matches(".project-copy > .metrics")) {
      // Each exact figure rises into place behind a mask. Figures never count up.
      const figures = [...element.querySelectorAll("dd")];
      const splits = figures.map((figure) => split(figure, "lines"));
      track(gsap.from(splits.flatMap(({ instance }) => instance.lines), {
        yPercent: 110, duration: 0.8, stagger: 0.12, delay,
        onComplete: () => splits.forEach(({ revert }) => revert()),
      }), label);
      track(gsap.from(element.querySelectorAll("dt"), { opacity: 0, y: 8, stagger: 0.12, delay: delay + 0.2, clearProps: "opacity,transform" }));
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
    // Panels already travel with the scroll (see below), so they only fade in here.
    if (element.matches(".project-grid > .evidence-panel, .project-copy > .tags") && !reduced.matches) {
      track(gsap.from(element, { opacity: 0, duration: 0.7, delay, clearProps: "opacity" }), label);
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

  // ---- Scroll-driven depth: scrubbed, reversible, never on reduced motion -----
  // These follow the scroll position rather than playing once. Values never change.
  const motion = gsap.matchMedia();
  motion.add({
    wide: "(prefers-reduced-motion: no-preference) and (min-width: 761px)",
    narrow: "(prefers-reduced-motion: no-preference) and (max-width: 760px)",
  }, ({ conditions }) => {
    const depth = conditions.wide ? 1 : 0.45;
    const scrub = (target, from, to, trigger, start, end, amount = 0.6) =>
      gsap.fromTo(target, from, { ...to, ease: "none", scrollTrigger: { trigger, start, end, scrub: amount } });

    // Hero exit: the introduction lifts away and dims as the work arrives.
    const copy = hero.querySelector(".intro-copy");
    const practice = hero.querySelector(".intro-practice");
    if (copy) scrub(copy, { y: 0, opacity: 1 }, { y: -110 * depth, opacity: 0.25 }, hero, "top top", "bottom top", 0.4);
    if (practice && conditions.wide) scrub(practice, { y: 0 }, { y: -50 }, hero, "top top", "bottom top", 0.4);

    // Evidence panels rise and settle as they enter, then drift on with the page.
    document.querySelectorAll(".project-grid > .evidence-panel").forEach((panel) => {
      scrub(panel, { y: 140 * depth, scale: 0.94, transformOrigin: "50% 0%" }, { y: 0, scale: 1 }, panel, "top bottom", "top 55%", 0.7);
    });
    // Project titles sweep in from the left across the lower half of the screen.
    document.querySelectorAll(".project-copy > h3").forEach((title) => {
      scrub(title, { x: -120 * depth }, { x: 0 }, title, "top bottom", "top 50%", 0.6);
    });
    // Wide: section headings sweep from the right so the page alternates. Phones: from the left.
    document.querySelectorAll(".section-heading h2, .semantic-lab h2").forEach((heading) => {
      scrub(heading, { x: conditions.wide ? 120 : -40 }, { x: 0 }, heading, "top bottom", "top 50%", 0.6);
    });
    // Figures and tags lift a little later than their title.
    document.querySelectorAll(".project-copy > .metrics, .project-copy > .tags").forEach((block) => {
      scrub(block, { y: 50 * depth }, { y: 0 }, block, "top bottom", "top 60%", 0.6);
    });
    // The closing invitation grows into place.
    document.querySelectorAll(".contact h2").forEach((heading) => {
      scrub(heading, { scale: 0.75, transformOrigin: "0% 100%" }, { scale: 1 }, heading, "top bottom", "top 50%", 0.6);
    });
    // Imagery: a deep parallax inside its frame, and a slight turn for the paper study.
    document.querySelectorAll(".gameplay-shot img").forEach((image) => {
      scrub(image, { yPercent: -9 * depth, scale: 1.18 }, { yPercent: 9 * depth, scale: 1.18 }, image.parentElement, "top bottom", "bottom top", 0.5);
    });
    document.querySelectorAll(".paper-study img").forEach((image) => {
      scrub(image, { y: 60 * depth, rotate: -4 }, { y: -60 * depth, rotate: 4 }, image.parentElement, "top bottom", "bottom top", 0.5);
    });

    // The practice bars run like a live meter while the opening is on screen.
    const bars = [...document.querySelectorAll(".practice-signal span")];
    gsap.set(bars, { transformOrigin: "50% 100%" });
    const meter = gsap.timeline({ paused: true });
    bars.forEach((bar, index) => {
      meter.to(bar, { scaleY: 0.45 + ((index * 37) % 10) / 12, duration: 0.7 + (index % 3) * 0.25, ease: "sine.inOut", repeat: -1, yoyo: true }, index * 0.09);
    });
    ScrollTrigger.create({ trigger: hero, start: "top bottom", end: "bottom top", onToggle: (self) => (self.isActive ? meter.play() : meter.pause()) });
    // Fast scrolling drives the meter harder for a moment.
    let energyTimer = 0;
    ScrollTrigger.create({
      trigger: document.body, start: 0, end: "max",
      onUpdate: (self) => {
        meter.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 800, 3));
        clearTimeout(energyTimer);
        energyTimer = setTimeout(() => gsap.to(meter, { timeScale: 1, duration: 0.6 }), 120);
      },
    });

    // Skills marquee: two rows drift in opposite directions and answer the scroll.
    const rows = [...document.querySelectorAll(".marquee-track")].map((track, index) => {
      track.append(...[...track.children].map((child) => child.cloneNode(true)));
      return gsap.fromTo(track, { xPercent: index % 2 ? -50 : 0 }, { xPercent: index % 2 ? 0 : -50, duration: 38 + index * 8, ease: "none", repeat: -1 });
    });
    let direction = 1;
    const marquee = document.querySelector(".signal-marquee");
    if (marquee && rows.length) {
      ScrollTrigger.create({ trigger: marquee, start: "top bottom", end: "bottom top", onToggle: (self) => rows.forEach((row) => (self.isActive ? row.play() : row.pause())) });
      ScrollTrigger.create({
        trigger: document.body, start: 0, end: "max",
        onUpdate: (self) => {
          if (self.direction !== direction) direction = self.direction;
          const speed = direction * (1 + Math.min(Math.abs(self.getVelocity()) / 300, 6));
          rows.forEach((row) => gsap.to(row, { timeScale: speed, duration: 0.25, overwrite: true }));
          clearTimeout(marquee.settle);
          marquee.settle = setTimeout(() => rows.forEach((row) => gsap.to(row, { timeScale: direction, duration: 1.1, overwrite: true })), 140);
        },
      });
    }

    // Magnetic actions: primary buttons lean toward a fine pointer.
    const cleanups = [];
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll(".button, .intro-contact").forEach((button) => {
        const toX = gsap.quickTo(button, "x", { duration: 0.45, ease: "power3.out" });
        const toY = gsap.quickTo(button, "y", { duration: 0.45, ease: "power3.out" });
        const move = (event) => {
          const rect = button.getBoundingClientRect();
          toX((event.clientX - rect.left - rect.width / 2) * 0.28);
          toY((event.clientY - rect.top - rect.height / 2) * 0.4);
        };
        const leave = () => { toX(0); toY(0); };
        button.addEventListener("pointermove", move);
        button.addEventListener("pointerleave", leave);
        cleanups.push(() => { button.removeEventListener("pointermove", move); button.removeEventListener("pointerleave", leave); gsap.set(button, { clearProps: "transform" }); });
      });
    }
    return () => {
      clearTimeout(energyTimer);
      clearTimeout(marquee?.settle);
      cleanups.forEach((cleanup) => cleanup());
      document.querySelectorAll(".marquee-track").forEach((track) => track.replaceChildren(...[...track.children].slice(0, track.children.length / 2)));
      gsap.set([...bars, copy, practice].filter(Boolean), { clearProps: "transform,opacity" });
    };
  });

  // ---- Pointer spotlight on evidence panels (fine pointers only) --------------
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let spotFrame = 0;
    let spotEvent = null;
    document.addEventListener("pointermove", (event) => {
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
