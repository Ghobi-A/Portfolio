import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

export interface BarRow {
  label: string;
  value: string; // as printed, e.g. "1,109.6" or "8.68 s"
  pct: string; // bar length on the chart's own zero-based scale
  accent?: boolean;
}

const number = (value: string) => parseFloat(value.replace(/[^\d.]/g, ""));
const ease = [0.23, 1, 0.32, 1] as const;

/**
 * A measured two-bar comparison you can interrogate: hover, tap or tab to a bar
 * and the readout states its exact value and how it compares with the other bar.
 * Ratios are computed from the plotted values (they reproduce the headline
 * 2.28× and 4.58× figures); nothing is estimated.
 */
export default function BarCompare({ label, unit, rows, lowerIsBetter = false }: { label: string; unit: string; rows: BarRow[]; lowerIsBetter?: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const readout = useId();
  const values = rows.map((row) => number(row.value));
  const accent = Math.max(0, rows.findIndex((row) => row.accent));

  const describe = (index: number) => {
    const other = index === 0 ? 1 : 0;
    const a = values[index];
    const b = values[other];
    const self = rows[index];
    if (lowerIsBetter) {
      const diff = b - a;
      const share = ((Math.abs(diff) / Math.max(a, b)) * 100).toFixed(1);
      return `${self.label}: ${self.value}, ${Math.abs(diff).toFixed(2)} s (${share}%) ${diff >= 0 ? "faster" : "slower"} than ${rows[other].label}.`;
    }
    return a >= b
      ? `${self.label}: ${self.value} ${unit}, ${(a / b).toFixed(2)}× ${rows[other].label}.`
      : `${self.label}: ${self.value} ${unit}; ${rows[other].label} is ${(b / a).toFixed(2)}× faster.`;
  };
  const text = describe(active ?? accent);

  return (
    <div className={`chart-group bar-compare${active !== null ? " is-probing" : ""}`} role="group" aria-label={`${label} (${unit})`}>
      <p className="chart-label">{label} <span>{unit}</span></p>
      {rows.map((row, index) => (
        <div key={row.label} className={`bar-row${active === index ? " is-active" : ""}`} tabIndex={0} aria-describedby={readout}
          onPointerEnter={() => setActive(index)} onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(index)} onBlur={() => setActive(null)}>
          <span>{row.label}</span><b>{row.value}</b>
          <div className="bar-track"><i className={row.accent ? "rust-bar" : undefined} style={{ ["--value" as string]: row.pct }} /></div>
        </div>
      ))}
      <p className="bar-readout" id={readout} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease }}>{text}</motion.span>
        </AnimatePresence>
      </p>
    </div>
  );
}
