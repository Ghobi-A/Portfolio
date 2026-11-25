/*
 * Hover, tap and crosshair readouts for the SVG evidence charts.
 *
 * A vertical guide snaps to the nearest *measured* point (never an interpolated
 * position) and a tooltip states that point's exact values, all taken from the
 * same source data as the chart and its table. Keyboard users already have the
 * charts' own selectable points and status text; this layer is pointer and touch.
 * The tooltip is aria-hidden for that reason.
 */
import { BUDGETS, REFERENCE_AUC, three } from "./bench";

interface Target { element: Element; anchor: Element; html: string }

function attach(figure: HTMLElement, svg: () => SVGSVGElement | null, targets: () => Target[]) {
  figure.classList.add("has-chart-hover");
  const tip = document.createElement("div");
  tip.className = "chart-tip";
  tip.setAttribute("aria-hidden", "true");
  const cross = document.createElement("div");
  cross.className = "chart-cross";
  cross.setAttribute("aria-hidden", "true");
  figure.append(cross, tip);
  let current: Target | null = null;

  const hide = () => {
    figure.classList.remove("is-hovering");
    current?.element.classList.remove("is-hovered");
    current = null;
  };
  const show = (clientX: number) => {
    const plot = svg();
    if (!plot) return;
    const list = targets();
    if (!list.length) return;
    let best = list[0];
    let bestDistance = Infinity;
    for (const target of list) {
      const box = target.anchor.getBoundingClientRect();
      const distance = Math.abs(box.left + box.width / 2 - clientX);
      if (distance < bestDistance) { bestDistance = distance; best = target; }
    }
    const frame = figure.getBoundingClientRect();
    const plotBox = plot.getBoundingClientRect();
    const anchor = best.anchor.getBoundingClientRect();
    const x = anchor.left + anchor.width / 2 - frame.left;
    const y = anchor.top - frame.top;
    if (current !== best) {
      current?.element.classList.remove("is-hovered");
      best.element.classList.add("is-hovered");
      tip.innerHTML = best.html;
      current = best;
    }
    cross.style.transform = `translate(${x}px, ${plotBox.top - frame.top}px)`;
    cross.style.height = `${plotBox.height}px`;
    // Keep the tooltip inside the figure.
    const width = tip.offsetWidth;
    const left = Math.max(8, Math.min(frame.width - width - 8, x - width / 2));
    tip.style.transform = `translate(${left}px, ${Math.max(4, y - tip.offsetHeight - 14)}px)`;
    figure.classList.add("is-hovering");
  };

  figure.addEventListener("pointermove", (event) => {
    const plot = svg();
    if (plot && plot.contains(event.target as Node)) show(event.clientX); else hide();
  }, { passive: true });
  figure.addEventListener("pointerdown", (event) => {
    const plot = svg();
    if (event.pointerType !== "mouse" && plot?.contains(event.target as Node)) show(event.clientX);
  });
  figure.addEventListener("pointerleave", hide);
  window.addEventListener("scroll", hide, { passive: true });
}

let started = false;
export function initChartHover(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  // Privacy vs utility: three measured budgets (privacyChart.ts re-renders the svg on axis changes).
  document.querySelectorAll<HTMLElement>(".frontier").forEach((figure) => {
    const svg = () => figure.querySelector<SVGSVGElement>("svg[data-privacy-plot]");
    attach(figure, svg, () => [...figure.querySelectorAll(".privacy-measure")].map((measure, index) => {
      const b = BUDGETS[index];
      return {
        element: measure,
        anchor: measure.querySelector(".privacy-dot") ?? measure,
        html: `<b>ε ${b.epsilon}</b><span>mean ROC-AUC <strong>${three(b.auc)}</strong></span><span>95% t interval ${three(b.low)}–${three(b.high)}</span><span>${three(REFERENCE_AUC - b.auc)} below non-private HGB</span>`,
      };
    }));
  });

  // Partition benchmark: local vs local-mode Spark at four partition counts (values from its table).
  document.querySelectorAll<HTMLElement>(".partition-chart").forEach((figure) => {
    const svg = () => figure.querySelector<SVGSVGElement>("svg");
    const rows = [...figure.querySelectorAll<HTMLTableRowElement>("tbody tr")].map((row) => [...row.cells].map((cell) => cell.textContent?.trim() ?? ""));
    attach(figure, svg, () => [...figure.querySelectorAll(".partition-marker")].map((marker, index) => {
      const [partitions, local, spark] = rows[index] ?? ["", "", ""];
      const ratio = parseFloat(spark.replace(/,/g, "")) / parseFloat(local.replace(/,/g, ""));
      const spot = marker.querySelector("circle:not(.partition-hit):not(.partition-local-point)") ?? marker;
      return {
        element: marker,
        anchor: spot,
        html: `<b>${partitions} ${partitions === "1" ? "partition" : "partitions"}</b><span>Spark <strong>${spark}</strong> images/s</span><span>Local ${local} images/s</span><span>${ratio.toFixed(2)}× local · five runs, one runner</span>`,
      };
    }));
  });
}
