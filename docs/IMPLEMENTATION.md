# Portfolio implementation

## Gallery Proof completion — 20 October 2026

This section supersedes the older visual and browser-validation notes below, which remain as history. The approved implementation is code-led Study Gallery structure with Proof Print colors, a project-first opening, self-hosted Source Serif 4 and compact GitHub source buttons. No framework, server-side API, remote animation library or hosting change was added.

The three measured privacy settings are selectable by pointer or keyboard. A monotone smooth guide and pink interval envelope join the observed values; the note explicitly distinguishes these from new observations or interval estimates. The full 0–1 axis toggle updates its caption. Native disclosures preserve all case studies, and metadata now lists eight projects including the separate restaurant analytics/engineering entries and Semantic Drift.

The supplied Hollow Court image replaces the previous Crestbound route image. Semantic Drift follows Audio Lab with a three-condition, six-generation protocol diagram and explicit pre-data status. Restaurant case study, observed-aggregate dashboard and methodology surfaces use the same palette; a visible return link remains available on phones.

Native WAAPI draws the chart guide once, acknowledges selection, and sequences ordered system steps. No section is hidden before enhancement. Motion cancels when the document hides or the user requests reduced motion. Chart points remain visible throughout. The previous GSAP import and dependency are absent from the page.

Validation: 13 structural tests and three JavaScript syntax checks pass. Offline Chromium browser tests cover the chart's three selections, arrow keys, full-axis toggle, seven disclosures, mobile menu/Escape, image decoding, compact icon dimensions, four dashboard tabs and responsive overflow. Main captures: 1440px desktop, 390px mobile, 320px narrow phone and 1732px opening. The in-app HTTP preview is refreshed at `http://127.0.0.1:55011/`. Browser test evidence and captures live in `.impeccable/review/`. No Lighthouse score, physical-device performance guarantee, deployment or experiment rerun is claimed.

The independent review/documentation agents exhausted their available usage; the finish review and design-system documentation were completed inline. DESIGN.md and its schema-v2 sidecar describe the implemented system, not the superseded comp. Asset origins are recorded in sidecars. The site remains local until an explicit publish request.

Final link probe: 19 of 23 unique HTTPS destinations returned 200, including both Semantic Drift links, the Crestbound playable page and restaurant site. Three Streamlit destinations returned 303 provider responses and LinkedIn returned 999; those four remain unverified, not proven broken. Final browser checks additionally pass all seven disclosure deep links, no-JS navigation/exact values/native disclosures, aggregate export, and overflow at 768/1024/1250/1920px. The 320px full-page capture was stitched from unmodified native viewport captures to avoid Chromium's long-page paint limit.

## Follow-up evidence and motion pass — 9 September 2026

Continues the merged redesign on `portfolio/evidence-motion-pass`, without changing the build or deployment architecture. The current main branch already has balanced figure markup; a strict explicit-tag nesting regression now guards against the previously reported stray closing tag.

- New measured partition-scaling SVG and visible numeric table from the committed Big-Data CSV; local and Spark series differ by line style as well as colour.
- New training-time comparison makes the gap between standalone input gain and epoch time explicit.
- New group split, evaluation-boundary, stateful combat, trust-boundary, audit-question and MIDI pipeline diagrams. Architecture diagrams do not imply measured outcomes.
- KH4 open PR scope updated from fresh GitHub metadata, preserving demo-only and non-representative sample caveats.
- Dark-ink contact composition with a real email CTA, improved evidence-note legibility, always-visible privacy values, responsive single-column diagram layouts, focus-out mobile menu closure and one-shot staged graph/node motion.
- No dependencies, raster images, backend, client data fetching or framework introduced. CV, metadata region, social asset generation, deployment workflows and legacy anchors retained unchanged.

Validation: build, all 11 structural tests, both JavaScript syntax checks and `git diff --check` pass. The tests include explicit markup nesting, generated asset existence, CV identity, headings, anchors/ARIA references, metadata idempotence and external-link attributes. Source review confirms reduced-motion and no-JS fallbacks. Actual browser viewport/keyboard/console/animation and Lighthouse checks remain outstanding because the supported preview does not serve this plain-static checkout; no scores or browser pass are claimed. Keep the PR draft until that release gate is completed.

## Original audit

The original tracked repository comprised `index.html`, the CV PDF, README, `scripts/build_site.py` and the Pages deployment workflow. The source embedded styling, GSAP choreography and accordion logic in one HTML file. Project content was primarily behind uniform collapsible rows; mobile relied on a 720px breakpoint. GSAP entrance motion, CSS transitions and a reduced-motion query existed. The build injected landmarks, a skip link, structured metadata and external-link safety using exact source-string replacements.

The old build depended on the precise viewport tag, six metadata tags, an `a { color: inherit; }` rule, the body/noise opening, the hero section opening, and the contact footer boundary. Restructuring those without changing the build would have failed. Generated PNG/social assets, sitemap, robots, favicon, touch icon, CV copy and Pages `_site` deployment are retained.

## Architecture

- `index.html`: readable semantic content, SVG evidence and six native `details` case studies. No client-side rendering or fetch is needed for any project content.
- `assets/css/site.css`: tokens, editorial layout, shared evidence grammar, components and responsive/reduced-motion/print rules.
- `assets/js/main.js`: optional mobile menu, active-section observer, compact header, interruptible disclosure transitions and stable legacy case hashes.
- `assets/js/motion.js`: isolated optional GSAP choreography; all content is visible by default. No ScrollTrigger dependency, continuous render loop or scroll hijacking.
- `scripts/build_site.py`: named metadata region instead of layout string patches; copies static CSS/JS and preserves generated brand assets. External-link security is enforced even on links already specifying `target`.
- `scripts/test_site.py`: standard-library structural regressions.
- `scripts/check_links.py`: opt-in, read-only external HTTP probe with explicit blocked/unknown reporting.
- PR validation builds and retains `_site` as an Actions artifact. Main deployment validates before publishing to Pages.

## Visual and content changes

The hero has a name-led editorial composition and a conceptual signal/holdout instrument. Five large project sections expose problem, evidence, stack and direct links before any disclosure. Their distinct diagrams explain classifier guardrails, measured throughput, simulation/game shared data, order state and a privacy–utility frontier. Capability links lead to actual case evidence. The audio experiment has its own current-to-intended scope treatment. Education stays concise; contact gets a deliberate final composition.

All metrics and PR distinctions have a source trail in `EVIDENCE.md`. No project repository was edited. This is not a new framework, SPA or replacement hosting setup.

## Accessibility and performance design

Native landmarks, one h1, ordered headings, skip link, visible focus, labelled meaningful SVGs, semantic tables and native keyboard disclosures. Mobile navigation is only collapsed after JavaScript attaches; without JavaScript it remains visible. Escape closes the enhanced menu and restores its trigger. Case headings retain native keyboard activation, and ARIA expanded state follows transitions. Motion preference changes cancel ongoing disclosure transitions and revert GSAP styles.

No hidden CSS entrance states, huge raster images, blur effects, canvas loop or new application dependencies. GSAP is retained as an optional deferred dependency, with IntersectionObserver for one-shot reveals. Height measurement/animation is confined to user-triggered disclosures; other motion uses transforms, opacity and SVG stroke. Fonts use `display=swap` and system fallbacks. Exact font-induced layout shift and 60fps cannot be guaranteed without browser measurement.

## Verification boundaries

Local build, structural tests, syntax checks and HTTP checks are executed separately. Structural checks are not keyboard, visual, Lighthouse or responsive-browser tests.

The available cloud browser could not access the local static server. The supported Sites preview does not support a plain-static project, so no alternate browser-control path or framework was introduced merely to bypass that restriction. Do not label this browser-approved or claim Lighthouse scores.

Before release, inspect 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px widths; expand every case; navigate by Tab/Enter/Space/Escape; reload each `#GA-*` hash; disable JS and GSAP; enable reduced motion; check console, horizontal overflow, fonts, charts, local CV, generated social assets and `/Portfolio/` asset paths. Run Lighthouse in a normal browser and record results rather than estimating them.

The implementation can be reviewed in a PR without changing the live site. The user's requested browser-validation gate remains a release condition.

### Recorded local checks — 9 September 2026

- Build and nine structural regressions passed, including idempotent metadata generation, legacy anchors, ARIA targets, local assets under the Pages prefix, the unchanged CV PDF, social PNG dimensions, heading levels and external-link security.
- Both JavaScript modules passed Node syntax checks.
- External HTTP checks: 12 of 16 unique destinations returned HTTP 200 (public GitHub repos/PRs, Crestbound prototype and restaurant site). Two Streamlit destinations returned redirect responses, the Crestbound dashboard timed out, and LinkedIn returned 999. Those four remain unverified; no URL returned 404 or 410.
- The original dissertation link was separately checked with an HTTP HEAD request (200) and retained as a historical-paper link, distinct from the current audit results.
- No project experiments, live payment flows or physical printing were executed as part of this portfolio change.
