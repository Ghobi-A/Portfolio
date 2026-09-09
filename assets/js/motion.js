/* Optional GSAP enhancement. No hidden CSS defaults and no scroll hijacking. */
(() => {
  "use strict";
  if (!window.gsap || !window.matchMedia) return;
  const gsap = window.gsap;
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const context = gsap.context(() => {
      // A reload into a case study should not play an offscreen entrance.
      if (!location.hash) {
        gsap.from(".hero-top, .hero-role", {
          opacity: 0,
          y: 4,
          duration: 0.35,
          stagger: 0.05,
          clearProps: "all",
        });
        gsap.from(".hero h1", {
          opacity: 0,
          y: 8,
          duration: 0.5,
          delay: 0.08,
          clearProps: "all",
        });
        gsap.from(".hero-statement, .hero-support, .actions", {
          opacity: 0,
          y: 6,
          duration: 0.4,
          delay: 0.16,
          stagger: 0.06,
          clearProps: "all",
        });
        gsap.from(".hero-instrument .draw-line", {
          strokeDasharray: 1,
          strokeDashoffset: 1,
          duration: 0.8,
          delay: 0.2,
          clearProps: "all",
        });
        gsap.from(".hero-instrument .observations circle", {
          opacity: 0.25,
          y: 4,
          duration: 0.4,
          stagger: 0.012,
          clearProps: "all",
        });
      }
    });
    const animated = new Set();
    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || animated.has(entry.target)) return;
            animated.add(entry.target);
            observer.unobserve(entry.target);
            context.add(() => {
              if (entry.target.matches(".section-heading, .contact-invitation")) {
                gsap.from(entry.target, {
                  y: 8,
                  opacity: 0.65,
                  duration: 0.45,
                  clearProps: "all",
                });
              } else {
                const nodes = entry.target.querySelectorAll(".system-node, .method-rail li, .audit-grid > div, .order-flow li, .token-flow span");
                if (nodes.length)
                  gsap.from(nodes, {
                    y: 6,
                    opacity: 0.65,
                    duration: 0.4,
                    stagger: 0.06,
                    clearProps: "all",
                  });
                const bars = entry.target.querySelectorAll(".bar-track i");
                const lines = entry.target.querySelectorAll(".draw-line");
                if (bars.length)
                  gsap.from(bars, {
                    scaleX: 0,
                    duration: 0.65,
                    stagger: 0.07,
                    ease: "power2.out",
                    clearProps: "all",
                  });
                if (lines.length)
                  gsap.from(lines, {
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    duration: 0.8,
                    clearProps: "all",
                  });
              }
            });
          });
        },
        { threshold: 0.18 },
      );
      document
        .querySelectorAll(".section-heading, .project .evidence-panel, .evidence-strip, .token-flow, .contact-invitation")
        .forEach((element) => observer.observe(element));
    }
    return () => {
      observer?.disconnect();
      context.revert();
    };
  });
})();
