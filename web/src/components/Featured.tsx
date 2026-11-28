import { AnimatePresence, motion, useMotionValue, useSpring, type Variants } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { useFinePointer, useHydrated, useReduced } from "../lib/hooks";

const ease = [0.16, 1, 0.3, 1] as const;

const PROJECTS = [
  { id: "dp", href: "#file-dp", code: "DP—05", title: "Privacy–Utility Audit", kind: "Research" },
  { id: "ea", href: "#file-edgeauth", code: "EA—09", title: "EdgeAuth Verification", kind: "Computer vision" },
  { id: "kh", href: "#file-kh4", code: "KH—01", title: "Demand Intelligence", kind: "NLP" },
  { id: "ra", href: "#GA-RA-07", code: "RA—07", title: "Restaurant Operations", kind: "SQL & BI" },
  { id: "di", href: "#file-di", code: "DI—02", title: "Image ML Pipeline", kind: "Data engineering" },
  { id: "cd", href: "#file-cd", code: "CD—03", title: "Crestbound Duelists", kind: "Simulation" },
  { id: "ca", href: "#file-ca", code: "CA—06", title: "Creative Audio Lab", kind: "Experiment" },
] as const;
type Id = (typeof PROJECTS)[number]["id"];

/** Children of a preview arrive one after another; bars grow from zero. */
const item: Variants = { hidden: { opacity: 0, y: 26 }, shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };
const grow: Variants = { hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.9, ease } } };
const pop: Variants = { hidden: { opacity: 0, scale: 0.6 }, shown: { opacity: 1, scale: 1, transition: { duration: 0.4, ease } } };

const Kicker = ({ children }: { children: ReactNode }) => <motion.p className="preview-kicker" variants={item}>{children}</motion.p>;
const Figure = ({ value, note, word }: { value: string; note: string; word?: boolean }) => (
  <motion.p className={`preview-figure${word ? " is-word" : ""}`} variants={item}>{value}<small>{note}</small></motion.p>
);
const Note = ({ children }: { children: ReactNode }) => <motion.p className="preview-note" variants={item}>{children}</motion.p>;
const Bars = ({ rows }: { rows: [string, string, string, boolean?][] }) => (
  <motion.div className="pv-bars" variants={item}>
    {rows.map(([label, value, width, dim]) => (
      <p key={label}><span>{label}</span><b>{value}</b><motion.i className={dim ? "is-dim" : undefined} style={{ ["--w" as string]: width }} variants={grow} /></p>
    ))}
  </motion.div>
);
const Pair = ({ children }: { children: ReactNode }) => <motion.p className="pv-pair" variants={item}>{children}</motion.p>;

/** Real figures per project, the same values as the case studies below. */
const PANELS: Record<Id, ReactNode> = {
  dp: (
    <>
      <Kicker>DP—05 / Privacy vs utility</Kicker>
      <Figure value=".933" note="mean ROC-AUC at ε 0.49, the strongest privacy setting" />
      <motion.svg className="preview-chart" viewBox="0 0 300 120" aria-hidden="true" variants={item}>
        <path className="pc-grid" d="M20 10H280M20 60H280M20 110H280" />
        <path className="pc-ref" d="M20 34.3H280" /><text x="280" y="29" textAnchor="end">non-private .953</text>
        <path className="pc-whisker" d="M70.5 28.6V97.1M176 24.3V71.4M258.4 22.9V70" />
        <motion.path className="pc-line" d="M70.5 62.9L176 47.1L258.4 45.7" variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1, transition: { duration: 0.9, ease } } }} />
        <circle className="pc-dot is-key" cx="70.5" cy="62.9" r="5" /><circle className="pc-dot" cx="176" cy="47.1" r="4" /><circle className="pc-dot" cx="258.4" cy="45.7" r="4" />
        <text x="70.5" y="119" textAnchor="middle">ε 0.49</text><text x="176" y="119" textAnchor="middle">ε 2</text><text x="258.4" y="119" textAnchor="middle">ε 6</text>
      </motion.svg>
      <Note>Five seeds · 1,338 public records · 95% t intervals</Note>
    </>
  ),
  ea: (
    <>
      <Kicker>EA—09 / Owner lock-out at a fixed FAR</Kicker>
      <Figure value="1.53%" note="SFace FP32 false rejection on LFW at target FAR 0.1%, down from 8.67% with the 2022 dlib pipeline" />
      <Bars rows={[["dlib (2022 prototype)", "8.67%", "86.7%", true], ["SFace FP32", "1.53%", "15.3%"], ["SFace INT8", "1.73%", "17.3%"]]} />
      <Note>Axis 0–10% · 22,396 verification pairs · person-level 95% intervals · Raspberry Pi validation pending</Note>
    </>
  ),
  kh: (
    <>
      <Kicker>KH—01 / Review ranking</Kicker>
      <Figure value="2.5×" note="lift in the top 10% of a ranked review queue" />
      <Bars rows={[["Actionable PR-AUC", "0.65", "65%"], ["Positive prevalence", "0.30", "30%", true]]} />
      <motion.div className="pv-queue" variants={{ shown: { transition: { staggerChildren: 0.025 } } }}>
        {[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1].map((on, index) => <motion.i key={index} className={on ? "on" : undefined} variants={pop} />)}
      </motion.div>
      <Note>Out-of-fold development evaluation · 200 labels · one annotator</Note>
    </>
  ),
  ra: (
    <>
      <Kicker>RA—07 / Order to revenue</Kicker>
      <Figure value="53" note="recorded source orders behind the published aggregates" />
      <motion.ol className="pv-steps" variants={{ shown: { transition: { staggerChildren: 0.06 } } }}>
        {["Validate", "Pay", "Webhook", "Kitchen"].map((step) => <motion.li key={step} className={step === "Webhook" ? "is-key" : undefined} variants={pop}>{step}</motion.li>)}
      </motion.ol>
      <Pair><span><b>15</b> SQL analyses</span><span><b>4</b> report pages</span></Pair>
      <Note>Deployed platform · payment confirmed at the server, not the browser</Note>
    </>
  ),
  di: (
    <>
      <Kicker>DI—02 / Follow the bottleneck</Kicker>
      <Figure value="4.58×" note="faster TensorFlow input with TFRecord" />
      <Bars rows={[["Raw JPEG", "2,179.1", "21.84%", true], ["TFRecord", "9,978.1", "100%"]]} />
      <Pair><span>Epoch <b>8.68 s</b> → <b>8.54 s</b></span><span>barely moves</span></Pair>
      <Note>Samples per second · 3,670 images · one runner, not multi-worker</Note>
    </>
  ),
  cd: (
    <>
      <Kicker>CD—03 / One model, two consumers</Kicker>
      <motion.img src="assets/images/crestbound-battle.webp" alt="" width={1701} height={925} loading="lazy" variants={item} />
      <Pair><span><b>6</b> playable classes</span><span><b>100k</b> simulations per matchup</span></Pair>
    </>
  ),
  ca: (
    <>
      <Kicker>CA—06 / Active experiment</Kicker>
      <Figure value="MIDI" note="editable stems from prompt-conditioned rules" word />
      <motion.p className="pv-flow" variants={{ shown: { transition: { staggerChildren: 0.08 } } }}>
        {["Prompt", "Note events", "MIDI stems"].map((step) => <motion.span key={step} variants={pop}>{step}</motion.span>)}
      </motion.p>
      <Note>n-gram baseline on synthetic bootstrap data · real-corpus evaluation pending</Note>
    </>
  ),
};

/**
 * Featured index: six large titles drive a live preview of each project.
 * Hover or keyboard focus previews; on touch the first tap previews and the
 * second opens the project. Motion wipes the new panel in over the old one.
 */
export default function Featured() {
  const hydrated = useHydrated();
  const reduced = useReduced();
  const fine = useFinePointer();
  const [current, setCurrent] = useState<Id>("dp");
  const touched = useRef(false);
  const frame = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const index = PROJECTS.findIndex((project) => project.id === current);

  const tilt = (event: React.PointerEvent) => {
    if (!fine || reduced || !frame.current) return;
    const rect = frame.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    ry.set(Math.max(-7, Math.min(7, x * 10)));
    rx.set(Math.max(-7, Math.min(7, -y * 10)));
    frame.current.style.setProperty("--px", `${(x + 0.5) * 100}%`);
    frame.current.style.setProperty("--py", `${(y + 0.5) * 100}%`);
  };

  return (
    <div className="featured" data-featured onPointerMove={tilt} onPointerLeave={() => { rx.set(0); ry.set(0); }}>
      <ol className="featured-list">
        {PROJECTS.map((project) => (
          <li key={project.id}>
            <a href={project.href} data-preview={project.id} data-cursor="View" className={project.id === current ? "is-current" : undefined}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setCurrent(project.id); }}
              onPointerDown={(event) => { touched.current = event.pointerType === "touch"; }}
              onFocus={() => { if (!touched.current) setCurrent(project.id); }}
              onClick={(event) => { if (touched.current && project.id !== current) { event.preventDefault(); setCurrent(project.id); } touched.current = false; }}>
              <span className="f-code">{project.code}</span><span className="f-title">{project.title}</span><span className="f-kind">{project.kind}</span><span className="f-arrow" aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="featured-preview" aria-hidden="true">
        <motion.div ref={frame} className="preview-frame" style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}>
          <AnimatePresence initial={false}>
            <motion.div key={current} className="preview is-active" data-preview-panel={current}
              initial={hydrated && !reduced ? { clipPath: "inset(100% 0% 0% 0%)", zIndex: 2 } : false}
              animate={{ clipPath: "inset(0% 0% 0% 0%)", zIndex: 2, transition: { duration: 0.75, ease } }}
              exit={{ zIndex: 1, transition: { duration: 0.75 } }}>
              <motion.div className="preview-body" initial={hydrated && !reduced ? "hidden" : false} animate="shown"
                variants={{ shown: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}>
                {PANELS[current]}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <p className="preview-hint"><span>{String(index + 1).padStart(2, "0")}</span> / {String(PROJECTS.length).padStart(2, "0")} · hover, tab or tap a title</p>
      </div>
    </div>
  );
}
