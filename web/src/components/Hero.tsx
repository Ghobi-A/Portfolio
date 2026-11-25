import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  BUDGETS, MODES, QUEUE_COPY, QUEUE_HITS, REFERENCE_AUC, STEPS, strip, three, type Mode,
} from "../lib/bench";
import { useHydrated, useReduced } from "../lib/hooks";
import DecryptedText from "../reactbits/DecryptedText";
import RotatingText from "../reactbits/RotatingText";
import Magnet from "../reactbits/Magnet";
import SpecLine from "./SpecLine";

// Three.js only loads in the browser, after first paint.
const SlatField = lazy(() => import("./SlatField"));

const THESIS = "systems you can interrogate.";
const EMAIL = "mailto:ghobikan15@hotmail.co.uk";
const ease = [0.23, 1, 0.32, 1] as const;

/** Keyboard pattern shared by the bench's button groups. */
function arrowKeys(count: number, current: number, select: (index: number) => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let next: number | null = null;
    if (event.key in moves) next = (current + moves[event.key] + count) % count;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = count - 1;
    if (next === null) return;
    event.preventDefault();
    select(next);
    const group = event.currentTarget.parentElement;
    (group?.querySelectorAll<HTMLElement>("button")[next])?.focus();
  };
}

export default function Hero() {
  const hydrated = useHydrated();
  const reduced = useReduced();
  const surface = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("research");
  const [budget, setBudget] = useState(0);
  const [order, setOrder] = useState<"random" | "ranked">("ranked");
  const [step, setStep] = useState(0);
  const [hasField, setHasField] = useState(false);
  const [fieldReady, setFieldReady] = useState(false);
  const orderTouched = useRef(false);
  const visited = useRef(new Set<Mode>(["research"]));
  const [status, setStatus] = useState("");

  useEffect(() => setHasField(document.documentElement.classList.contains("has-field")), []);

  const modeIndex = MODES.findIndex((item) => item.id === mode);
  const selectMode = (index: number) => {
    const next = MODES[index].id;
    setMode(next);
    // First visit to Applications: show random order, then the ranking, once.
    if (next === "applications" && !visited.current.has(next) && !reduced && !orderTouched.current) {
      setOrder("random");
      window.setTimeout(() => { if (!orderTouched.current) setOrder("ranked"); }, 1100);
    }
    visited.current.add(next);
  };
  const selectBudget = (index: number) => {
    setBudget(index);
    const b = BUDGETS[index];
    setStatus(`ε ${b.epsilon}: mean ROC-AUC ${three(b.auc)}, 95% t interval ${three(b.low)} to ${three(b.high)}, ${three(REFERENCE_AUC - b.auc)} below the non-private reference.`);
  };
  const selectOrder = (index: number) => { orderTouched.current = true; setOrder(index === 0 ? "random" : "ranked"); };

  const b = BUDGETS[budget];
  const hits = QUEUE_HITS[order];
  // Panels: all three are in the prerendered HTML; once hydrated only the active one shows.
  const panelProps = (id: Mode) => ({
    id: `lab-${id}`,
    className: "lab-panel",
    "data-panel": id,
    ...(hydrated ? { role: "tabpanel", "aria-labelledby": `tab-${id}`, hidden: mode !== id } : { "aria-labelledby": `lab-${id}-title` }),
  });
  // Re-key the active panel's body so Motion plays its entrance on every switch.
  const bodyKey = (id: Mode) => (hydrated && mode === id ? `on-${id}` : "off");
  const body = (id: Mode) => ({
    initial: hydrated && !reduced ? { opacity: 0, y: 14 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease, staggerChildren: 0.04 },
  });

  return (
    <section ref={surface} className={`hero recruiter-intro${hydrated ? " lab-enhanced" : ""}`} data-lab data-mode={mode} aria-labelledby="identity">
      <div className="hero-meta">
        {[["Index", "GA—00"], ["Practice", "Applied data science & ML engineering"], ["Based", "London, UK"], ["Evidence", "Reviewed 19 Oct 2026"]].map(([label, value]) => (
          <p key={label}><span>{label}</span>{value}</p>
        ))}
      </div>
      <h1 id="identity" className="hero-name"><span className="name-line">Ghobikan</span> <span className="name-line">Aravindan<span className="name-dot">.</span></span></h1>
      <div className="hero-brief">
        <div className="hero-thesis">
          <SpecLine a="Signal" b="System" />
          <p className="verbs"><em>Collect</em> <em>Evaluate</em> <em>Ship</em></p>
          <p className="stage-thesis">From messy signals to{" "}
            {hydrated && !reduced ? (
              // React Bits RotatingText: plays through once and stops on the canonical line,
              // which is also what the prerendered page and reduced motion show.
              <RotatingText texts={[THESIS, "models you can audit.", "evidence you can inspect.", "products people use.", THESIS]}
                loop={false} rotationInterval={2100} effect="blur" staggerDuration={0.014} animatePresenceInitial={false}
                mainClassName="thesis-rotate" />
            ) : <span className="thesis-rotate">{THESIS}</span>}
          </p>
          <p className="stage-description">I use Python and SQL to investigate operational data, evaluate machine-learning models and build usable data products.</p>
          <div className="actions intro-actions">
            {[["#projects", "Explore selected work"], ["assets/Ghobikan-Aravindan-CV.pdf", "Download CV"], [EMAIL, "Let’s talk"]].map(([href, label]) => (
              <Magnet key={href} padding={40} magnetStrength={4} maxOffset={14} wrapperClassName="magnet">
                <a className="plus-link" href={href}><span aria-hidden="true">+</span> {label}</a>
              </Magnet>
            ))}
          </div>
        </div>

        <div className="instrument" aria-hidden="true">
          <div className="instrument-head">
            <span>{hydrated ? <DecryptedText text="Fig. 00 / Live bench" animateOn="view" sequential speed={40} characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ" /> : "Fig. 00 / Live bench"}</span>
            <span><span data-lab-count>{String(modeIndex + 1).padStart(2, "0")}</span> / 03</span>
          </div>
          <div className={`lab-scene signal-field${fieldReady ? " is-ready" : ""}`} data-cursor="Pulse">
            {hydrated && hasField && (
              <Suspense fallback={null}>
                <SlatField mode={mode} noise={b.noise} ranked={order === "ranked"} step={step} reduced={reduced} surface={surface} onReady={() => setFieldReady(true)} />
              </Suspense>
            )}
            <div className="scene-fallback" />
          </div>
          <p className="instrument-legend">Every slat follows the bench. It illustrates; it is not data. Click to send a pulse.</p>
        </div>

        <div className="lab" aria-labelledby="lab-title">
          <div className="lab-head">
            <p id="lab-title" className="lab-title">The bench <span>Three experiments from the work below. Every number is measured; the field beside it follows your choice.</span></p>
            <div className="lab-tabs" role="tablist" aria-labelledby="lab-title" hidden={!hydrated}>
              {MODES.map((item, index) => (
                <button key={item.id} type="button" role="tab" id={`tab-${item.id}`} aria-selected={mode === item.id} aria-controls={`lab-${item.id}`}
                  tabIndex={mode === item.id ? 0 : -1} data-mode={item.id} onClick={() => selectMode(index)} onKeyDown={arrowKeys(MODES.length, modeIndex, selectMode)}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.label}
                  {mode === item.id && <motion.i className="tab-underline" layoutId="tab-underline" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                </button>
              ))}
            </div>
          </div>

          <section {...panelProps("research")}>
            <motion.div key={bodyKey("research")} {...body("research")}>
              <p className="panel-kicker">Research · differential privacy</p>
              <h2 id="lab-research-title">How much accuracy survives a formal privacy guarantee?</h2>
              <div className="lab-choice eps-controls" role="group" aria-label="Privacy budget" hidden={!hydrated}>
                {BUDGETS.map((item, index) => (
                  <button key={item.epsilon} type="button" aria-pressed={budget === index} onClick={() => selectBudget(index)} onKeyDown={arrowKeys(BUDGETS.length, budget, selectBudget)}>{`ε ${item.epsilon}`}</button>
                ))}
              </div>
              <div className="eps-readout">
                <p className="eps-value">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={b.auc} initial={{ y: "40%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-40%", opacity: 0 }} transition={{ duration: 0.35, ease }} style={{ display: "inline-block" }}>{three(b.auc)}</motion.span>
                  </AnimatePresence>
                  <small>{`mean ROC-AUC at ε ${b.epsilon}`}</small>
                </p>
                <dl className="eps-facts">
                  <div><dt>95% t interval</dt><dd>{`${three(b.low)}–${three(b.high)}`}</dd></div>
                  <div><dt>Below non-private HGB</dt><dd>{three(REFERENCE_AUC - b.auc)}</dd></div>
                </dl>
              </div>
              <svg className="eps-strip" viewBox="0 0 320 58" aria-hidden="true">
                <path className="eps-axis" d="M10 40H310" />
                <path className="eps-ticks" d="M10 36V44M52.9 36V44M95.7 36V44M138.6 36V44M181.4 36V44M224.3 36V44M267.1 36V44M310 36V44" />
                <text x="10" y="56">.90</text><text x="295" y="56">.97</text>
                <path className="eps-ref" d="M237.1 4V40" /><text className="eps-ref-label" x="233" y="10" textAnchor="end">non-private .953</text>
                <motion.rect className="eps-interval" y="20" height="10" rx="5" initial={false}
                  animate={{ x: strip(b.low), width: strip(b.high) - strip(b.low) }} transition={{ duration: 0.6, ease }} />
                <motion.circle className="eps-dot" cy="25" r="6" initial={false} animate={{ cx: strip(b.auc) }} transition={{ type: "spring", stiffness: 260, damping: 22 }} />
              </svg>
              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status}</p>
              <p className="panel-note">Five seeds on 1,338 public teaching records, δ 10⁻⁵. Lower ε is stronger privacy, so the field gets noisier.</p>
              <a className="panel-link" href="#file-dp">Privacy &amp; utility audit <span aria-hidden="true">→</span></a>
            </motion.div>
          </section>

          <section {...panelProps("applications")}>
            <motion.div key={bodyKey("applications")} {...body("applications")}>
              <p className="panel-kicker">Applications · NLP ranking</p>
              <h2 id="lab-applications-title">Which fan comments deserve a human reviewer first?</h2>
              <div className="lab-choice queue-controls" role="group" aria-label="Review order" hidden={!hydrated}>
                {(["random", "ranked"] as const).map((item, index) => (
                  <button key={item} type="button" aria-pressed={order === item} onClick={() => selectOrder(index)} onKeyDown={arrowKeys(2, order === "random" ? 0 : 1, selectOrder)}>{item === "random" ? "Random order" : "Model ranking"}</button>
                ))}
              </div>
              <div className="queue" aria-hidden="true">
                {Array.from({ length: 20 }, (_, index) => (
                  <motion.i key={index} className={(hits as readonly number[]).includes(index) ? "is-hit" : undefined}
                    animate={hydrated && !reduced ? { scale: (hits as readonly number[]).includes(index) ? 1 : 0.86 } : undefined}
                    transition={{ type: "spring", stiffness: 380, damping: 18, delay: index * 0.02 }} />
                ))}
              </div>
              <p className="queue-readout" role="status" aria-live="polite" aria-atomic="true"><strong>{QUEUE_COPY[order][0]}</strong> <span>{QUEUE_COPY[order][1]}</span></p>
              <dl className="panel-metrics">
                <div><dt>Actionable PR-AUC</dt><dd>0.65 <small>prevalence 0.30</small></dd></div>
                <div><dt>Lift at top 10%</dt><dd>2.5× <small>interval 2.1–3.3</small></dd></div>
              </dl>
              <p className="panel-note">Expected counts: prevalence × Lift@10%. Out-of-fold development evaluation on 200 labels from one annotator.</p>
              <a className="panel-link" href="#file-kh4">NLP evaluation <span aria-hidden="true">→</span></a>
            </motion.div>
          </section>

          <section {...panelProps("systems")}>
            <motion.div key={bodyKey("systems")} {...body("systems")}>
              <p className="panel-kicker">Systems · production ordering</p>
              <h2 id="lab-systems-title">When does a restaurant order become a paid order?</h2>
              <ol className="lifecycle">
                {STEPS.map((item, index) => (
                  <li key={item.label} className={[index === step ? "is-active" : "", "critical" in item ? "is-critical" : ""].join(" ").trim() || undefined}>
                    <button type="button" aria-pressed={index === step} onClick={() => setStep(index)} onKeyDown={arrowKeys(STEPS.length, step, setStep)}>
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.label}
                    </button>
                    <motion.p key={hydrated && index === step ? `on-${index}` : "off"} initial={hydrated && !reduced && index === step ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>{item.text}</motion.p>
                  </li>
                ))}
              </ol>
              <p className="panel-note">Implemented architecture of a deployed site, not a transaction-volume claim.</p>
              <a className="panel-link" href="#GA-RA-07">Restaurant operations <span aria-hidden="true">→</span></a>
            </motion.div>
          </section>
        </div>
      </div>
    </section>
  );
}
