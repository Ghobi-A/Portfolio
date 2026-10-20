# Interactive editorial refinement — 20 October 2026

## Scope and baseline

Implemented locally on `codex/interactive-editorial`, created from `main` at `efc62a0`. The approved, pre-existing uncommitted Gallery Proof implementation was preserved. Nothing was reset, stashed, pushed, merged or deployed. The working tree includes the earlier approved design work; this branch is not presented as a clean PR containing only this follow-up.

Before captures and measurements use an unchanged copy of that local generated site, served at `/baseline/` on a separate local test port. They do not compare against the older public site or pretend to measure PR #5 in isolation.

## Audit of PR #5 and current code

[PR #5](https://github.com/Ghobi-A/Portfolio/pull/5), “Make the dossier interactive with chart inspection and staged motion”, was open/draft when inspected. Head: `fd0588f1819841957aa33e81f846c3ef4db7395e`, branch `portfolio/interactive-dossier`, four changed files. Its useful contributions were stage inspection sourced from native content, partition controls sourced from the visible data table, reading progress and shared motion timing. Browser interaction and Lighthouse acceptance were explicitly unexecuted in that PR.

The local portfolio has since replaced that PR's name-led hero and GSAP import with the approved project-led gallery and native WAAPI. Its old `.hero h1` / `.hero-instrument` choreography cannot be transplanted without restoring a discarded layout. This implementation adapts the inspector/progress algorithms to the current selectors and keeps one implementation of each. No GSAP dependency was reintroduced merely to reproduce capabilities the native browser already provides.

Inspected: `index.html`, `assets/css/site.css`, `assets/js/main.js`, `assets/js/motion.js`, the privacy module, build script and Pages/validation workflows. The static build and hosting architecture are unchanged.

## Motion and interaction strategy

- One authored first-view moment: line-by-line headline construction and the existing privacy guide/envelope. Skip the opening on deep links. Measured points and exact values remain available.
- Inspectable classifiers, validation stages, privacy audit distinctions, combat state and payment lifecycle. Controls highlight a real diagram node and announce its existing explanation; no new metrics or architecture claims.
- Four-setting Spark/local comparison. Controls and SVG marks select the corresponding authored table row and announce its exact rates. Local marks are derived from the same table, with the original zero-based scale. This remains single-runner/local-mode evidence, not cluster-scaling evidence.
- Sticky, unchanged-height navigation and a thin progress rule, updated in one scheduled animation frame. Layout reads are grouped before the transform write. No polling, scroll hijacking, parallax or custom cursor.
- Fast selection feedback, visible focus and 44px-high controls. Arrow/Home/End navigation supplements native Enter/Space activation. Case disclosures remain native and support stable hashes.
- Reduced motion retains immediate selected states and complete content; preference changes/hidden documents cancel motion. Rapid replacement cancels older animations on the same element. No default-hidden sections or repeated generic fade-up choreography.

## Performance work

Source Serif 4 was mechanically subset, retaining all source-supported characters present in authored HTML/JS and the ASCII range. The family, optical/weight axes and actual glyph outlines are preserved. Downloaded regular/italic payload fell from **406,144 to 232,548 bytes**, a **42.7% reduction**. Full original fonts and the OFL license are retained.

Mobile navigation now bootstraps immediately after the header, before the main document is parsed. This removes the late expanded-to-collapsed layout change without hiding no-JS navigation. The enhanced mobile menu overlays rather than pushes the main content. Desktop/header dimensions do not animate.

## Executed browser measurements

Lighthouse **13.5.0**, dedicated headless Chrome **155.0.8059.80**, served over local HTTP. Lighthouse's automatic Chrome launch initially failed; the successful runs reused a dedicated Playwright-launched debugging port. No failed run is reported as a pass.

The table records one baseline run and the final after run per form factor, not a median or field percentile. Intermediate development runs were not used as a best-score selection. The server is Python's uncompressed static server; these are not deployed GitHub Pages network measurements.

| Measurement | Before desktop | After desktop | Before mobile | After mobile |
| --- | ---: | ---: | ---: | ---: |
| Performance | 98 | 100 | 80 | 89 |
| Accessibility | 100 | 100 | 100 | 100 |
| Best practices | 100 | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 | 100 |
| First contentful paint | 565 ms | 529 ms | 2,436 ms | 2,269 ms |
| Largest contentful paint | 845 ms | 689 ms | 4,386 ms | 3,394 ms |
| Total blocking time | 0 ms | 0 ms | 0 ms | 0 ms |
| Cumulative layout shift | 0.061 | 0 | 0.090 | 0 |

Mobile profile: 412×823, simulated 150ms RTT, 1,638.4Kbps throughput and 4× CPU slowdown. Mobile LCP remains above the 2.5-second good threshold. The remaining lab opportunities include compression/cache headers and CSS/font delivery; no production host settings were changed.

Separate interaction test: 390×844 Chromium, actual 4× CDP CPU throttling, motion enabled, 16 benchmark selections. **435 frame-interval samples**, median **7ms**, p95 **14ms**, two intervals over **33.4ms**; **zero long tasks over 50ms**. Of 48 reported Event Timing entries, p95 duration was **64ms**. These are frame/event samples from one controlled run—not a GPU dropped-frame count, field INP or physical mid-range handset result.

## Accessibility and functional acceptance

axe-core **4.14.0**, WCAG 2 A/AA, 2.1 AA and 2.2 AA tags: **0 automated violations**, 34 passing checks, both desktop (all seven studies opened) and mobile. Two pre-existing unlabelled generic-container issues were corrected by adding `role="group"` to the split rail and MIDI flow. SVG/background contrast remains an automated incomplete check; token-based WCAG contrast calculations supplement it rather than hiding that limitation. Checked text combinations range from **5.94:1 to 15.21:1**; this is not a complete manual WCAG certification or screen-reader audit.

Executed:

- Fourteen standard-library structural regressions; three JavaScript syntax checks; `git diff --check`.
- Three privacy settings and full/truncated axis toggle.
- Four table-backed benchmark settings, SVG selection, arrow keys and Home/End.
- Classifier, formal/empirical audit, combat and payment-stage selection.
- All seven disclosure hashes; no-JS navigation, original exact values/table and native disclosures.
- No horizontal overflow at 320, 390, 768, 1024, 1440 and 1920px; controls at least 44px high.
- No-shift mobile menu, Escape and focus return; sticky header and progress.
- Reduced-motion preference changed mid-disclosure: inline heights cleared and running spatial animations cancelled.
- Zero page JavaScript errors in the interaction suite.

## Visual evidence and recording

Before/after desktop and mobile opening captures, plus benchmark detail captures, were taken from the actual browser. The 1440×1000 reduced-motion desktop opening is pixel-identical before/after: the identity and resting composition were not redesigned. A roughly 14-second MP4 was generated from native CDP browser screencast frames; it shows privacy selection, architecture/study exploration and partition comparison, not a simulated mockup. Representative frames were visually inspected.

The handoff artifacts include the screenshots, MP4, Lighthouse HTML/JSON reports, axe reports, interaction results and contrast calculations. Development-only dependencies, baseline copy, generated frames and helper reports are under ignored `work/modernization/`; none ships in `_site`.

## Remaining boundaries

No physical phone, Safari/Firefox/device matrix, real assistive-technology audit, field Core Web Vitals or deployed-cache test was performed. Third-party Streamlit/LinkedIn availability is independent of the local interaction tests. No underlying ML experiments, private database, live payments or hardware printing were rerun. Existing project maturity and evidence caveats remain unchanged. Measurements were completed locally before publication; the user subsequently authorised committing and pushing the finished site to main. PR #5 was inspected but not modified.
