/* Motion layer for the Interactive Lab homepage.
 *
 * GSAP + ScrollTrigger + SplitText choreograph the page, Lenis smooths the
 * scroll, and the Three.js sculpture (lab-scene.js) is imported lazily after
 * first paint. Everything here is optional: content is complete and visible
 * without it, and reduced motion reverts every effect through gsap.matchMedia.
 *
 * Rules carried over from DESIGN.md: final states live in CSS, figures never
 * count up (no invented intermediate values), focus settles moving ancestors.
 */
(() => {
  "use strict";
  const root = document.documentElement;
  const { gsap, ScrollTrigger, SplitText, CustomEase, Lenis } = window;
  if (!gsap || !ScrollTrigger || !SplitText || !CustomEase) {
    root.classList.remove("has-field");
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("lab-out", "0.23, 1, 0.32, 1");
  CustomEase.create("lab-in-out", "0.77, 0, 0.175, 1");
  CustomEase.create("lab-expo", "0.16, 1, 0.3, 1");
  gsap.defaults({ ease: "lab-out", duration: 0.7 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const allowed = () => !reduced.matches && !document.hidden;
  const log = [];
  window.portfolioMotion = { log };

  const stage = document.querySelector("[data-lab]");
  const playIntro = !location.hash && scrollY < 100
    && performance.getEntriesByType("navigation")[0]?.type !== "back_forward"
    && allowed();

  // ---- Smooth scrolling (Lenis on GSAP's ticker) ---------------------------------
  let lenis = null;
  const startLenis = () => {
    if (!Lenis || lenis || reduced.matches) return;
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    window.portfolioMotion.lenis = lenis;
  };
  const stopLenis = () => {
    if (!lenis) return;
    gsap.ticker.remove(raf);
    lenis.destroy();
    lenis = null;
    window.portfolioMotion.lenis = null;
  };
  function raf(time) { lenis?.raf(time * 1000); }
  startLenis();
  reduced.addEventListener("change", () => (reduced.matches ? stopLenis() : startLenis()));
  // In-page links glide; case-study links (native <details>) keep main.js's open-and-jump.
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!lenis || !link || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return; }
    if (!target || target.matches("details")) return;
    event.preventDefault();
    history.pushState(null, "", link.hash);
    const offset = target.id === "top" ? 0 : -(document.querySelector(".header")?.offsetHeight || 64) - 56;
    lenis.scrollTo(target.id === "top" ? 0 : target, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  });
  // Disclosures and deep links change the page height under Lenis.
  document.addEventListener("toggle", () => { lenis?.resize(); }, true);

  // ---- Helpers ----------------------------------------------------------------
  const splits = new Set();
  const split = (element, type, options = {}) => {
    const instance = SplitText.create(element, {
      type, aria: "auto", autoSplit: false,
      mask: type.includes("chars") ? "lines" : type.includes("words") ? "words" : "lines",
      linesClass: "split-line", wordsClass: "split-word", charsClass: "split-char",
      ...options,
    });
    splits.add(instance);
    return instance;
  };
  const revert = (instance) => { instance.revert(); splits.delete(instance); };

  // ---- Opening ----------------------------------------------------------------
  const runIntro = () => {
    const meta = stage.querySelectorAll(".hero-meta p");
    const names = stage.querySelectorAll(".name-line");
    const thesis = stage.querySelector(".stage-thesis");
    const nameSplits = [...names].map((line) => split(line, "chars"));
    const thesisSplit = split(thesis, "words");
    const tl = gsap.timeline({ onComplete: () => { nameSplits.forEach(revert); revert(thesisSplit); } });
    tl.from(meta, { y: 12, opacity: 0, duration: 0.6, stagger: 0.06, clearProps: "all" }, 0)
      .from(nameSplits[0].chars, { yPercent: 105, duration: 1.15, ease: "lab-expo", stagger: 0.035 }, 0.15)
      .from(nameSplits[1].chars, { yPercent: 105, duration: 1.15, ease: "lab-expo", stagger: { each: 0.035, from: "end" } }, 0.3)
      .from(stage.querySelectorAll(".hero-thesis .spec-line, .hero-thesis .verbs em"), { y: 14, opacity: 0, stagger: 0.06, clearProps: "all" }, 0.75)
      .from(thesisSplit.words, { yPercent: 100, duration: 0.8, ease: "lab-expo", stagger: 0.03 }, 0.85)
      .from(stage.querySelectorAll(".stage-description, .intro-actions > a"), { y: 16, opacity: 0, stagger: 0.06, clearProps: "all" }, 1.05)
      .from(stage.querySelector(".instrument"), { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "lab-expo", clearProps: "clipPath" }, 0.7)
      .from(stage.querySelector(".lab"), { y: 40, opacity: 0, duration: 1, ease: "lab-expo", clearProps: "all" }, 0.9);
    log.push({ target: "intro", duration: Math.round(tl.duration() * 1000) });
  };
  if (playIntro && stage) runIntro();

  // ---- Sculpture (Three.js), loaded lazily ---------------------------------------
  // The head script adds .has-field only when WebGL2 is available and Save-Data is off.
  const fieldScript = document.currentScript && new URL("lab-scene.js?v=20261123-lab", document.currentScript.src).href;
  const host = document.querySelector(".lab-scene");
  let scene = null;
  const applyState = () => {
    if (!scene || !stage) return;
    const data = stage.dataset;
    scene.setMode(data.mode || "research");
    if (data.noise) scene.setNoise(Number(data.noise));
    scene.setRanked(data.order !== "random");
    scene.setStep(Number(data.step || 0));
  };
  const loadField = () => {
    if (!host || !fieldScript || !root.classList.contains("has-field")) return;
    const hideField = () => { scene?.dispose(); scene = null; root.classList.remove("has-field"); };
    host.addEventListener("webglcontextlost", hideField, { capture: true, once: true });
    import(fieldScript)
      .then(({ mountLabScene }) => {
        scene = mountLabScene(host, { gsap, reduced, compact: innerWidth < 900 || (navigator.hardwareConcurrency || 8) <= 4 });
        window.portfolioMotion.scene = scene;
        if (!scene) return hideField();
        applyState();
      })
      .catch(hideField);
  };
  const idle = window.requestIdleCallback || ((callback) => setTimeout(callback, 200));
  if (document.readyState === "complete") idle(loadField, { timeout: 800 });
  else window.addEventListener("load", () => idle(loadField, { timeout: 800 }), { once: true });

  // ---- The bench: mode changes, selections ----------------------------------------
  document.addEventListener("labchange", (event) => {
    const { kind, panel, target } = event.detail || {};
    if (scene) {
      if (kind === "mode") scene.setMode(event.detail.mode);
      if (kind === "epsilon") scene.setNoise(event.detail.noise);
      if (kind === "order") scene.setRanked(event.detail.ranked);
      if (kind === "step") scene.setStep(event.detail.step);
    }
    if (!allowed()) return;
    if (kind === "mode" && panel) {
      gsap.fromTo(panel.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.045, overwrite: true, clearProps: "all" });
      const count = stage.querySelector("[data-lab-count]");
      if (count) gsap.fromTo(count, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, clearProps: "all" });
    }
    if (kind === "epsilon") {
      const value = stage.querySelector("[data-lab-auc]");
      gsap.fromTo(value, { yPercent: 35, opacity: 0.2 }, { yPercent: 0, opacity: 1, duration: 0.45, clearProps: "all" });
    }
    if (kind === "step" && target) gsap.fromTo(target, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, clearProps: "all" });
  });

  // ---- Scroll choreography ----------------------------------------------------------
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const once = { start: "top 86%", once: true };

    // The name's two lines drift apart as the work arrives.
    if (stage) {
      const [first, second] = stage.querySelectorAll(".name-line");
      const drift = { trigger: stage, start: "top top", end: "bottom top", scrub: true };
      gsap.to(first, { xPercent: -8, ease: "none", scrollTrigger: drift });
      gsap.to(second, { xPercent: 6, ease: "none", scrollTrigger: drift });
    }
    // The giant section word slides across as you read past it.
    gsap.utils.toArray(".giant").forEach((word) => {
      gsap.fromTo(word, { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: word, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // LABEL ——— LABEL: the rule draws once its line arrives.
    root.classList.add("js-rules");
    gsap.utils.toArray(".spec-line").forEach((line) => {
      ScrollTrigger.create({ trigger: line, start: "top 90%", once: true, onEnter: () => line.classList.add("is-drawn") });
    });
    // Verbs step in one after another.
    gsap.utils.toArray(".verbs").forEach((row) => {
      gsap.from(row.children, { y: 18, opacity: 0, duration: 0.6, stagger: 0.09, clearProps: "all", scrollTrigger: { trigger: row, start: "top 90%", once: true } });
    });

    // Headings reveal word by word from behind a mask.
    gsap.utils.toArray(".section-heading h2, .project-copy > h3, .audio-lab h3, .semantic-lab h2, .about h2, .research-question").forEach((heading) => {
      const instance = split(heading, "words");
      gsap.from(instance.words, {
        yPercent: 110, duration: 1, ease: "lab-expo", stagger: 0.06,
        scrollTrigger: { trigger: heading, ...once },
        onComplete: () => revert(instance),
      });
    });

    // Project numbers rise into place.
    gsap.utils.toArray(".project-number").forEach((number) => {
      gsap.from(number, { yPercent: 70, opacity: 0, duration: 1.1, ease: "lab-expo", scrollTrigger: { trigger: number, ...once } });
    });

    // Supporting copy fades and lifts, staggered within each block.
    gsap.utils.toArray(".project-copy, .audio-lab > div:first-child, .about-copy, .semantic-design, .contact-invitation").forEach((block) => {
      const items = [...block.querySelectorAll(":scope > p, :scope > .metrics, :scope > .tags, :scope > .text-links, :scope > .actions, :scope > .education, :scope > .source-link, :scope > dl, :scope > ol, :scope > h3, :scope > h4, :scope > .semantic-legend")]
        .filter((item) => !item.matches(".verbs") && (!item.matches("h3") || !block.matches(".project-copy")));
      if (!items.length) return;
      gsap.from(items, { y: 28, opacity: 0, duration: 0.9, stagger: 0.07, clearProps: "transform,opacity", scrollTrigger: { trigger: block, start: "top 82%", once: true } });
    });

    // Scroll-linked reading: words brighten as the paragraph passes through view.
    gsap.utils.toArray(".work-intro > p:last-child, .about-copy > p:first-of-type, .contact-question").forEach((paragraph) => {
      const instance = split(paragraph, "words", { mask: false });
      gsap.fromTo(instance.words, { opacity: 0.18 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: paragraph, start: "top 88%", end: "bottom 55%", scrub: true },
      });
    });

    // Evidence panels rise into place and settle while their story stays sticky.
    gsap.utils.toArray(".project-grid > .evidence-panel, .research-sidebar, .audio-scope").forEach((panel) => {
      gsap.from(panel, {
        y: 90, scale: 0.96, opacity: 0.4, ease: "none", transformOrigin: "50% 0%",
        scrollTrigger: { trigger: panel, start: "top bottom", end: "top 62%", scrub: 0.6 },
      });
    });

    // Images expand from an inset frame and settle their zoom.
    gsap.utils.toArray(".gameplay-shot, .paper-study, .evidence-panel > a > img").forEach((frame) => {
      const image = frame.matches("img") ? frame : frame.querySelector("img");
      gsap.fromTo(frame, { clipPath: "inset(14% 10% 14% 10% round 18px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 10px)", ease: "none",
        scrollTrigger: { trigger: frame, start: "top 95%", end: "top 45%", scrub: 0.5 },
      });
      if (image && image !== frame) {
        gsap.fromTo(image, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
      }
    });

    // Measured bars grow from zero once (the printed value never changes).
    gsap.utils.toArray(".bar-track i").forEach((bar, index) => {
      gsap.from(bar, { scaleX: 0, duration: 1.1, ease: "lab-expo", delay: (index % 2) * 0.12, scrollTrigger: { trigger: bar, start: "top 90%", once: true } });
    });

    // Chart guides draw; their measured points stay where they are.
    gsap.utils.toArray(".partition-chart .draw-line").forEach((line) => {
      gsap.fromTo(line, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "lab-in-out", scrollTrigger: { trigger: line, start: "top 85%", once: true }, clearProps: "strokeDasharray,strokeDashoffset" });
    });
    gsap.utils.toArray(".frontier").forEach((figure) => {
      ScrollTrigger.create({
        trigger: figure, start: "top 80%", once: true,
        onEnter: () => {
          const fit = figure.querySelector(".privacy-fit");
          if (!fit) return;
          const length = fit.getTotalLength();
          gsap.fromTo(fit, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.2, ease: "lab-in-out", clearProps: "strokeDasharray,strokeDashoffset" });
          gsap.from(figure.querySelectorAll(".privacy-measure"), { opacity: 0, y: 10, stagger: 0.18, delay: 0.35, duration: 0.5, clearProps: "all" });
        },
      });
    });

    // Headline figures rise behind their own mask.
    gsap.utils.toArray(".metrics dd, .panel-metrics dd").forEach((figure) => {
      gsap.from(figure, { yPercent: 60, opacity: 0, duration: 0.9, ease: "lab-expo", scrollTrigger: { trigger: figure, start: "top 92%", once: true }, clearProps: "all" });
    });

    // Ordered diagrams play in reading order.
    gsap.utils.toArray(".signal-system, .order-flow, .method-rail, .semantic-chain, .simulation-branches, .token-flow, .audit-grid").forEach((diagram) => {
      const items = diagram.matches(".signal-system") ? diagram.querySelectorAll(".system-node, .flow-line, .split-rail") : diagram.children;
      gsap.from([...items].filter((item) => !item.matches(".evidence-inspector")), {
        y: 16, opacity: 0, duration: 0.6, stagger: 0.07, clearProps: "transform,opacity",
        scrollTrigger: { trigger: diagram, start: "top 85%", once: true },
      });
    });

    // The fuchsia band opens from a slit as it scrolls in.
    gsap.utils.toArray(".capabilities").forEach((band) => {
      gsap.fromTo(band, { clipPath: "inset(18% 6% 18% 6%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: band, start: "top bottom", end: "top 30%", scrub: true },
      });
    });
    gsap.utils.toArray(".capability-grid a").forEach((card, index) => {
      gsap.from(card, { y: 50, opacity: 0, duration: 0.9, delay: index * 0.08, clearProps: "transform,opacity", scrollTrigger: { trigger: ".capability-grid", start: "top 85%", once: true } });
    });

    // The contact line arrives letter by letter.
    const contact = document.querySelector(".contact h2");
    if (contact) {
      const instance = split(contact, "chars");
      gsap.from(instance.chars, {
        yPercent: 110, rotate: 6, duration: 1.1, ease: "lab-expo", stagger: 0.035,
        scrollTrigger: { trigger: contact, start: "top 85%", once: true },
        onComplete: () => revert(instance),
      });
    }

    // Skill tags drift in one after another.
    gsap.utils.toArray(".tags").forEach((list) => {
      gsap.from(list.children, { x: -10, opacity: 0, duration: 0.5, stagger: 0.04, clearProps: "all", scrollTrigger: { trigger: list, start: "top 92%", once: true } });
    });

    return () => { splits.forEach((instance) => instance.revert()); splits.clear(); };
  });

  // ---- Magnetic actions and panel spotlight (fine pointers only) --------------------
  mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
    const magnets = gsap.utils.toArray(".button, .case-symbol, .panel-link, .plus-link, .nav-contact");
    const handlers = magnets.map((element) => {
      const xTo = gsap.quickTo(element, "x", { duration: 0.5, ease: "lab-out" });
      const yTo = gsap.quickTo(element, "y", { duration: 0.5, ease: "lab-out" });
      const move = (event) => {
        const rect = element.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * 0.25);
        yTo((event.clientY - rect.top - rect.height / 2) * 0.35);
      };
      const leave = () => { xTo(0); yTo(0); };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", leave);
      return () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave); gsap.set(element, { clearProps: "x,y" }); };
    });

    let frame = 0;
    let last = null;
    const spotlight = (event) => {
      last = event;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const panel = last.target.closest?.(".evidence-panel");
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        panel.style.setProperty("--spot-x", `${last.clientX - rect.left}px`);
        panel.style.setProperty("--spot-y", `${last.clientY - rect.top}px`);
      });
    };
    document.addEventListener("pointermove", spotlight, { passive: true });
    return () => { handlers.forEach((dispose) => dispose()); document.removeEventListener("pointermove", spotlight); };
  });

  // ---- Interaction feedback (<= 220ms) ---------------------------------------------
  document.addEventListener("privacyselect", (event) => {
    if (!allowed()) return;
    const chart = event.target;
    const guide = chart.querySelector(".privacy-selection-guide");
    if (guide) gsap.fromTo(guide, { x: event.detail?.offsetX || 0 }, { x: 0, duration: 0.22, ease: "lab-in-out", clearProps: "transform" });
    const dot = chart.querySelector(".is-selected .privacy-dot");
    if (dot) gsap.fromTo(dot, { strokeWidth: 6 }, { strokeWidth: 2, duration: 0.22, clearProps: "strokeWidth" });
  });
  document.addEventListener("evidenceinspect", (event) => {
    if (!allowed() || !event.detail?.target) return;
    gsap.fromTo(event.detail.target, { y: 4, opacity: 0.55 }, { y: 0, opacity: 1, duration: 0.22, clearProps: "transform,opacity" });
  });
  document.addEventListener("portfolio:menu", (event) => {
    const nav = document.querySelector("#primary-nav");
    gsap.killTweensOf(nav);
    if (event.detail.open && allowed()) {
      gsap.fromTo(nav, { opacity: 0, y: -6, scale: 0.97, transformOrigin: "100% 0%" }, { opacity: 1, y: 0, scale: 1, duration: 0.2, clearProps: "all" });
    } else gsap.set(nav, { clearProps: "all" });
  });

  // ---- Settling ----------------------------------------------------------------------
  const settle = () => {
    gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => {
      if (!tween.scrollTrigger || tween.scrollTrigger.vars.once) tween.progress(1);
    });
  };
  // A focused control and its ancestors stop moving at once.
  document.addEventListener("focusin", (event) => {
    for (let element = event.target; element && element !== document.body; element = element.parentElement) {
      gsap.getTweensOf(element).forEach((tween) => { if (!tween.scrollTrigger?.vars.scrub) tween.progress(1); });
    }
  });
  reduced.addEventListener("change", () => { if (reduced.matches) settle(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) settle(); });
  window.addEventListener("pageshow", (event) => { if (event.persisted) ScrollTrigger.refresh(); });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  let refreshTimer = 0;
  document.addEventListener("toggle", () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300); }, true);
})();
