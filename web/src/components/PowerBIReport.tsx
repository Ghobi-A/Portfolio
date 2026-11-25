import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useHydrated, useReduced } from "../lib/hooks";
import { POWER_BI_REPORT_URL, REPORT_CARDS, REPORT_PAGES, safeReportUrl } from "../lib/powerbi";

const ease = [0.23, 1, 0.32, 1] as const;
type View = "report" | "snapshot";

/**
 * The UK Asia Grill evidence figure: the owner's native Power BI report, plus the
 * observed SQL snapshot it reconciles to.
 *
 * The report is third-party (Microsoft) and heavy, so it is click-to-load: the
 * preview shows its four pages and the six headline cards as published, and one
 * click mounts the live iframe. "Expand" widens the figure across the project for
 * a readable report; "Open full screen" works without JavaScript.
 */
export default function PowerBIReport() {
  const hydrated = useHydrated();
  const reduced = useReduced();
  const url = safeReportUrl(POWER_BI_REPORT_URL);
  const [view, setView] = useState<View>("report");
  const [load, setLoad] = useState<"idle" | "loading" | "ready">("idle");
  const [expanded, setExpanded] = useState(false);
  const transition = reduced ? { duration: 0 } : { duration: 0.5, ease };

  return (
    <motion.figure layout={hydrated && !reduced} transition={transition}
      className={`evidence-panel pbi${expanded ? " is-expanded" : ""}`} aria-labelledby="pbi-title">
      <div className="pbi-head">
        <p className="panel-title eyebrow" id="pbi-title">Fig. 07 / Power BI report &amp; SQL snapshot</p>
        <div className="pbi-actions">
          {hydrated && url && view === "report" && (
            <button type="button" className="pbi-expand" aria-pressed={expanded} onClick={() => setExpanded((was) => !was)}>
              {expanded ? "Collapse" : "Expand"} <span aria-hidden="true">{expanded ? "↙" : "↗"}</span>
            </button>
          )}
          {url && <a className="pbi-open" href={url} target="_blank" rel="noopener noreferrer">Open full screen <span aria-hidden="true">↗</span></a>}
        </div>
      </div>

      <div className="pbi-tabs" role="group" aria-label="Choose a view" hidden={!hydrated}>
        {(["report", "snapshot"] as const).map((id) => (
          <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>
            {id === "report" ? "Power BI report" : "SQL snapshot"}
            {view === id && <motion.i className="pbi-underline" layoutId="pbi-underline" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
          </button>
        ))}
        <a href="projects/restaurant-analytics/dashboard/index.html">Browser dashboard <span aria-hidden="true">↗</span></a>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === "report" ? (
          <motion.div key="report" className={`pbi-stage is-${load}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}>
            {load === "idle" && (
              <div className="pbi-preview">
                <p className="pbi-kicker">UK Asia Grill · four pages · native Power BI</p>
                <dl className="pbi-cards">
                  {REPORT_CARDS.map(([label, value], index) => (
                    <motion.div key={label} initial={hydrated && !reduced ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease, delay: index * 0.05 }}>
                      <dt>{label}</dt><dd>{value}</dd>
                    </motion.div>
                  ))}
                </dl>
                <ol className="pbi-pages" aria-label="Report pages">
                  {REPORT_PAGES.map((page, index) => <li key={page}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{page}</li>)}
                </ol>
                {hydrated && url ? (
                  <button type="button" className="button primary pbi-load" onClick={() => setLoad("loading")}>
                    Load the interactive report <span aria-hidden="true">→</span>
                  </button>
                ) : url ? (
                  <a className="button primary pbi-load" href={url} target="_blank" rel="noopener noreferrer">Open the interactive report <span aria-hidden="true">↗</span></a>
                ) : null}
                <p className="pbi-note">Loads Microsoft Power BI from app.powerbi.com. Slicers, cross-filtering and page tabs work inside the report.</p>
              </div>
            )}
            {load !== "idle" && url && (
              <iframe title="UK Asia Grill native Power BI report (Microsoft Power BI)" src={url} allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                onLoad={() => setLoad("ready")} />
            )}
            {load === "loading" && <div className="pbi-loading" role="status"><span />Loading the Power BI report…</div>}
          </motion.div>
        ) : (
          <motion.div key="snapshot" className="pbi-snapshot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}>
            <a href="projects/restaurant-analytics/dashboard/index.html" aria-label="Open the restaurant analytics dashboard">
              <img src="projects/restaurant-analytics/observed-summary.svg" alt="Observed order value and preparation metrics from 53 operational records" width={1086} height={936} loading="lazy" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Before hydration (and without JavaScript) the SQL snapshot is shown too. */}
      {!hydrated && (
        <div className="pbi-snapshot">
          <img src="projects/restaurant-analytics/observed-summary.svg" alt="Observed order value and preparation metrics from 53 operational records" width={1086} height={936} loading="lazy" />
        </div>
      )}

      <figcaption>
        The report&rsquo;s six Executive-overview cards match the observed SQL snapshot (53 mixed-status orders, snapshot 19 October 2026). Gross order value is not audited revenue; DAX measures beyond those cards are not independently reconciled. The browser dashboard is a separate implementation with its own labelled scale scenario.
      </figcaption>
    </motion.figure>
  );
}
