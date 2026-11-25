/* Subpage motion and interaction, shared by the case studies and the dashboard.
 * - A fuchsia reading-progress rule under the header.
 * - Headings, paragraphs, figures and tables fade up into place as they enter
 *   (softly blurred on desktop), in reading order. Anything already on screen at
 *   load joins a short opening sequence.
 * - Dashboard bars become focusable; hover, focus or tap states the exact value.
 * Content is fully visible without this script, and reduced motion skips it. */
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 761px)").matches;

  // Reading progress.
  const bar = document.createElement("div");
  bar.className = "reading-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.append(bar);
  let frame = 0;
  const progress = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(progress); }, { passive: true });
  addEventListener("resize", progress, { passive: true });
  progress();

  const animateIn = (element, delay) => {
    if (reduced || !element.animate) return;
    element.animate(
      [{ opacity: 0, transform: "translateY(18px)", filter: desktop ? "blur(4px)" : "none" },
       { opacity: 1, transform: "none", filter: "none" }],
      { duration: 720, delay, easing: "cubic-bezier(.23,1,.32,1)", fill: "backwards" },
    );
  };

  // Fade-up reveals for long-form pages.
  const root = document.querySelector(".case-page, .ai-case, .methodology");
  if (root && !reduced && "IntersectionObserver" in window) {
    const targets = [...root.querySelectorAll(":scope > *, .architecture > div, .ai-proof > div, li, tr")]
      .filter((el) => !el.matches("script, style, .skip-link, ol, ul, tbody, thead, table") && el.getBoundingClientRect().height > 0);
    const onScreen = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
    let opening = 0;
    targets.filter(onScreen).forEach((el) => animateIn(el, 60 + Math.min(opening++, 10) * 70));
    const pending = targets.filter((el) => !onScreen(el));
    // Hide only what is below the fold, and only once JavaScript is running.
    pending.forEach((el) => { el.style.opacity = "0"; });
    const io = new IntersectionObserver((entries) => {
      let batch = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        el.style.opacity = "";
        animateIn(el, Math.min(batch++, 6) * 70);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    pending.forEach((el) => io.observe(el));
    // Safety: never leave anything hidden (printing, find-in-page, odd viewports).
    addEventListener("beforeprint", () => pending.forEach((el) => { el.style.opacity = ""; }));
    setTimeout(() => pending.forEach((el) => { if (el.style.opacity === "0" && onScreen(el)) { el.style.opacity = ""; } }), 2500);
  }

  // Dashboard: animate each page switch and make bars interrogable.
  const content = document.getElementById("content");
  if (content) {
    const enhance = () => {
      content.querySelectorAll(".panel, .kpi").forEach((el, i) => animateIn(el, Math.min(i, 9) * 45));
      content.querySelectorAll(".bars").forEach((bars) => {
        if (bars.dataset.enhanced) return;
        bars.dataset.enhanced = "true";
        const readout = document.createElement("p");
        readout.className = "bar-readout";
        readout.setAttribute("aria-live", "polite");
        const rows = [...bars.querySelectorAll(".bar")];
        const total = rows.length;
        const describe = (row, index) => {
          const label = row.querySelector(".bar-label")?.textContent.trim();
          const value = row.querySelector(".bar-value")?.textContent.trim();
          readout.textContent = `${label}: ${value} (${index + 1} of ${total} bars)`;
        };
        readout.textContent = "Point at, tap or tab to a bar for its exact value.";
        rows.forEach((row, index) => {
          row.tabIndex = 0;
          row.setAttribute("aria-label", row.getAttribute("title") || "");
          row.addEventListener("pointerenter", () => describe(row, index));
          row.addEventListener("focus", () => describe(row, index));
          if (!reduced && row.querySelector(".fill")?.animate) {
            row.querySelector(".fill").animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
              { duration: 900, delay: 120 + index * 40, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
          }
        });
        bars.after(readout);
      });
    };
    new MutationObserver(enhance).observe(content, { childList: true });
    enhance();
  }
})();
