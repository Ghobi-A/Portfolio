import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useFinePointer, useReduced } from "../lib/hooks";

/** A fuchsia companion for fine pointers: a dot that grows into a labelled ring
 *  ("View", "Play", "Pulse") over [data-cursor] areas. The system cursor stays. */
export default function Cursor() {
  const fine = useFinePointer();
  const reduced = useReduced();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 45, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 600, damping: 45, mass: 0.6 });
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!fine || reduced) return;
    const move = (event: PointerEvent) => {
      x.set(event.clientX); y.set(event.clientY); setShown(true);
      const target = event.target as HTMLElement;
      const hint = target.closest?.<HTMLElement>("[data-cursor]");
      setLabel(hint?.dataset.cursor ?? null);
      setHover(!hint && !!target.closest?.("a, button, summary, [role='button'], [role='tab'], label"));
    };
    const leave = () => setShown(false);
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => { document.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave); };
  }, [fine, reduced, x, y]);

  if (!fine || reduced) return null;
  const size = label ? 76 : hover ? 38 : 10;
  return (
    <motion.div className={`cursor${label ? " is-label" : ""}${hover ? " is-hover" : ""}`} aria-hidden="true"
      style={{ x: sx, y: sy, opacity: shown ? 1 : 0 }}
      animate={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}>
      <motion.span animate={{ scale: label ? 1 : 0.4, opacity: label ? 1 : 0 }}>{label}</motion.span>
    </motion.div>
  );
}
