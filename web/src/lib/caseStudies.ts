/*
 * Reading aids for the extended case studies (native <details>):
 * - the summary states how long the read is ("6 sections · ≈2 min read"),
 * - opening fades each block in, in reading order,
 * - a "Close case study" button at the end glides back to the summary and closes it,
 *   so nobody has to scroll back up through a long explanation.
 */
const WORDS_PER_MINUTE = 230;

type LenisLike = { scrollTo: (target: Element, options: { offset?: number; duration?: number; onComplete?: () => void }) => void };
const lenis = () => (window as unknown as { portfolioMotion?: { lenis?: LenisLike } }).portfolioMotion?.lenis;

let started = false;
export function initCaseStudies(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll<HTMLDetailsElement>("details.case-study").forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector<HTMLElement>(".case-content");
    if (!summary || !content) return;

    const words = (content.textContent ?? "").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
    const sections = content.querySelectorAll(".case-grid > section").length;
    const meta = document.createElement("span");
    meta.className = "case-meta";
    meta.textContent = `${sections ? `${sections} sections · ` : ""}≈${minutes} min read`;
    summary.querySelector(".case-symbol")?.before(meta);

    const close = document.createElement("button");
    close.type = "button";
    close.className = "case-close";
    close.innerHTML = 'Close case study <span aria-hidden="true">↑</span>';
    close.addEventListener("click", () => {
      const header = document.querySelector<HTMLElement>(".header")?.offsetHeight ?? 64;
      const shut = () => { if (details.open) summary.click(); summary.focus({ preventScroll: true }); };
      const smooth = lenis();
      if (smooth && !reduced.matches) smooth.scrollTo(details, { offset: -header - 24, duration: 0.9, onComplete: shut });
      else { details.open = false; details.scrollIntoView({ block: "start" }); summary.focus({ preventScroll: true }); }
    });
    content.append(close);

    details.addEventListener("toggle", () => {
      if (!details.open || reduced.matches || !content.animate) return;
      [...content.children].forEach((child, index) => {
        (child as HTMLElement).animate(
          [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
          { duration: 520, delay: 60 + Math.min(index, 8) * 55, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
        );
      });
    });
  });
}
