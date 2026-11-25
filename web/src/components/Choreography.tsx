/*
 * Scroll choreography (GSAP + ScrollTrigger + SplitText via @gsap/react).
 *
 * GSAP owns everything tied to scroll position; Motion owns component state
 * (tabs, previews, cursor) and React Bits supplies the marquee, decoding labels
 * and magnetic buttons. Content is complete without any of this: everything is
 * registered in gsap.matchMedia so reduced motion reverts it, splits are
 * reverted when they finish, and figures never count up.
 */
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { velocity } from "../lib/velocity";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

export default function Choreography() {
  useGSAP(() => {
    CustomEase.create("lab-out", "0.23, 1, 0.32, 1");
    CustomEase.create("lab-in-out", "0.77, 0, 0.175, 1");
    CustomEase.create("lab-expo", "0.16, 1, 0.3, 1");
    gsap.defaults({ ease: "lab-out", duration: 0.7 });
    ScrollTrigger.config({ ignoreMobileResize: true });

    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>("[data-lab]");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenisActive = () => !!(window as unknown as { portfolioMotion?: { lenis?: unknown } }).portfolioMotion?.lenis;
    const splits = new Set<SplitText>();
    const split = (element: Element, type: string, { noMask = false } = {}) => {
      const mask = type.includes("chars") ? "lines" : type.includes("words") ? "words" : "lines";
      const instance = SplitText.create(element, {
        type, aria: "auto", autoSplit: false, ...(noMask ? {} : { mask }),
        linesClass: "split-line", wordsClass: "split-word", charsClass: "split-char",
      } as SplitText.Vars);
      splits.add(instance);
      return instance;
    };
    const revert = (instance: SplitText) => { instance.revert(); splits.delete(instance); };

    // Without Lenis (touch, reduced motion), ScrollTrigger's velocity stands in.
    const settle = gsap.delayedCall(0.15, () => { if (!lenisActive()) velocity.emit(0); }).pause();
    ScrollTrigger.create({ onUpdate: (self) => { if (lenisActive()) return; velocity.emit(self.getVelocity() / 60); settle.restart(true); } });

    // ---- Opening -----------------------------------------------------------
    const playIntro = hero && !location.hash && scrollY < 100 && !reduced
      && (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type !== "back_forward";
    if (playIntro && hero) {
      const names = [...hero.querySelectorAll(".name-line")].map((line) => split(line, "chars"));
      const thesis = split(hero.querySelector(".stage-thesis")!, "words");
      gsap.timeline({ onComplete: () => { names.forEach(revert); revert(thesis); } })
        .from(hero.querySelectorAll(".hero-meta p"), { y: 12, opacity: 0, duration: 0.6, stagger: 0.06, clearProps: "all" }, 0)
        .from(names[0].chars, { yPercent: 105, duration: 1.15, ease: "lab-expo", stagger: 0.035 }, 0.15)
        .from(names[1].chars, { yPercent: 105, duration: 1.15, ease: "lab-expo", stagger: { each: 0.035, from: "end" } }, 0.3)
        .from(hero.querySelectorAll(".hero-thesis .spec-line, .hero-thesis .verbs em"), { y: 14, opacity: 0, stagger: 0.06, clearProps: "all" }, 0.75)
        .from(thesis.words, { yPercent: 100, duration: 0.8, ease: "lab-expo", stagger: 0.03 }, 0.85)
        .from(hero.querySelectorAll(".stage-description, .intro-actions > *"), { y: 16, opacity: 0, stagger: 0.06, clearProps: "all" }, 1.05)
        .from(hero.querySelector(".instrument"), { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "lab-expo", clearProps: "clipPath" }, 0.7)
        .from(hero.querySelector(".lab"), { y: 40, opacity: 0, duration: 1, ease: "lab-expo", clearProps: "all" }, 0.9);
    }

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const once = { start: "top 86%", once: true } as const;

      if (hero) {
        // The name's lines drift apart and rise faster than the brief (layered parallax).
        const [first, second] = hero.querySelectorAll(".name-line");
        const drift = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
        gsap.to(first, { xPercent: -8, yPercent: -22, ease: "none", scrollTrigger: drift });
        gsap.to(second, { xPercent: 6, yPercent: -12, ease: "none", scrollTrigger: drift });
        // Leaving the opening: the brief drifts up and dims.
        gsap.to(hero.querySelectorAll(".hero-brief > *"), {
          y: (index: number) => -40 - index * 30, opacity: 0.25, ease: "none",
          scrollTrigger: { trigger: hero.querySelector(".hero-brief"), start: "bottom 45%", end: "bottom top", scrub: 0.8 },
        });
        gsap.to(hero.querySelector(".hero-meta"), { opacity: 0, y: -30, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "30% top", scrub: 0.6 } });
      }

      // Big type leans with scroll speed, then springs upright.
      const leaners = gsap.utils.toArray<HTMLElement>(".hero-name, .giant, .contact h2, .section-heading h2, .project-number");
      const skew = gsap.quickTo(leaners, "skewY", { duration: 0.6, ease: "power3.out" });
      const stopLean = velocity.on((value) => skew(gsap.utils.clamp(-3.5, 3.5, value * -0.12)));

      gsap.utils.toArray<HTMLElement>(".giant").forEach((word) => {
        gsap.fromTo(word, { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: word, start: "top bottom", end: "bottom top", scrub: true } });
      });
      // LABEL ——— LABEL: the rule draws once its line arrives (the labels decode via React Bits).
      root.classList.add("js-rules");
      gsap.utils.toArray<HTMLElement>(".spec-line").forEach((line) => {
        ScrollTrigger.create({ trigger: line, start: "top 90%", once: true, onEnter: () => line.classList.add("is-drawn") });
      });
      gsap.utils.toArray<HTMLElement>(".verbs").forEach((row) => {
        gsap.from(row.children, { y: 18, opacity: 0, duration: 0.6, stagger: 0.09, clearProps: "all", scrollTrigger: { trigger: row, start: "top 90%", once: true } });
      });

      // Project titles rise word by word; other headings come into focus out of a blur.
      gsap.utils.toArray<HTMLElement>(".project-copy > h3, .audio-lab h3").forEach((heading) => {
        const instance = split(heading, "words");
        gsap.from(instance.words, { yPercent: 110, duration: 1.1, ease: "lab-expo", stagger: 0.07, scrollTrigger: { trigger: heading, ...once }, onComplete: () => revert(instance) });
      });
      gsap.utils.toArray<HTMLElement>(".section-heading h2, .semantic-lab h2, .about h2, .research-question").forEach((heading) => {
        const instance = split(heading, "words", { noMask: true });
        gsap.from(instance.words, { opacity: 0, yPercent: 35, filter: "blur(12px)", duration: 1.2, stagger: 0.06, scrollTrigger: { trigger: heading, ...once }, onComplete: () => revert(instance) });
      });
      gsap.utils.toArray<HTMLElement>(".project-number").forEach((number) => {
        gsap.from(number, { yPercent: 70, opacity: 0, duration: 1.1, ease: "lab-expo", scrollTrigger: { trigger: number, ...once } });
      });

      // Paragraphs fade in line by line, each line lifting out of a soft blur.
      const scrubbed = ".work-intro > p:last-child, .about-copy > p:first-of-type, .contact-question";
      const prose = gsap.utils.toArray<HTMLElement>([
        ".project-copy > p:not(.spec-line):not(.verbs)", ".audio-lab > div > p:not(.eyebrow)", ".semantic-design > p",
        ".about-copy > p", ".contact-invitation > p", ".capability-grid p", ".section-heading > p",
        ".research-explanation", ".research-caveat", ".audio-scope li p", ".result-statement",
      ].join(",")).filter((paragraph) => !paragraph.matches(scrubbed) && !paragraph.closest(".case-study"));
      [...new Set(prose)].forEach((paragraph) => {
        const instance = split(paragraph, "lines", { noMask: true });
        gsap.from(instance.lines, { opacity: 0, y: 22, filter: "blur(8px)", duration: 1.1, stagger: 0.09, scrollTrigger: { trigger: paragraph, start: "top 90%", once: true }, onComplete: () => revert(instance) });
      });
      gsap.utils.toArray<HTMLElement>(".project-copy, .audio-lab > div:first-child, .about-copy, .semantic-design, .contact-invitation").forEach((block) => {
        const items = [...block.querySelectorAll(":scope > .metrics, :scope > .tags, :scope > .text-links, :scope > .actions, :scope > .education, :scope > .source-link, :scope > dl, :scope > ol, :scope > h4, :scope > .semantic-legend, :scope > .paper-study, :scope > a")];
        if (items.length) gsap.from(items, { y: 30, opacity: 0, duration: 1, stagger: 0.08, clearProps: "transform,opacity", scrollTrigger: { trigger: block, start: "top 80%", once: true } });
      });
      // Scroll-linked reading: words brighten as the paragraph passes through view.
      gsap.utils.toArray<HTMLElement>(scrubbed).forEach((paragraph) => {
        const instance = split(paragraph, "words", { noMask: true });
        gsap.fromTo(instance.words, { opacity: 0.18 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: paragraph, start: "top 88%", end: "bottom 55%", scrub: true } });
      });

      // Featured index rows arrive one by one; the preview frame opens.
      const featured = document.querySelector("[data-featured]");
      if (featured) {
        gsap.from(featured.querySelectorAll(".featured-list a"), { yPercent: 60, opacity: 0, duration: 0.9, ease: "lab-expo", stagger: 0.07, clearProps: "transform,opacity", scrollTrigger: { trigger: featured, start: "top 80%", once: true } });
        gsap.from(featured.querySelector(".featured-preview"), { clipPath: "inset(18% 12% 18% 12%)", opacity: 0.4, duration: 1.2, ease: "lab-expo", clearProps: "clipPath,opacity", scrollTrigger: { trigger: featured, start: "top 75%", once: true } });
      }

      // Evidence panels rise into place while their story stays sticky.
      gsap.utils.toArray<HTMLElement>(".project-grid > .evidence-panel, .research-sidebar, .audio-scope").forEach((panel) => {
        gsap.from(panel, { y: 90, scale: 0.96, opacity: 0.4, ease: "none", transformOrigin: "50% 0%", scrollTrigger: { trigger: panel, start: "top bottom", end: "top 62%", scrub: 0.6 } });
      });
      // Images expand from an inset frame and settle their zoom.
      gsap.utils.toArray<HTMLElement>(".gameplay-shot, .paper-study, .evidence-panel > a > img").forEach((frame) => {
        const image = frame.matches("img") ? null : frame.querySelector("img");
        gsap.fromTo(frame, { clipPath: "inset(14% 10% 14% 10% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 10px)", ease: "none", scrollTrigger: { trigger: frame, start: "top 95%", end: "top 45%", scrub: 0.5 } });
        if (image) gsap.fromTo(image, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
      });
      // Measured bars grow from zero once; chart guides draw; measured points stay put.
      gsap.utils.toArray<HTMLElement>(".bar-track i").forEach((bar, index) => {
        gsap.from(bar, { scaleX: 0, duration: 1.1, ease: "lab-expo", delay: (index % 2) * 0.12, scrollTrigger: { trigger: bar, start: "top 90%", once: true } });
      });
      gsap.utils.toArray<SVGPathElement>(".partition-chart .draw-line").forEach((line) => {
        gsap.fromTo(line, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "lab-in-out", scrollTrigger: { trigger: line, start: "top 85%", once: true }, clearProps: "strokeDasharray,strokeDashoffset" });
      });
      gsap.utils.toArray<HTMLElement>(".frontier").forEach((figure) => {
        ScrollTrigger.create({
          trigger: figure, start: "top 80%", once: true,
          onEnter: () => {
            const fit = figure.querySelector<SVGPathElement>(".privacy-fit");
            if (!fit) return;
            const length = fit.getTotalLength();
            gsap.fromTo(fit, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.2, ease: "lab-in-out", clearProps: "strokeDasharray,strokeDashoffset" });
            gsap.from(figure.querySelectorAll(".privacy-measure"), { opacity: 0, y: 10, stagger: 0.18, delay: 0.35, duration: 0.5, clearProps: "all" });
          },
        });
      });
      gsap.utils.toArray<HTMLElement>(".metrics dd").forEach((figure) => {
        gsap.from(figure, { yPercent: 60, opacity: 0, duration: 0.9, ease: "lab-expo", scrollTrigger: { trigger: figure, start: "top 92%", once: true }, clearProps: "all" });
      });
      gsap.utils.toArray<HTMLElement>(".signal-system, .order-flow, .method-rail, .semantic-chain, .simulation-branches, .token-flow, .audit-grid").forEach((diagram) => {
        const items = diagram.matches(".signal-system") ? diagram.querySelectorAll(".system-node, .flow-line, .split-rail") : diagram.children;
        gsap.from([...items].filter((node) => !node.matches(".evidence-inspector")), { y: 16, opacity: 0, duration: 0.6, stagger: 0.07, clearProps: "transform,opacity", scrollTrigger: { trigger: diagram, start: "top 85%", once: true } });
      });
      // The fuchsia methods band opens from a slit; its cards follow.
      gsap.utils.toArray<HTMLElement>(".capabilities").forEach((band) => {
        gsap.fromTo(band, { clipPath: "inset(18% 6% 18% 6%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: band, start: "top bottom", end: "top 30%", scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>(".capability-grid a").forEach((card, index) => {
        gsap.from(card, { y: 50, opacity: 0, duration: 0.9, delay: index * 0.08, clearProps: "transform,opacity", scrollTrigger: { trigger: ".capability-grid", start: "top 85%", once: true } });
      });
      const contact = document.querySelector(".contact h2");
      if (contact) {
        const instance = split(contact, "chars");
        gsap.from(instance.chars, { yPercent: 110, rotate: 6, duration: 1.1, ease: "lab-expo", stagger: 0.035, scrollTrigger: { trigger: contact, start: "top 85%", once: true }, onComplete: () => revert(instance) });
      }
      gsap.utils.toArray<HTMLElement>(".tags").forEach((list) => {
        gsap.from(list.children, { x: -10, opacity: 0, duration: 0.5, stagger: 0.04, clearProps: "all", scrollTrigger: { trigger: list, start: "top 92%", once: true } });
      });

      return () => { stopLean(); splits.forEach((instance) => instance.revert()); splits.clear(); };
    });

    // Fine pointers: a soft fuchsia spotlight follows the pointer across evidence panels.
    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      let frame = 0;
      let last: PointerEvent | null = null;
      const spotlight = (event: PointerEvent) => {
        last = event;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const panel = (last?.target as HTMLElement | null)?.closest?.<HTMLElement>(".evidence-panel");
          if (!panel || !last) return;
          const rect = panel.getBoundingClientRect();
          panel.style.setProperty("--spot-x", `${last.clientX - rect.left}px`);
          panel.style.setProperty("--spot-y", `${last.clientY - rect.top}px`);
        });
      };
      document.addEventListener("pointermove", spotlight, { passive: true });
      return () => document.removeEventListener("pointermove", spotlight);
    });

    // Feedback for the evidence figures' own selections (<= 220ms).
    const onPrivacy = (event: Event) => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const chart = event.target as HTMLElement;
      const guide = chart.querySelector(".privacy-selection-guide");
      const detail = (event as CustomEvent<{ offsetX?: number }>).detail;
      if (guide) gsap.fromTo(guide, { x: detail?.offsetX || 0 }, { x: 0, duration: 0.22, ease: "lab-in-out", clearProps: "transform" });
      const dot = chart.querySelector(".is-selected .privacy-dot");
      if (dot) gsap.fromTo(dot, { strokeWidth: 6 }, { strokeWidth: 2, duration: 0.22, clearProps: "strokeWidth" });
    };
    const onInspect = (event: Event) => {
      const target = (event as CustomEvent<{ target?: Element }>).detail?.target;
      if (!target || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(target, { y: 4, opacity: 0.55 }, { y: 0, opacity: 1, duration: 0.22, clearProps: "transform,opacity" });
    };
    // A focused control and its ancestors stop moving at once.
    const onFocus = (event: FocusEvent) => {
      for (let element = event.target as HTMLElement | null; element && element !== document.body; element = element.parentElement) {
        gsap.getTweensOf(element).forEach((tween) => { if (!tween.scrollTrigger?.vars.scrub) tween.progress(1); });
      }
    };
    let refresh = 0;
    const onToggle = () => { clearTimeout(refresh); refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300); };
    document.addEventListener("privacyselect", onPrivacy);
    document.addEventListener("evidenceinspect", onInspect);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("toggle", onToggle, true);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    // Re-measure trigger positions whenever the page's height changes: hydration
    // collapses the bench to one panel, disclosures open, images and fonts arrive.
    let lastHeight = document.body.scrollHeight;
    const resizer = new ResizeObserver(() => {
      if (Math.abs(document.body.scrollHeight - lastHeight) < 2) return;
      lastHeight = document.body.scrollHeight;
      clearTimeout(refresh);
      refresh = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    resizer.observe(document.body);
    return () => {
      resizer.disconnect();
      document.removeEventListener("privacyselect", onPrivacy);
      document.removeEventListener("evidenceinspect", onInspect);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, []);

  return null;
}
