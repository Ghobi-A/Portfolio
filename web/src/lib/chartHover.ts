/*
 * Pointer and touch readouts for the SVG evidence charts.
 *
 * Privacy vs utility: point anywhere along the chart and a marker rides the drawn
 * trend line. The readout gives the line's AUC at that ε and the band around it.
 * Those values are *interpolated* (the line is a monotone guide between three
 * measurements, not a fitted model), so they are labelled as such, together with
 * the nearest real measurement. Near a measured point the readout snaps to its
 * exact values; outside the measured range nothing is extrapolated.
 *
 * Partition benchmark: categories, so the guide snaps to the nearest measured
 * partition count.
 *
 * Keyboard users keep each chart's own selectable points and live status text,
 * so these overlays are aria-hidden.
 */
import { BUDGETS, REFERENCE_AUC, three } from "./bench";

/* Geometry used by privacyChart.ts to draw the plot (its viewBox units). */
const PLOT = { left: 72, right: 654, top: 48, bottom: 416, logMin: Math.log(0.25), logMax: Math.log(8) };

/** Monotone cubic Hermite (Fritsch–Carlson), the same construction privacyChart.ts
 *  uses to draw its guide. Evaluated in (ln ε, AUC) space it traces the identical
 *  curve, because the construction is invariant under the plot's axis scaling. */
function monotone(xs: number[], ys: number[]) {
  const n = xs.length;
  const d = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
  const m = xs.map((_, i) => {
    if (i === 0) return d[0];
    if (i === n - 1) return d[n - 2];
    if (d[i - 1] * d[i] <= 0) return 0;
    const a = xs[i] - xs[i - 1];
    const b = xs[i + 1] - xs[i];
    return (3 * (a + b)) / ((2 * b + a) / d[i - 1] + (b + 2 * a) / d[i]);
  });
  return (x: number) => {
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

const LOG_EPS = BUDGETS.map((b) => Math.log(Number(b.epsilon)));
const guide = monotone(LOG_EPS, BUDGETS.map((b) => b.auc));
const upper = monotone(LOG_EPS, BUDGETS.map((b) => b.high));
const lower = monotone(LOG_EPS, BUDGETS.map((b) => b.low));
const fmtEps = (eps: number) => (eps < 1 ? eps.toFixed(2) : eps < 10 ? eps.toFixed(1) : eps.toFixed(0));

interface Reading { x: number; y: number; html: string; element?: Element | null; probe?: boolean }

function attach(figure: HTMLElement, svg: () => SVGSVGElement | null, read: (clientX: number, plot: SVGSVGElement, clientY: number) => Reading | null) {
  figure.classList.add("has-chart-hover");
  const layer = (name: string) => {
    const node = document.createElement("div");
    node.className = name;
    node.setAttribute("aria-hidden", "true");
    figure.append(node);
    return node;
  };
  const cross = layer("chart-cross");
  const dot = layer("chart-probe");
  const tip = layer("chart-tip");
  let marked: Element | null = null;
  let lastHtml = "";

  const hide = () => {
    figure.classList.remove("is-hovering", "is-probing");
    marked?.classList.remove("is-hovered");
    marked = null;
  };
  const show = (clientX: number, clientY: number) => {
    const plot = svg();
    if (!plot) return;
    const reading = read(clientX, plot, clientY);
    if (!reading) { hide(); return; }
    const frame = figure.getBoundingClientRect();
    const box = plot.getBoundingClientRect();
    const x = reading.x - frame.left;
    const y = reading.y - frame.top;
    if (marked !== (reading.element ?? null)) {
      marked?.classList.remove("is-hovered");
      reading.element?.classList.add("is-hovered");
      marked = reading.element ?? null;
    }
    if (reading.html !== lastHtml) { tip.innerHTML = reading.html; lastHtml = reading.html; }
    cross.style.transform = `translate(${x}px, ${box.top - frame.top}px)`;
    cross.style.height = `${box.height}px`;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    const width = tip.offsetWidth;
    const left = Math.max(8, Math.min(frame.width - width - 8, x - width / 2));
    const above = y - tip.offsetHeight - 18;
    tip.style.transform = `translate(${left}px, ${above > 4 ? above : y + 22}px)`;
    figure.classList.add("is-hovering");
    figure.classList.toggle("is-probing", !!reading.probe);
  };

  figure.addEventListener("pointermove", (event) => {
    const plot = svg();
    if (plot && plot.contains(event.target as Node)) show(event.clientX, event.clientY); else hide();
  }, { passive: true });
  figure.addEventListener("pointerdown", (event) => {
    const plot = svg();
    if (event.pointerType !== "mouse" && plot?.contains(event.target as Node)) show(event.clientX, event.clientY);
  });
  figure.addEventListener("pointerleave", hide);
  addEventListener("scroll", () => { if (figure.classList.contains("is-hovering")) hide(); }, { passive: true });
}

let started = false;
export function initChartHover(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  document.querySelectorAll<HTMLElement>(".frontier").forEach((figure) => {
    const svg = () => figure.querySelector<SVGSVGElement>("svg[data-privacy-plot]");
    const full = () => !!figure.closest("[data-privacy-chart]")?.querySelector<HTMLInputElement>("[data-privacy-full-scale]")?.checked;
    attach(figure, svg, (clientX, plot) => {
      const ctm = plot.getScreenCTM();
      if (!ctm) return null;
      const toSvg = new DOMPoint(clientX, 0).matrixTransform(ctm.inverse());
      const toScreen = (sx: number, sy: number) => new DOMPoint(sx, sy).matrixTransform(ctm);
      const yMin = full() ? 0 : 0.9;
      const yMax = full() ? 1 : 0.97;
      const yOf = (auc: number) => PLOT.bottom - ((auc - yMin) / (yMax - yMin)) * (PLOT.bottom - PLOT.top);
      const xOf = (logEps: number) => PLOT.left + ((logEps - PLOT.logMin) / (PLOT.logMax - PLOT.logMin)) * (PLOT.right - PLOT.left);
      const pxPerUnit = Math.abs(toScreen(1, 0).x - toScreen(0, 0).x);
      const logEps = PLOT.logMin + ((toSvg.x - PLOT.left) / (PLOT.right - PLOT.left)) * (PLOT.logMax - PLOT.logMin);
      const measures = figure.querySelectorAll(".privacy-measure");

      // Near a measured point (within ~14px), or outside the measured range: that measurement, exactly.
      const nearest = LOG_EPS.reduce((best, value, index) => (Math.abs(value - logEps) < Math.abs(LOG_EPS[best] - logEps) ? index : best), 0);
      const nearPx = Math.abs(xOf(LOG_EPS[nearest]) - toSvg.x) * pxPerUnit;
      const outside = logEps < LOG_EPS[0] || logEps > LOG_EPS[LOG_EPS.length - 1];
      if (nearPx < 14 || outside) {
        const b = BUDGETS[nearest];
        const point = toScreen(xOf(LOG_EPS[nearest]), yOf(b.auc));
        const edge = outside ? `<em>${logEps < LOG_EPS[0] ? "No measurement below ε 0.49" : "No measurement above ε 6"}; nothing is extrapolated.</em>` : "";
        return {
          x: point.x, y: point.y, element: measures[nearest], probe: false,
          html: `<b>Measured · ε ${b.epsilon}</b><span>mean ROC-AUC <strong>${three(b.auc)}</strong></span><span>95% t interval ${three(b.low)}–${three(b.high)}</span><span>${three(REFERENCE_AUC - b.auc)} below non-private HGB</span>${edge}`,
        };
      }

      // Between measurements: ride the drawn trend line.
      const auc = guide(logEps);
      const band = [lower(logEps), upper(logEps)];
      const eps = Math.exp(logEps);
      const point = toScreen(toSvg.x, yOf(auc));
      const left = LOG_EPS.findIndex((value, index) => value <= logEps && logEps <= LOG_EPS[index + 1]);
      const near = BUDGETS[nearest];
      return {
        x: point.x, y: point.y, element: null, probe: true,
        html: `<b>Trend line · ε ${fmtEps(eps)}</b><span>ROC-AUC on the line <strong>≈${three(auc)}</strong></span><span>band ≈${three(band[0])}–${three(band[1])}</span><em>Interpolated between measured ε ${BUDGETS[left].epsilon} and ε ${BUDGETS[left + 1].epsilon}, not a measurement. Nearest measured: ε ${near.epsilon} = ${three(near.auc)}.</em>`,
      };
    });
  });

  // EdgeAuth: false rejection at target FAR 0.1% for three pipelines (values from the figure's table).
  document.querySelectorAll<SVGSVGElement>("svg[data-frr-chart]").forEach((plot) => {
    const figure = plot.closest<HTMLElement>("figure");
    if (!figure) return;
    const rows = [...figure.querySelectorAll<HTMLTableRowElement>("tbody tr")].map((row) => [...row.cells].map((cell) => cell.textContent?.trim() ?? ""));
    const rate = (text: string) => parseFloat(text.replace("%", ""));
    attach(figure, () => plot, (_clientX, _svg, clientY) => {
      const dots = [...plot.querySelectorAll("circle")];
      if (!dots.length || rows.length !== dots.length) return null;
      let best = 0;
      let distance = Infinity;
      dots.forEach((dot, index) => {
        const box = dot.getBoundingClientRect();
        const d = Math.abs(box.top + box.height / 2 - clientY);
        if (d < distance) { distance = d; best = index; }
      });
      const box = dots[best].getBoundingClientRect();
      const [name, frr, ci] = rows[best];
      const base = rate(rows[0][1]);
      const compare = best === 0
        ? `${(base / rate(rows[1][1])).toFixed(1)}× SFace FP32's rate`
        : `${(base / rate(frr)).toFixed(1)}× fewer owner lock-outs than dlib`;
      return {
        x: box.left + box.width / 2, y: box.top + box.height / 2, element: dots[best],
        html: `<b>${name}</b><span>false rejection <strong>${frr}</strong></span><span>95% person-level CI ${ci}</span><span>${compare}</span><em>LFW · target FAR 0.1% · conditional on this benchmark.</em>`,
      };
    });
  });

  document.querySelectorAll<HTMLElement>(".partition-chart").forEach((figure) => {
    const svg = () => figure.querySelector<SVGSVGElement>("svg");
    const rows = [...figure.querySelectorAll<HTMLTableRowElement>("tbody tr")].map((row) => [...row.cells].map((cell) => cell.textContent?.trim() ?? ""));
    attach(figure, svg, (clientX) => {
      const markers = [...figure.querySelectorAll(".partition-marker")];
      if (!markers.length) return null;
      let best = 0;
      let distance = Infinity;
      markers.forEach((marker, index) => {
        const spot = marker.querySelector("circle:not(.partition-hit):not(.partition-local-point)") ?? marker;
        const box = spot.getBoundingClientRect();
        const d = Math.abs(box.left + box.width / 2 - clientX);
        if (d < distance) { distance = d; best = index; }
      });
      const marker = markers[best];
      const spot = (marker.querySelector("circle:not(.partition-hit):not(.partition-local-point)") ?? marker).getBoundingClientRect();
      const [partitions, local, spark] = rows[best] ?? ["", "", ""];
      const ratio = parseFloat(spark.replace(/,/g, "")) / parseFloat(local.replace(/,/g, ""));
      return {
        x: spot.left + spot.width / 2, y: spot.top + spot.height / 2, element: marker,
        html: `<b>${partitions} ${partitions === "1" ? "partition" : "partitions"}</b><span>Spark <strong>${spark}</strong> images/s</span><span>Local ${local} images/s</span><span>${ratio.toFixed(2)}× local · five runs, one runner</span>`,
      };
    });
  });
}
